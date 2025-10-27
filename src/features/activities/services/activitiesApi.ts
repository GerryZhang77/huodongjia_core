/**
 * Activities API Service
 * 活动 API 服务 - 获取我的活动列表专用
 */

import api from "@/lib/api";
import type { Activity } from "../types";

/**
 * API 响应基础类型
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 获取活动列表响应
 */
export interface GetActivitiesResponse {
  activities: Activity[];
  hasMore: boolean;
}

/**
 * 获取我的活动列表
 */
export async function getMyActivities(): Promise<GetActivitiesResponse> {
  // api 拦截器已经自动返回 response.data，所以这里直接得到后端数据
  const response = (await api.get("/api/events/my/created")) as ApiResponse<
    Activity[]
  >;

  return {
    activities: response.data || [],
    hasMore: response.pagination
      ? response.pagination.page < response.pagination.totalPages
      : false,
  };
}
