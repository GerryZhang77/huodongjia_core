/**
 * Activities Module - API Service
 * 活动模块 - API 服务
 */

import type {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "../types";

/**
 * API Response 类型
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  event?: T;
  events?: T[];
  url?: string;
}

/**
 * 获取 token (临时方案,后续会统一到全局 API 客户端)
 */
const getToken = (): string | null => {
  // 从 localStorage 或其他地方获取 token
  return localStorage.getItem("token");
};

/**
 * 获取活动列表
 */
export const getActivities = async (): Promise<Activity[]> => {
  const token = getToken();
  const response = await fetch("/api/events", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data: ApiResponse<Activity> = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取活动列表失败");
  }

  return data.events || [];
};

/**
 * 获取活动详情
 */
export const getActivityById = async (id: string): Promise<Activity> => {
  const token = getToken();
  const response = await fetch(`/api/event-detail/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data: ApiResponse<Activity> = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取活动详情失败");
  }

  if (!data.event) {
    throw new Error("活动不存在");
  }

  return data.event;
};

/**
 * 创建活动
 */
export const createActivity = async (
  request: CreateActivityRequest
): Promise<Activity> => {
  const token = getToken();
  const response = await fetch("/api/create-event", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data: ApiResponse<Activity> = await response.json();

  if (!data.success) {
    throw new Error(data.message || "创建活动失败");
  }

  if (!data.event) {
    throw new Error("创建活动失败：未返回活动数据");
  }

  return data.event;
};

/**
 * 更新活动
 */
export const updateActivity = async (
  id: string,
  request: UpdateActivityRequest
): Promise<Activity> => {
  const token = getToken();
  const response = await fetch(`/api/update-event/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data: ApiResponse<Activity> = await response.json();

  if (!data.success) {
    throw new Error(data.message || "更新活动失败");
  }

  if (!data.event) {
    throw new Error("更新活动失败：未返回活动数据");
  }

  return data.event;
};

/**
 * 删除活动
 */
export const deleteActivity = async (id: string): Promise<void> => {
  const token = getToken();
  const response = await fetch(`/api/delete-event/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data: ApiResponse<never> = await response.json();

  if (!data.success) {
    throw new Error(data.message || "删除活动失败");
  }
};

/**
 * 上传封面图片
 */
export const uploadCoverImage = async (file: File): Promise<string> => {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload-image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data: ApiResponse<never> = await response.json();

  if (!data.success || !data.url) {
    throw new Error(data.message || "图片上传失败");
  }

  return data.url;
};
