/**
 * Activities Module - Type Definitions
 * 活动模块 - 类型定义
 */

/**
 * 活动状态
 */
export type ActivityStatus =
  | "recruiting" // 招募中
  | "recruiting_ended" // 招募结束
  | "ongoing" // 进行中
  | "ended" // 已结束
  | "cancelled"; // 已取消

/**
 * 活动分类
 */
export type ActivityCategory =
  | "business" // 商务会议
  | "tech" // 技术交流
  | "social" // 社交聚会
  | "training" // 培训学习
  | "culture" // 文化活动
  | "sports" // 体育运动
  | "other"; // 其他

/**
 * 活动标签
 */
export type ActivityTag =
  | "online" // 线上
  | "offline" // 线下
  | "free" // 免费
  | "paid" // 付费
  | "limited" // 限时
  | "popular" // 热门
  | "beginner" // 新手友好
  | "professional"; // 专业级

/**
 * 活动实体
 */
export interface Activity {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  status: ActivityStatus;
  registrationStart: string;
  registrationEnd: string;
  activityStart: string;
  activityEnd: string;
  location: string;
  capacity: number;
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
  // 扩展字段 (from ActivityForm)
  category?: ActivityCategory;
  tags?: ActivityTag[];
  requirements?: string;
  contactInfo?: string;
  isPublic?: boolean;
  allowWaitlist?: boolean;
}

/**
 * 活动表单数据
 */
export interface ActivityFormData {
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  location: string;
  max_participants: number;
  registration_start: Date;
  registration_end: Date;
  category: ActivityCategory;
  tags: ActivityTag[];
  cover_image?: string;
  requirements?: string;
  contact_info?: string;
  is_public: boolean;
  allow_waitlist: boolean;
}

/**
 * 创建活动请求
 */
export interface CreateActivityRequest {
  title: string;
  description: string;
  coverImage?: string;
  registrationStart: string;
  registrationEnd: string;
  activityStart: string;
  activityEnd: string;
  location: string;
  capacity: number;
  category?: ActivityCategory;
  tags?: ActivityTag[];
  requirements?: string;
  contactInfo?: string;
  isPublic?: boolean;
  allowWaitlist?: boolean;
}

/**
 * 更新活动请求
 */
export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  coverImage?: string;
  registrationStart?: string;
  registrationEnd?: string;
  activityStart?: string;
  activityEnd?: string;
  location?: string;
  capacity?: number;
  status?: ActivityStatus;
  category?: ActivityCategory;
  tags?: ActivityTag[];
  requirements?: string;
  contactInfo?: string;
  isPublic?: boolean;
  allowWaitlist?: boolean;
}

/**
 * 活动分类选项
 */
export interface ActivityCategoryOption {
  label: string;
  value: ActivityCategory;
}

/**
 * 活动标签选项
 */
export interface ActivityTagOption {
  label: string;
  value: ActivityTag;
}

/**
 * 活动状态管理 State
 */
export interface ActivityState {
  currentActivity: Activity | null;
  activityList: Activity[];
  total: number;
  loading: boolean;
  setCurrentActivity: (activity: Activity | null) => void;
  setActivityList: (list: Activity[], total: number) => void;
  setLoading: (loading: boolean) => void;
  clearActivity: () => void;
}
