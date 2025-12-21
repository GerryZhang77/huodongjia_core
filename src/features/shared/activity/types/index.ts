/**
 * Activity 类型定义 (共享)
 * B端和C端共用的活动相关类型
 */

/**
 * 活动状态
 */
export type ActivityStatus =
  | "draft" // 草稿
  | "published" // 已发布
  | "registration" // 报名中
  | "ongoing" // 进行中
  | "completed" // 已完成
  | "cancelled"; // 已取消

/**
 * 活动基础信息 (列表展示)
 */
export interface ActivityListItem {
  id: string;
  title: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  status: ActivityStatus;
  eventStartTime: string;
  eventEndTime: string;
  location: string;
  maxParticipants: number;
  enrolledCount: number;
  isPublic: boolean;
  createdAt: string;
}

/**
 * 活动详情
 */
export interface ActivityDetail extends ActivityListItem {
  description: string;
  registrationStartTime: string;
  registrationEndTime: string;
  organizerId: string;
  organizerName?: string;
  allowWaitlist: boolean;
  isPaid: boolean;
  price?: number;
  config?: Record<string, unknown>;
  updatedAt: string;
}

/**
 * 活动列表查询参数
 */
export interface ActivityQueryParams {
  page?: number;
  pageSize?: number;
  status?: ActivityStatus;
  category?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 活动列表响应
 */
export interface ActivityListResponse {
  success: boolean;
  activities: ActivityListItem[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取活动状态显示文本
 */
export function getActivityStatusText(status: ActivityStatus): string {
  const statusMap: Record<ActivityStatus, string> = {
    draft: "草稿",
    published: "已发布",
    registration: "报名中",
    ongoing: "进行中",
    completed: "已完成",
    cancelled: "已取消",
  };
  return statusMap[status] || status;
}

/**
 * 获取活动状态颜色
 */
export function getActivityStatusColor(status: ActivityStatus): string {
  const colorMap: Record<ActivityStatus, string> = {
    draft: "#6B7280", // gray
    published: "#4A78FF", // primary
    registration: "#10B981", // green
    ongoing: "#F59E0B", // yellow
    completed: "#6B7280", // gray
    cancelled: "#EF4444", // red
  };
  return colorMap[status] || "#6B7280";
}
