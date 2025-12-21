/**
 * B端活动管理 - 类型定义
 */

import type {
  ActivityDetail,
  ActivityStatus,
} from "@/features/shared/activity/types";

/**
 * 创建活动请求
 */
export interface CreateActivityRequest {
  title: string;
  description: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  registrationStartTime: string;
  registrationEndTime: string;
  eventStartTime: string;
  eventEndTime: string;
  location: string;
  maxParticipants: number;
  isPublic?: boolean;
  allowWaitlist?: boolean;
  isPaid?: boolean;
  price?: number;
}

/**
 * 更新活动请求
 */
export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  status?: ActivityStatus;
}

/**
 * 商家活动列表项 (包含管理信息)
 */
export interface MerchantActivityListItem extends ActivityDetail {
  enrolledCount: number;
  pendingCount: number;
  matchedCount: number;
}

/**
 * 商家活动列表响应
 */
export interface MerchantActivityListResponse {
  success: boolean;
  activities: MerchantActivityListItem[];
  total: number;
}
