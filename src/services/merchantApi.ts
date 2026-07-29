/**
 * 商家端 API
 * 商家后台相关接口
 */

import { api } from "@/services/api";

// ========================================
// 类型定义
// ========================================

/**
 * 商家隐私开关：哪些联系/资料字段对外公开
 */
export interface MerchantPrivacySettings {
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
 * 商家个人中心头部统计
 */
export interface MerchantStats {
  totalEvents: number;
  totalServed: number;
  ratingAvg: number | null;
  ratingCount: number | null;
}

/**
 * 商家资料
 */
export interface MerchantProfile {
  id: string;
  account: string;
  name: string;
  phone: string | null;
  email: string | null;
  wechat: string | null;
  avatar: string | null;
  birth_year: number | null;
  age: number | null;
  location: string | null;
  occupation: string | null;
  company: string | null;
  industry: string | null;
  city: string | null;
  bio: string | null;
  tags: string[];
  photos: string[];
  person_info: unknown[];
  privacy_settings: MerchantPrivacySettings;
  created_at: string;
  updated_at: string;
  stats: MerchantStats;
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
  avatar?: string | null;
  name?: string;
  birth_year?: number | null;
  age?: number | null;
  phone?: string | null;
  email?: string | null;
  wechat?: string | null;
  location?: string | null;
  occupation?: string | null;
  company?: string | null;
  industry?: string | null;
  city?: string | null;
  bio?: string | null;
  tags?: string[];
  photos?: string[];
  person_info?: unknown[];
  privacy_settings?: MerchantPrivacySettings;
}

export interface UpdatedMerchantIdentity {
  id: string;
  name: string;
  avatar: string | null;
  phone: string | null;
  occupation: string | null;
  company: string | null;
  tags: string[];
}

export interface UpdateMerchantProfileResponse {
  success: boolean;
  message: string;
  /** 新版后端返回真实落库值；旧版后端缺省时前端会用提交值即时同步。 */
  data?: {
    user?: UpdatedMerchantIdentity;
  };
}

// ========================================
// API 函数
// ========================================

/**
 * 获取商家资料
 */
export async function getMerchantProfile(): Promise<MerchantProfileResponse> {
  return api.get<MerchantProfileResponse>("/api/merchant/profile");
}

/**
 * 更新商家资料
 */
export async function updateMerchantProfile(
  data: UpdateMerchantProfileRequest
): Promise<UpdateMerchantProfileResponse> {
  return api.put<UpdateMerchantProfileResponse>(
    "/api/merchant/profile",
    data
  );
}

/**
 * 上传商家头像
 * POST /api/merchant/profile/avatar
 */
export async function uploadMerchantAvatar(
  file: File
): Promise<{ success: boolean; data?: { url: string }; message?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/merchant/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60_000,
  });
}
