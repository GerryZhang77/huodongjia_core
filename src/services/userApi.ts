/**
 * User API - 用户接口
 * 底层 API 调用，与后端接口 1:1 对应
 * C端用户个人中心相关接口
 */

import { api } from "@/services/api";

// ============================================
// 类型定义
// ============================================

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: "male" | "female" | "other";
  age?: number;
  city?: string;
  occupation?: string;
  industry?: string;
  bio?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  gender?: "male" | "female" | "other";
  age?: number;
  city?: string;
  occupation?: string;
  industry?: string;
  bio?: string;
  tags?: string[];
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: "system" | "activity" | "enrollment" | "matching";
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface NotificationListResponse {
  success: boolean;
  data?: {
    notifications: Notification[];
    total?: number;
    unreadCount?: number;
  };
}

export interface UserStats {
  totalEnrollments: number;
  completedActivities: number;
  favoriteCount: number;
  matchingCount: number;
}

// ============================================
// API 函数
// ============================================

/**
 * 获取用户资料
 * GET /api/user/profile
 */
export async function getUserProfile(): Promise<{
  success: boolean;
  profile?: UserProfile;
}> {
  return api.get("/api/user/profile");
}

/**
 * 更新用户资料
 * PUT /api/user/profile
 */
export async function updateUserProfile(data: UpdateProfileRequest): Promise<{
  success: boolean;
  profile?: UserProfile;
}> {
  return api.put("/api/user/profile", data);
}

/**
 * 上传头像
 * POST /api/user/profile/avatar
 */
export async function uploadAvatar(file: File): Promise<{
  success: boolean;
  avatarUrl?: string;
}> {
  const formData = new FormData();
  formData.append("avatar", file);

  return api.post("/api/user/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/**
 * 获取通知列表
 * GET /api/user/notifications
 */
export async function getNotifications(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  isRead?: boolean;
}): Promise<NotificationListResponse> {
  return api.get("/api/user/notifications", { params });
}

/**
 * 标记通知为已读
 * POST /api/user/notifications/{id}/read
 */
export async function markNotificationRead(
  id: string
): Promise<{ success: boolean }> {
  return api.post(`/api/user/notifications/${id}/read`);
}

/**
 * 标记所有通知为已读
 * POST /api/user/notifications/read-all
 */
export async function markAllNotificationsRead(): Promise<{
  success: boolean;
}> {
  return api.post("/api/user/notifications/read-all");
}

/**
 * 获取用户统计数据
 * GET /api/user/stats
 */
export async function getUserStats(): Promise<{
  success: boolean;
  stats?: UserStats;
}> {
  return api.get("/api/user/stats");
}

/**
 * 删除账号
 * DELETE /api/user/account
 */
export async function deleteAccount(): Promise<{ success: boolean }> {
  return api.delete("/api/user/account");
}

/**
 * 修改密码
 * PUT /api/user/password
 */
export async function changePassword(data: {
  oldPassword: string;
  newPassword: string;
}): Promise<{ success: boolean }> {
  return api.put("/api/user/password", data);
}
