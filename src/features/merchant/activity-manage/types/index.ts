/**
 * B端活动管理 - 类型定义
 */

import type {
  ActivityDetail,
  ActivityStatus,
} from "@/features/shared/activity/types";

/**
 * 创建活动请求 (前端 camelCase，提交时转换为后端 snake_case)
 */
export interface CreateActivityRequest {
  title: string;
  description: string;
  expectation?: string;
  coverImage?: string;
  tags?: string[];
  registrationDeadline: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants?: number;
  fee?: number;
  checkinPassword?: string;
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
