/**
 * 报名管理类型定义
 *
 * 包含报名信息、筛选条件、筛选选项等核心类型
 * 支持自定义字段的动态处理
 */

/**
 * 报名状态枚举
 */
export type EnrollmentStatus =
  | "pending" // 待审核
  | "approved" // 已通过
  | "rejected" // 已拒绝
  | "waitlist" // 候补
  | "cancelled"; // 已取消

/**
 * 性别枚举
 */
export type Gender = "male" | "female" | "other";

/**
 * 报名信息完整类型
 *
 * 包含标准字段和自定义字段
 * 标准字段从 API 返回的固定结构
 * 自定义字段从 Excel 导入的动态列
 */
export interface Enrollment {
  // 基础信息
  id: string;
  activityId: string;
  userId?: string;

  // 个人信息
  name: string;
  gender?: Gender;
  age?: number;
  ageGroup?: string; // 年龄段：如 "18-25", "26-35" 等

  // 职业信息
  occupation?: string;
  industry?: string;

  // 联系方式
  phone?: string;
  email?: string;
  city?: string;

  // 扩展信息
  bio?: string;
  matchingNeeds?: string;
  tags?: string[];

  // 自定义字段
  // 存储从 Excel 导入的任意列，如 "VIP等级", "推荐人", "特殊需求" 等
  customFields?: Record<string, unknown>;

  // 表单数据（原始提交数据）
  formData?: Record<string, unknown>;

  // 状态
  status: EnrollmentStatus;
  isInfoComplete?: boolean;

  // 时间戳
  enrolledAt: string;
  updatedAt?: string;
}

/**
 * 筛选条件
 *
 * 用于存储用户选择的筛选条件
 * 同一字段内多个值使用 OR 逻辑
 * 不同字段之间使用 AND 逻辑
 */
export interface FilterCriteria {
  // 状态筛选（多选）
  status: EnrollmentStatus[];

  // 性别筛选（多选）
  gender: Gender[];

  // 年龄段筛选（多选）
  ageGroup: string[];

  // 行业筛选（多选）
  industry: string[];

  // 标签筛选（多选）
  tags: string[];

  // 城市筛选（多选）
  city: string[];

  // 自定义字段筛选（动态）
  // 键为字段名，值为选中的值数组
  // 例如：{ "VIP等级": ["金卡", "银卡"], "推荐人": ["张三"] }
  customFields: Record<string, string[]>;

  // 关键词搜索（模糊匹配姓名、邮箱、电话）
  keyword?: string;
}

/**
 * 筛选选项
 *
 * 从报名数据中提取的所有可用筛选选项
 * 包含每个选项的计数
 */
export interface FilterOptions {
  // 状态选项
  status: Array<{
    value: EnrollmentStatus;
    label: string;
    count: number;
  }>;

  // 性别选项
  gender: Array<{
    value: Gender;
    label: string;
    count: number;
  }>;

  // 年龄段选项
  ageGroup: Array<{
    value: string;
    label: string;
    count: number;
  }>;

  // 行业选项
  industry: Array<{
    value: string;
    label: string;
    count: number;
  }>;

  // 标签选项
  tags: Array<{
    value: string;
    label: string;
    count: number;
  }>;

  // 城市选项
  city: Array<{
    value: string;
    label: string;
    count: number;
  }>;

  // 自定义字段选项（动态）
  // 键为字段名，值为该字段的所有选项
  // 例如：{ "VIP等级": [{ value: "金卡", label: "金卡", count: 5 }] }
  customFields: Record<
    string,
    Array<{
      value: string;
      label: string;
      count: number;
    }>
  >;
}

/**
 * 筛选结果统计
 */
export interface FilterStats {
  total: number; // 总人数
  filtered: number; // 筛选后人数
  selected: number; // 已选中人数
}

/**
 * 批量操作类型
 */
export type BatchAction =
  | "select-all" // 全选
  | "invert-selection" // 反选
  | "clear-selection" // 清空选择
  | "send-notification" // 发送通知
  | "export-list"; // 导出名单

/**
 * 导出选项
 */
export interface ExportOptions {
  format: "excel" | "csv";
  fields: string[]; // 要导出的字段
  includeCustomFields: boolean; // 是否包含自定义字段
}

/**
 * 通知选项
 */
export interface NotificationOptions {
  title: string;
  content: string;
  channels: ("in_app" | "wechat" | "sms" | "email")[];
}

/**
 * 默认筛选条件
 */
export const DEFAULT_FILTER_CRITERIA: FilterCriteria = {
  status: [],
  gender: [],
  ageGroup: [],
  industry: [],
  tags: [],
  city: [],
  customFields: {},
  keyword: "",
};

/**
 * 状态显示文本映射
 */
export const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
  waitlist: "候补",
  cancelled: "已取消",
};

/**
 * 性别显示文本映射
 */
export const GENDER_LABELS: Record<Gender, string> = {
  male: "男",
  female: "女",
  other: "其他",
};
