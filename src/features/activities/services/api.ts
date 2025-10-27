/**
 * Activities Module - API Service
 * 活动模块 - API 服务 (统一版本)
 */

import { api } from "@/lib/api";
import {
  mapApiActivityToActivity,
  mapApiActivitiesToActivities,
  type ApiActivityData,
} from "../utils/mappers";
import type {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "../types";

/**
 * API Response 基础类型
 */
interface ApiResponse<T = ApiActivityData> {
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
  const data = (await api.get("/api/events/my")) as ApiResponse;

  if (!data.success) {
    throw new Error(data.message || "获取活动列表失败");
  }

  // 使用 mapper 转换数据
  const activities = mapApiActivitiesToActivities(data.events || []);

  return {
    activities,
    total: activities.length,
  };
};

/**
 * 获取活动详情
 */
export const getActivityById = async (id: string): Promise<Activity> => {
  const data = (await api.get(`/api/events/${id}`)) as ApiResponse;

  if (!data.success) {
    throw new Error(data.message || "获取活动详情失败");
  }

  if (!data.event) {
    throw new Error("活动不存在");
  }

  // 使用 mapper 转换数据
  return mapApiActivityToActivity(data.event);
};

/**
 * 创建活动
 */
export const createActivity = async (
  request: CreateActivityRequest
): Promise<Activity> => {
  try {
    console.log("createActivity - 发送请求:", request);

    // 根据 OpenAPI 文档: POST /api/events/create
    const data = (await api.post("/api/events/create", request)) as ApiResponse;

    console.log(
      "createActivity - API 原始响应:",
      JSON.stringify(data, null, 2)
    );
    console.log(
      "createActivity - success 值:",
      data.success,
      "类型:",
      typeof data.success
    );
    console.log(
      "createActivity - event 值:",
      data.event,
      "类型:",
      typeof data.event
    );
    console.log("createActivity - message 值:", data.message);

    // 检查响应成功状态（只有明确失败才抛错）
    if (data.success === false) {
      const errorMsg = data.message || "创建活动失败";
      console.error(
        "createActivity - 检测到 success === false，错误:",
        errorMsg
      );
      throw new Error(errorMsg);
    }

    // 检查是否返回了活动数据
    if (!data.event) {
      console.error("createActivity - 未返回活动数据！");
      console.error("createActivity - 完整响应:", data);
      console.error("createActivity - data.event 的值:", data.event);
      console.error("createActivity - Object.keys(data):", Object.keys(data));

      // 如果 success 为 true 但没有 event，说明 Mock 数据不完整
      throw new Error("服务器返回数据异常，请稍后重试");
    }

    console.log("createActivity - ✅ 创建成功，原始活动数据:", data.event);

    // 使用 mapper 转换数据
    const activity = mapApiActivityToActivity(data.event);
    console.log("createActivity - ✅ 转换后的活动数据:", activity);

    return activity;
  } catch (error) {
    console.error("createActivity - ❌ 捕获到错误:", error);
    console.error("createActivity - 错误详情:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

/**
 * 更新活动
 */
export const updateActivity = async (
  id: string,
  request: UpdateActivityRequest
): Promise<Activity> => {
  const data = (await api.put(`/api/events/${id}`, request)) as ApiResponse;

  if (!data.success) {
    throw new Error(data.message || "更新活动失败");
  }

  if (!data.event) {
    throw new Error("更新活动失败:未返回活动数据");
  }

  // 使用 mapper 转换数据
  return mapApiActivityToActivity(data.event);
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
