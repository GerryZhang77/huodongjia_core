/**
 * 报名筛选工具函数
 *
 * 提供筛选选项计算和筛选逻辑应用的核心功能
 * 支持标准字段和自定义字段的动态处理
 */

import type {
  Enrollment,
  FilterCriteria,
  FilterOptions,
  EnrollmentStatus,
  Gender,
} from "@/types/enrollment";
import { STATUS_LABELS, GENDER_LABELS } from "@/types/enrollment";

/**
 * 计算筛选选项
 *
 * 从报名列表中提取所有可用的筛选选项和计数
 * 自动检测自定义字段并生成对应的筛选选项
 *
 * @param enrollments - 报名列表
 * @returns 筛选选项对象
 *
 * @example
 * ```typescript
 * const enrollments = [...];
 * const options = calculateFilterOptions(enrollments);
 * // options.customFields 可能包含：
 * // {
 * //   "VIP等级": [{ value: "金卡", label: "金卡", count: 5 }],
 * //   "推荐人": [{ value: "张三", label: "张三", count: 3 }]
 * // }
 * ```
 */
export function calculateFilterOptions(
  enrollments: Enrollment[]
): FilterOptions {
  // 初始化计数器
  const counters = {
    status: new Map<EnrollmentStatus, number>(),
    gender: new Map<Gender, number>(),
    ageGroup: new Map<string, number>(),
    industry: new Map<string, number>(),
    tags: new Map<string, number>(),
    city: new Map<string, number>(),
    // 自定义字段使用嵌套 Map: 字段名 -> (字段值 -> 计数)
    customFields: new Map<string, Map<string, number>>(),
  };

  // 遍历所有报名，统计各维度的值和计数
  enrollments.forEach((enrollment) => {
    // 1. 统计状态
    if (enrollment.status) {
      counters.status.set(
        enrollment.status,
        (counters.status.get(enrollment.status) || 0) + 1
      );
    }

    // 2. 统计性别
    if (enrollment.gender) {
      counters.gender.set(
        enrollment.gender,
        (counters.gender.get(enrollment.gender) || 0) + 1
      );
    }

    // 3. 统计年龄段
    if (enrollment.ageGroup) {
      counters.ageGroup.set(
        enrollment.ageGroup,
        (counters.ageGroup.get(enrollment.ageGroup) || 0) + 1
      );
    }

    // 4. 统计行业
    if (enrollment.industry) {
      counters.industry.set(
        enrollment.industry,
        (counters.industry.get(enrollment.industry) || 0) + 1
      );
    }

    // 5. 统计标签
    if (enrollment.tags && enrollment.tags.length > 0) {
      enrollment.tags.forEach((tag) => {
        counters.tags.set(tag, (counters.tags.get(tag) || 0) + 1);
      });
    }

    // 6. 统计城市
    if (enrollment.city) {
      counters.city.set(
        enrollment.city,
        (counters.city.get(enrollment.city) || 0) + 1
      );
    }

    // 7. 统计自定义字段
    if (enrollment.customFields) {
      Object.entries(enrollment.customFields).forEach(
        ([fieldName, fieldValue]) => {
          // 跳过空值
          if (
            fieldValue === null ||
            fieldValue === undefined ||
            fieldValue === ""
          ) {
            return;
          }

          // 确保该字段的计数器存在
          if (!counters.customFields.has(fieldName)) {
            counters.customFields.set(fieldName, new Map<string, number>());
          }

          // 获取该字段的值计数器
          const fieldCounter = counters.customFields.get(fieldName)!;

          // 将值转换为字符串（统一格式）
          const valueStr = String(fieldValue);

          // 更新计数
          fieldCounter.set(valueStr, (fieldCounter.get(valueStr) || 0) + 1);
        }
      );
    }
  });

  // 转换 Map 为数组格式
  const options: FilterOptions = {
    // 状态选项
    status: Array.from(counters.status.entries()).map(([value, count]) => ({
      value,
      label: STATUS_LABELS[value] || value,
      count,
    })),

    // 性别选项
    gender: Array.from(counters.gender.entries()).map(([value, count]) => ({
      value,
      label: GENDER_LABELS[value] || value,
      count,
    })),

    // 年龄段选项
    ageGroup: Array.from(counters.ageGroup.entries()).map(([value, count]) => ({
      value,
      label: value,
      count,
    })),

    // 行业选项
    industry: Array.from(counters.industry.entries()).map(([value, count]) => ({
      value,
      label: value,
      count,
    })),

    // 标签选项
    tags: Array.from(counters.tags.entries()).map(([value, count]) => ({
      value,
      label: value,
      count,
    })),

    // 城市选项
    city: Array.from(counters.city.entries()).map(([value, count]) => ({
      value,
      label: value,
      count,
    })),

    // 自定义字段选项
    customFields: {},
  };

  // 转换自定义字段的嵌套 Map
  counters.customFields.forEach((fieldCounter, fieldName) => {
    options.customFields[fieldName] = Array.from(fieldCounter.entries()).map(
      ([value, count]) => ({
        value,
        label: value,
        count,
      })
    );
  });

  return options;
}

/**
 * 应用筛选条件
 *
 * 根据筛选条件过滤报名列表
 *
 * 筛选逻辑：
 * - 同一字段内多个值使用 OR 逻辑（满足任一即可）
 * - 不同字段之间使用 AND 逻辑（必须同时满足）
 * - 关键词搜索模糊匹配姓名、邮箱、电话
 *
 * @param enrollments - 报名列表
 * @param criteria - 筛选条件
 * @returns 过滤后的报名列表
 *
 * @example
 * ```typescript
 * const criteria = {
 *   status: ['approved'],
 *   gender: ['male', 'female'],
 *   customFields: {
 *     'VIP等级': ['金卡', '银卡']
 *   },
 *   keyword: '张'
 * };
 * const filtered = applyFilters(enrollments, criteria);
 * ```
 */
export function applyFilters(
  enrollments: Enrollment[],
  criteria: FilterCriteria
): Enrollment[] {
  return enrollments.filter((enrollment) => {
    // 1. 状态筛选
    if (criteria.status.length > 0) {
      if (!criteria.status.includes(enrollment.status)) {
        return false;
      }
    }

    // 2. 性别筛选
    if (criteria.gender.length > 0) {
      if (!enrollment.gender || !criteria.gender.includes(enrollment.gender)) {
        return false;
      }
    }

    // 3. 年龄段筛选
    if (criteria.ageGroup.length > 0) {
      if (
        !enrollment.ageGroup ||
        !criteria.ageGroup.includes(enrollment.ageGroup)
      ) {
        return false;
      }
    }

    // 4. 行业筛选
    if (criteria.industry.length > 0) {
      if (
        !enrollment.industry ||
        !criteria.industry.includes(enrollment.industry)
      ) {
        return false;
      }
    }

    // 5. 标签筛选（OR 逻辑：拥有任一标签即可）
    if (criteria.tags.length > 0) {
      if (!enrollment.tags || enrollment.tags.length === 0) {
        return false;
      }
      const hasMatchingTag = enrollment.tags.some((tag) =>
        criteria.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // 6. 城市筛选
    if (criteria.city.length > 0) {
      if (!enrollment.city || !criteria.city.includes(enrollment.city)) {
        return false;
      }
    }

    // 7. 自定义字段筛选
    if (Object.keys(criteria.customFields).length > 0) {
      for (const [fieldName, values] of Object.entries(criteria.customFields)) {
        // 如果该字段有筛选条件
        if (values.length > 0) {
          // 获取用户在该字段的值
          const fieldValue = enrollment.customFields?.[fieldName];

          // 如果用户没有该字段或值不在筛选列表中，则排除
          if (!fieldValue || !values.includes(String(fieldValue))) {
            return false;
          }
        }
      }
    }

    // 8. 关键词搜索（模糊匹配姓名、邮箱、电话）
    if (criteria.keyword && criteria.keyword.trim() !== "") {
      const keyword = criteria.keyword.toLowerCase().trim();
      const matchesName = enrollment.name?.toLowerCase().includes(keyword);
      const matchesEmail = enrollment.email?.toLowerCase().includes(keyword);
      const matchesPhone = enrollment.phone?.includes(keyword);

      if (!matchesName && !matchesEmail && !matchesPhone) {
        return false;
      }
    }

    // 所有条件都满足
    return true;
  });
}

/**
 * 判断筛选条件是否为空
 *
 * @param criteria - 筛选条件
 * @returns 是否为空
 */
export function isFilterEmpty(criteria: FilterCriteria): boolean {
  return (
    criteria.status.length === 0 &&
    criteria.gender.length === 0 &&
    criteria.ageGroup.length === 0 &&
    criteria.industry.length === 0 &&
    criteria.tags.length === 0 &&
    criteria.city.length === 0 &&
    Object.keys(criteria.customFields).length === 0 &&
    (!criteria.keyword || criteria.keyword.trim() === "")
  );
}

/**
 * 获取活跃筛选条件数量
 *
 * 用于显示筛选徽章数字
 *
 * @param criteria - 筛选条件
 * @returns 活跃筛选条件数量
 */
export function getActiveFilterCount(criteria: FilterCriteria): number {
  let count = 0;

  if (criteria.status.length > 0) count++;
  if (criteria.gender.length > 0) count++;
  if (criteria.ageGroup.length > 0) count++;
  if (criteria.industry.length > 0) count++;
  if (criteria.tags.length > 0) count++;
  if (criteria.city.length > 0) count++;

  // 自定义字段：每个有值的字段算一个
  Object.values(criteria.customFields).forEach((values) => {
    if (values.length > 0) count++;
  });

  if (criteria.keyword && criteria.keyword.trim() !== "") count++;

  return count;
}

/**
 * 清空筛选条件
 *
 * @returns 清空后的筛选条件
 */
export function clearFilters(): FilterCriteria {
  return {
    status: [],
    gender: [],
    ageGroup: [],
    industry: [],
    tags: [],
    city: [],
    customFields: {},
    keyword: "",
  };
}

/**
 * 全选
 *
 * @param enrollments - 报名列表
 * @returns 所有报名的 ID 数组
 */
export function selectAll(enrollments: Enrollment[]): string[] {
  return enrollments.map((e) => e.id);
}

/**
 * 反选
 *
 * @param enrollments - 报名列表
 * @param selectedIds - 当前选中的 ID 列表
 * @returns 反选后的 ID 数组
 */
export function invertSelection(
  enrollments: Enrollment[],
  selectedIds: string[]
): string[] {
  const selectedSet = new Set(selectedIds);
  return enrollments.filter((e) => !selectedSet.has(e.id)).map((e) => e.id);
}

/**
 * 清空选择
 *
 * @returns 空数组
 */
export function clearSelection(): string[] {
  return [];
}

/**
 * 切换选择状态
 *
 * @param enrollmentId - 报名 ID
 * @param selectedIds - 当前选中的 ID 列表
 * @returns 更新后的 ID 数组
 */
export function toggleSelection(
  enrollmentId: string,
  selectedIds: string[]
): string[] {
  const set = new Set(selectedIds);
  if (set.has(enrollmentId)) {
    set.delete(enrollmentId);
  } else {
    set.add(enrollmentId);
  }
  return Array.from(set);
}

/**
 * 判断是否全选
 *
 * @param enrollments - 报名列表
 * @param selectedIds - 当前选中的 ID 列表
 * @returns 是否全选
 */
export function isAllSelected(
  enrollments: Enrollment[],
  selectedIds: string[]
): boolean {
  if (enrollments.length === 0) return false;
  return enrollments.every((e) => selectedIds.includes(e.id));
}

/**
 * 判断是否部分选中
 *
 * @param enrollments - 报名列表
 * @param selectedIds - 当前选中的 ID 列表
 * @returns 是否部分选中
 */
export function isIndeterminate(
  enrollments: Enrollment[],
  selectedIds: string[]
): boolean {
  if (selectedIds.length === 0) return false;
  if (enrollments.length === 0) return false;
  return selectedIds.length > 0 && selectedIds.length < enrollments.length;
}
