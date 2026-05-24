/**
 * C端个人中心 - 类型定义
 */

/**
 * 用户资料
 */
export interface UserProfile {
  id: string;
  phone?: string;
  email?: string;
  wechat?: string;
  name: string;
  avatar?: string;
  gender?: "male" | "female" | "other";
  age?: number;
  occupation?: string;
  company?: string;
  industry?: string;
  city?: string;
  bio?: string;
  tags: string[];
  photos?: string[];
  privacy_settings?: ProfilePrivacySettings;
  wechatQr?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 兴趣标签
 */
export interface InterestTag {
  id: string;
  name: string;
  colorType: "primary" | "secondary" | "accent" | "warning" | "default";
}

export interface ProfilePrivacySettings {
  phone?: boolean;
  email?: boolean;
  wechat?: boolean;
  company?: boolean;
  city?: boolean;
  industry?: boolean;
  occupation?: boolean;
  bio?: boolean;
}

/**
 * 更新用户资料请求
 */
export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  gender?: "male" | "female" | "other";
  age?: number;
  occupation?: string;
  company?: string;
  city?: string;
  bio?: string;
  tags?: string[];
  interestTags?: InterestTag[];
  wechatQr?: string;
  photos?: string[];
  email?: string;
  phone?: string;
  wechat?: string;
  industry?: string;
  privacy_settings?: ProfilePrivacySettings;
  /** opt-in 出现在"发现用户"列表 */
  discoverable?: boolean;
}

/**
 * 用户消息通知
 */
export interface UserNotification {
  id: string;
  type: "match_result" | "activity_reminder" | "system";
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    activityId?: string;
    enrollmentId?: string;
  };
}

/**
 * 通知列表响应
 */
export interface NotificationListResponse {
  success: boolean;
  notifications: UserNotification[];
  unreadCount: number;
  total: number;
}

/**
 * 用户统计数据
 */
export interface UserStats {
  totalEnrollments: number;
  upcomingActivities: number;
  completedActivities: number;
  favoriteCount: number;
}
