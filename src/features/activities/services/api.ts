/**
 * Activities Module - API Service
 * 活动模块 - API 服务 (统一版本)
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
  // 根据 OpenAPI 文档: GET /api/events/my
  const data = (await api.get("/api/events/my")) as ApiResponse<Activity>;

  if (!data.success) {
    throw new Error(data.message || "获取活动列表失败");
  }

  return {
    activities: data.events || [],
    total: data.events?.length || 0,
  };
};

/**
 * 获取活动详情
 */
export const getActivityById = async (id: string): Promise<Activity> => {
  const data = (await api.get(`/api/events/${id}`)) as ApiResponse<Activity>;

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
  // 根据 OpenAPI 文档: POST /api/events/create
  const data = (await api.post(
    "/api/events/create",
    request
  )) as ApiResponse<Activity>;

  if (!data.success) {
    throw new Error(data.message || "创建活动失败");
  }

  if (!data.event) {
    throw new Error("创建活动失败:未返回活动数据");
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
  const data = (await api.put(
    `/api/events/${id}`,
    request
  )) as ApiResponse<Activity>;

  if (!data.success) {
    throw new Error(data.message || "更新活动失败");
  }

  if (!data.event) {
    throw new Error("更新活动失败:未返回活动数据");
  }

  return data.event;
};

/**
 * 删除活动
 */
export const deleteActivity = async (id: string): Promise<void> => {
  const data = (await api.delete(`/api/events/${id}`)) as ApiResponse<never>;

  if (!data.success) {
    throw new Error(data.message || "删除活动失败");
  }
};

/**
 * 上传封面图片
 */
export const uploadCoverImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const data = (await api.post("/api/events/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })) as ApiResponse<never>;

  if (!data.success || !data.url) {
    throw new Error(data.message || "图片上传失败");
  }

  return data.url;
};
