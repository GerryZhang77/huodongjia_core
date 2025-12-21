/**
 * Activity API - 活动接口
 * 底层 API 调用，与后端接口 1:1 对应
 */

import { api } from "@/services/api";

// ============================================
// 类型定义
// ============================================

export type ActivityStatus =
  | "draft"
  | "published"
  | "registration"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface Activity {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  registrationStartTime?: string;
  registrationEndTime?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  status: ActivityStatus;
  isPublic?: boolean;
  organizerId?: string;
  organizerName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityListResponse {
  success: boolean;
  data?: {
    activities: Activity[];
    total?: number;
    page?: number;
    pageSize?: number;
  };
  message?: string;
}

export interface ActivityDetailResponse {
  success: boolean;
  data?: Activity;
  message?: string;
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  location?: string;
  maxParticipants?: number;
  registrationStartTime?: string;
  registrationEndTime?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  isPublic?: boolean;
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  id: string;
}

export interface ActivityQueryParams {
  page?: number;
  pageSize?: number;
  status?: ActivityStatus;
  category?: string;
  keyword?: string;
}

// ============================================
// 公共接口 (B端/C端共用)
// ============================================

/**
 * 获取活动详情
 * GET /api/events/{id}
 */
export async function getActivityDetail(
  id: string
): Promise<ActivityDetailResponse> {
  return api.get(`/api/events/${id}`);
}

/**
 * 获取公开活动列表 (C端浏览)
 * GET /api/events/public
 */
export async function getPublicActivities(
  params?: ActivityQueryParams
): Promise<ActivityListResponse> {
  return api.get("/api/events/public", { params });
}

// ============================================
// 商家接口 (B端专属)
// ============================================

/**
 * 获取我的活动列表 (商家)
 * GET /api/events/my
 */
export async function getMyActivities(): Promise<ActivityListResponse> {
  return api.get("/api/events/my");
}

/**
 * 创建活动
 * POST /api/events/create
 */
export async function createActivity(
  data: CreateActivityRequest
): Promise<ActivityDetailResponse> {
  return api.post("/api/events/create", data);
}

/**
 * 更新活动
 * PUT /api/events/{id}
 */
export async function updateActivity(
  id: string,
  data: Partial<CreateActivityRequest>
): Promise<ActivityDetailResponse> {
  return api.put(`/api/events/${id}`, data);
}

/**
 * 删除活动
 * DELETE /api/events/{id}
 */
export async function deleteActivity(
  id: string
): Promise<{ success: boolean }> {
  return api.delete(`/api/events/${id}`);
}

/**
 * 发布活动
 * POST /api/events/{id}/publish
 */
export async function publishActivity(
  id: string
): Promise<{ success: boolean }> {
  return api.post(`/api/events/${id}/publish`);
}

/**
 * 取消活动
 * POST /api/events/{id}/cancel
 */
export async function cancelActivity(
  id: string
): Promise<{ success: boolean }> {
  return api.post(`/api/events/${id}/cancel`);
}

// ============================================
// C端用户接口
// ============================================

/**
 * 获取推荐活动
 * GET /api/user/activities/recommended
 */
export async function getRecommendedActivities(): Promise<ActivityListResponse> {
  return api.get("/api/user/activities/recommended");
}

/**
 * 搜索活动
 * GET /api/user/activities/search
 */
export async function searchActivities(
  params: ActivityQueryParams
): Promise<ActivityListResponse> {
  return api.get("/api/user/activities/search", { params });
}

/**
 * 获取活动分类
 * GET /api/user/activities/categories
 */
export async function getActivityCategories(): Promise<{
  success: boolean;
  categories?: string[];
}> {
  return api.get("/api/user/activities/categories");
}

/**
 * 收藏/取消收藏活动
 * POST /api/user/activities/{id}/favorite
 */
export async function toggleFavoriteActivity(
  id: string
): Promise<{ success: boolean; isFavorite?: boolean }> {
  return api.post(`/api/user/activities/${id}/favorite`);
}

/**
 * 获取收藏的活动
 * GET /api/user/activities/favorites
 */
export async function getFavoriteActivities(): Promise<ActivityListResponse> {
  return api.get("/api/user/activities/favorites");
}
