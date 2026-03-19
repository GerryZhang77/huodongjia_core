/**
 * 用户聚合工具函数
 *
 * 从报名数据中跨活动聚合用户画像
 * - 按 userId 去重合并
 * - 计算参与次数和活跃度
 * - 提取自动标签
 */

import type { MockEnrollment } from "@/mocks/data/enrollments";
import type {
  MerchantUser,
  ActivityLevel,
  UserPoolFilterCriteria,
  UserPoolFilterOptions,
} from "../types";

/**
 * 根据年龄计算年龄段
 */
export function getAgeGroup(age?: number): string {
  if (!age) return "未知";
  if (age < 25) return "25岁以下";
  if (age < 30) return "25-29岁";
  if (age < 35) return "30-34岁";
  if (age < 40) return "35-39岁";
  return "40岁以上";
}

/**
 * 计算活跃度等级
 *
 * 规则：
 * - high: 参与 >= 3 次 或 最近30天内参与
 * - medium: 参与 >= 2 次
 * - low: 参与 1 次
 */
export function calculateActivityLevel(
  participationCount: number,
  lastParticipatedAt: string,
): ActivityLevel {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const lastDate = new Date(lastParticipatedAt);

  if (participationCount >= 3 || lastDate > thirtyDaysAgo) {
    return "high";
  }
  if (participationCount >= 2) {
    return "medium";
  }
  return "low";
}

/**
 * 从报名信息中提取自动标签
 */
export function extractAutoTags(enrollments: MockEnrollment[]): string[] {
  const tagSet = new Set<string>();

  enrollments.forEach((e) => {
    // 从行业提取
    if (e.industry) tagSet.add(e.industry);
    // 从兴趣提取
    if (e.interests) {
      e.interests.forEach((i) => tagSet.add(i));
    }
  });

  return Array.from(tagSet);
}

/**
 * 活动名称映射（从商家活动数据获取）
 */
const ACTIVITY_NAME_MAP: Record<string, string> = {
  event_001: "技术交流活动",
  ma_001: "2025 新年跨年派对",
  ma_002: "周末户外徒步 - 香山红叶季",
  ma_003: "技术沙龙：AI 编程助手实践分享",
  ma_004: "读书会：《纳瓦尔宝典》深度解读",
  ma_005: "城市骑行：长安街日落线",
  ma_006: "桌游之夜：狼人杀主题",
};

/**
 * 从报名数据聚合为用户画像
 *
 * @param enrollments - 商家所有活动的报名数据
 * @param customTagsMap - 自定义标签映射 (userId -> tagNames[])
 * @returns 聚合后的用户列表
 */
export function aggregateUsersFromEnrollments(
  enrollments: MockEnrollment[],
  customTagsMap: Record<string, string[]> = {},
): MerchantUser[] {
  // 按 userId 分组
  const userMap = new Map<string, MockEnrollment[]>();

  enrollments.forEach((enrollment) => {
    const userId = enrollment.user_id;
    if (!userMap.has(userId)) {
      userMap.set(userId, []);
    }
    userMap.get(userId)!.push(enrollment);
  });

  // 聚合每个用户
  const users: MerchantUser[] = [];

  userMap.forEach((userEnrollments, userId) => {
    // 取最新一条报名信息作为基础画像
    const sorted = [...userEnrollments].sort(
      (a, b) =>
        new Date(b.registration_time).getTime() -
        new Date(a.registration_time).getTime(),
    );
    const latest = sorted[0];
    const earliest = sorted[sorted.length - 1];

    // 收集参与过的活动
    const activityIds = [...new Set(userEnrollments.map((e) => e.activity_id))];
    const activityNames = activityIds.map((id) => ACTIVITY_NAME_MAP[id] || id);

    // 提取自动标签
    const autoTags = extractAutoTags(userEnrollments);

    // 计算活跃度
    const activityLevel = calculateActivityLevel(
      activityIds.length,
      latest.registration_time,
    );

    users.push({
      id: userId,
      name: latest.name,
      gender: latest.gender as MerchantUser["gender"],
      age: latest.age,
      phone: latest.phone,
      email: latest.email,
      avatar: latest.avatar || undefined,
      city: latest.city,
      occupation: latest.occupation,
      industry: latest.industry,
      company: latest.company,
      bio: latest.bio,
      interests: latest.interests,

      participatedActivityIds: activityIds,
      participatedActivityNames: activityNames,
      participationCount: activityIds.length,
      firstParticipatedAt: earliest.registration_time,
      lastParticipatedAt: latest.registration_time,

      autoTags,
      customTags: customTagsMap[userId] || [],

      activityLevel,
    });
  });

  // 按参与次数降序、最近参与时间降序排列
  users.sort((a, b) => {
    if (b.participationCount !== a.participationCount) {
      return b.participationCount - a.participationCount;
    }
    return (
      new Date(b.lastParticipatedAt).getTime() -
      new Date(a.lastParticipatedAt).getTime()
    );
  });

  return users;
}

// ========================================
// 筛选工具函数
// ========================================

/**
 * 从用户列表中提取筛选选项
 */
export function calculateUserPoolFilterOptions(
  users: MerchantUser[],
): UserPoolFilterOptions {
  const counters = {
    gender: new Map<string, number>(),
    city: new Map<string, number>(),
    industry: new Map<string, number>(),
    ageGroup: new Map<string, number>(),
    occupation: new Map<string, number>(),
    activityLevel: new Map<ActivityLevel, number>(),
    autoTags: new Map<string, number>(),
    customTags: new Map<string, number>(),
  };

  users.forEach((user) => {
    if (user.gender) {
      counters.gender.set(
        user.gender,
        (counters.gender.get(user.gender) || 0) + 1,
      );
    }
    if (user.city) {
      counters.city.set(user.city, (counters.city.get(user.city) || 0) + 1);
    }
    if (user.industry) {
      counters.industry.set(
        user.industry,
        (counters.industry.get(user.industry) || 0) + 1,
      );
    }
    if (user.age) {
      const ageGroup = getAgeGroup(user.age);
      counters.ageGroup.set(
        ageGroup,
        (counters.ageGroup.get(ageGroup) || 0) + 1,
      );
    }
    if (user.occupation) {
      counters.occupation.set(
        user.occupation,
        (counters.occupation.get(user.occupation) || 0) + 1,
      );
    }
    counters.activityLevel.set(
      user.activityLevel,
      (counters.activityLevel.get(user.activityLevel) || 0) + 1,
    );
    user.autoTags.forEach((tag) => {
      counters.autoTags.set(tag, (counters.autoTags.get(tag) || 0) + 1);
    });
    user.customTags.forEach((tag) => {
      counters.customTags.set(tag, (counters.customTags.get(tag) || 0) + 1);
    });
  });

  const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
    high: "高活跃",
    medium: "中活跃",
    low: "低活跃",
  };

  const GENDER_DISPLAY: Record<string, string> = {
    male: "男",
    female: "女",
    other: "其他",
  };

  return {
    gender: Array.from(counters.gender.entries()).map(([value, count]) => ({
      value,
      label: GENDER_DISPLAY[value] || value,
      count,
    })),
    city: mapToOptions(counters.city),
    industry: mapToOptions(counters.industry),
    ageGroup: mapToOptions(counters.ageGroup),
    occupation: sortByCount(mapToOptions(counters.occupation)).slice(0, 15),
    activityLevel: (["high", "medium", "low"] as ActivityLevel[])
      .filter((level) => counters.activityLevel.has(level))
      .map((level) => ({
        value: level,
        label: ACTIVITY_LEVEL_LABELS[level],
        count: counters.activityLevel.get(level) || 0,
      })),
    autoTags: sortByCount(mapToOptions(counters.autoTags)).slice(0, 20),
    customTags: mapToOptions(counters.customTags),
  };
}

/** Map 转选项数组 */
function mapToOptions(
  map: Map<string, number>,
): Array<{ value: string; label: string; count: number }> {
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count);
}

/** 按 count 降序排列 */
function sortByCount<T extends { count: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => b.count - a.count);
}

/**
 * 应用筛选条件
 */
export function applyUserPoolFilters(
  users: MerchantUser[],
  criteria: UserPoolFilterCriteria,
): MerchantUser[] {
  return users.filter((user) => {
    // 关键词搜索
    if (criteria.keyword) {
      const kw = criteria.keyword.toLowerCase();
      const searchFields = [
        user.name,
        user.occupation,
        user.company,
        user.city,
        user.industry,
        user.email,
        user.phone,
      ]
        .filter(Boolean)
        .map((s) => s!.toLowerCase());

      if (!searchFields.some((field) => field.includes(kw))) {
        return false;
      }
    }

    // 性别筛选
    if (criteria.gender.length > 0) {
      if (!user.gender || !criteria.gender.includes(user.gender)) return false;
    }

    // 城市筛选
    if (criteria.city.length > 0) {
      if (!user.city || !criteria.city.includes(user.city)) return false;
    }

    // 行业筛选
    if (criteria.industry.length > 0) {
      if (!user.industry || !criteria.industry.includes(user.industry))
        return false;
    }

    // 年龄段筛选
    if (criteria.ageGroup.length > 0) {
      const userAgeGroup = getAgeGroup(user.age);
      if (!criteria.ageGroup.includes(userAgeGroup)) return false;
    }

    // 职业筛选
    if (criteria.occupation.length > 0) {
      if (!user.occupation || !criteria.occupation.includes(user.occupation))
        return false;
    }

    // 活跃度筛选
    if (criteria.activityLevel.length > 0) {
      if (!criteria.activityLevel.includes(user.activityLevel)) return false;
    }

    // 参与次数筛选
    if (
      criteria.participationCountMin > 0 &&
      user.participationCount < criteria.participationCountMin
    ) {
      return false;
    }
    if (
      criteria.participationCountMax > 0 &&
      user.participationCount > criteria.participationCountMax
    ) {
      return false;
    }

    // 自动标签筛选
    if (criteria.autoTags.length > 0) {
      if (!criteria.autoTags.some((tag) => user.autoTags.includes(tag)))
        return false;
    }

    // 自定义标签筛选
    if (criteria.customTags.length > 0) {
      if (!criteria.customTags.some((tag) => user.customTags.includes(tag)))
        return false;
    }

    return true;
  });
}

/**
 * 计算已激活的筛选条件数量
 */
export function getActiveFilterCount(criteria: UserPoolFilterCriteria): number {
  let count = 0;
  if (criteria.gender.length > 0) count++;
  if (criteria.city.length > 0) count++;
  if (criteria.industry.length > 0) count++;
  if (criteria.ageGroup.length > 0) count++;
  if (criteria.occupation.length > 0) count++;
  if (criteria.activityLevel.length > 0) count++;
  if (criteria.participationCountMin > 0) count++;
  if (criteria.autoTags.length > 0) count++;
  if (criteria.customTags.length > 0) count++;
  return count;
}
