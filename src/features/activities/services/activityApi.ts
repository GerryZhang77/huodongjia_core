/**
 * Activities Module - API Service
 * 活动模块 - API 服务
 */

import { api } from "@/lib/api";
import type {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "../types";

/**
 * API Response 基础类型
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  event?: T;
  events?: T[];
  url?: string;
}

/**
 * 获取活动列表响应
 */
export interface GetActivitiesResponse {
  activities: Activity[];
  total: number;
}

/**
 * 获取活动列表(商家创建的所有活动)
 */
export const getActivities = async (): Promise<GetActivitiesResponse> => {
  const response = (await api.get("/api/events")) as ApiResponse<Activity>;

  if (!response.success) {
    throw new Error(response.message || "获取活动列表失败");
  }

  return {
    activities: response.events || [],
    total: response.events?.length || 0,
  };
};

/**
 * 获取活动详情
 */
export const getActivityById = async (id: string): Promise<Activity> => {
  const response = (await api.get(
    `/api/events/${id}`
  )) as ApiResponse<Activity>;

  if (!response.success) {
    throw new Error(response.message || "获取活动详情失败");
  }

  if (!response.event) {
    throw new Error("活动不存在");
  }

  return response.event;
};

/**
 * 创建活动
 */
export const createActivity = async (
  request: CreateActivityRequest
): Promise<Activity> => {
  console.log("[createActivity] 发送请求:", request);

  const response = (await api.post(
    "/api/events/create",
    request
  )) as ApiResponse<Activity>;

  console.log("[createActivity] 收到响应:", response);

  if (!response.success) {
    console.error("[createActivity] 请求失败:", {
      success: response.success,
      message: response.message,
      data: response.data,
      event: response.event,
    });
    throw new Error(response.message || "创建活动失败");
  }

  if (!response.event) {
    console.error("[createActivity] 缺少 event 字段:", response);
    throw new Error("创建活动失败:未返回活动数据");
  }

  return response.event;
};

/**
 * 更新活动
 */
export const updateActivity = async (
  id: string,
  request: UpdateActivityRequest
): Promise<Activity> => {
  const response = (await api.put(
    `/api/events/${id}`,
    request
  )) as ApiResponse<Activity>;

  if (!response.success) {
    throw new Error(response.message || "更新活动失败");
  }

  if (!response.event) {
    throw new Error("更新活动失败:未返回活动数据");
  }

  return response.event;
};

/**
 * 删除活动
 */
export const deleteActivity = async (id: string): Promise<void> => {
  const response = (await api.delete(
    `/api/events/${id}`
  )) as ApiResponse<never>;

  if (!response.success) {
    throw new Error(response.message || "删除活动失败");
  }
};

/**
 * 上传封面图片
 */
export const uploadCoverImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = (await api.post("/api/events/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })) as ApiResponse<never>;

  if (!response.success || !response.url) {
    throw new Error(response.message || "图片上传失败");
  }

  return response.url;
};
