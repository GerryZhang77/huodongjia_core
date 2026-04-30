/**
 * 商家端 API
 * 商家后台相关接口
 */

import { api } from "@/services/api";

// ========================================
// 类型定义
// ========================================

/**
 * 商家资料
 */
export interface MerchantProfile {
  id: string;
  account: string;
  name: string;
  phone: string | null;
  email: string | null;
  avatar: string | null;
  birth_year: number | null;
  location: string | null;
  person_info: unknown[];
  created_at: string;
  updated_at: string;
}

/**
 * 商家资料响应
 */
export interface MerchantProfileResponse {
  success: boolean;
  profile: MerchantProfile;
}

/**
 * 更新商家资料请求
 */
export interface UpdateMerchantProfileRequest {
  avatar?: string;
  name?: string;
  birth_year?: number;
  phone?: string;
  email?: string;
  person_info?: unknown[];
}

// ========================================
// API 函数
// ========================================

/**
 * 获取商家资料
 */
export async function getMerchantProfile(): Promise<MerchantProfileResponse> {
  return api.get<MerchantProfileResponse>("/api/auth/me");
}

/**
 * 更新商家资料
 */
export async function updateMerchantProfile(
  data: UpdateMerchantProfileRequest
): Promise<{ success: boolean; message: string }> {
  return api.put<{ success: boolean; message: string }>(
    "/api/dashboard/organizer",
    data
  );
}

/**
 * 上传商家头像
 * POST /api/dashboard/organizer/update-avatar
 */
export async function uploadMerchantAvatar(
  file: File
): Promise<{ success: boolean; data?: { url: string }; message?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/dashboard/organizer/update-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60_000,
  });
}
