/**
 * Enrollment Module - API Service
 * 报名模块 - API 服务
 */

import { api } from "@/lib/api";
import type {
  EnrollmentInput,
  EnrollmentListQuery,
  EnrollmentListResponse,
  UpdateEnrollmentStatusRequest,
  ImportEnrollmentRequest,
  ImportEnrollmentResponse,
  SendNotificationRequest,
  BatchImportEnrollmentsResponse,
} from "../types";

/**
 * 获取 token
 */
const getToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * 旧版报名列表响应（兼容现有 API）
 */
interface LegacyEnrollmentListResponse {
  data: unknown[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取活动报名列表（旧版接口）
 */
export const getEnrollments = async (
  query: EnrollmentListQuery
): Promise<LegacyEnrollmentListResponse> => {
  const token = getToken();
  const { activityId, ...params } = query;

  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const url = `/api/event-participants/${activityId}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取报名列表失败");
  }

  return {
    data: data.participants || [],
    total: data.total || 0,
    page: data.page || 1,
    pageSize: data.pageSize || 20,
  };
};

/**
 * 更新报名状态(批量)
 */
export const updateEnrollmentStatus = async (
  request: UpdateEnrollmentStatusRequest
): Promise<void> => {
  const token = getToken();

  const response = await fetch("/api/update-enrollment-status", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "更新报名状态失败");
  }
};

/**
 * 导入报名数据(Excel)
 */
export const importEnrollments = async (
  request: ImportEnrollmentRequest
): Promise<ImportEnrollmentResponse> => {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", request.file);
  formData.append("activity_id", request.activityId);

  const response = await fetch("/api/import-participants", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "导入失败");
  }

  return {
    success: true,
    imported: data.imported_count || 0,
    failed: data.failed_count || 0,
    errors: data.errors,
  };
};

/**
 * 导出报名数据(Excel)
 */
export const exportEnrollments = async (activityId: string): Promise<Blob> => {
  const token = getToken();

  const response = await fetch(`/api/export-participants/${activityId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("导出失败");
  }

  return response.blob();
};

/**
 * 发送通知给报名用户
 */
export const sendNotification = async (
  request: SendNotificationRequest
): Promise<void> => {
  const token = getToken();

  const response = await fetch("/api/send-notification", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      activity_id: request.activityId,
      participant_ids: request.enrollmentIds,
      message: request.message,
      send_to_all: request.sendToAll,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "发送通知失败");
  }
};

/**
 * 获取报名详细列表（新接口）
 * 使用 GET /api/events/{eventId}/enrollments
 * 返回完整的报名数据，包括 customFields
 */
export const getEnrollmentsDetailed = async (
  activityId: string,
  params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<EnrollmentListResponse> => {
  return api.get(`/api/events/${activityId}/enrollments`, { params });
};

/**
 * 批量导入报名（新接口）
 * 使用 POST /api/events/{eventId}/enrollments/batch-import
 * 前端已完成 Excel 解析，直接传递 enrollments 数组
 */
export const batchImportEnrollments = async (
  activityId: string,
  enrollments: EnrollmentInput[]
): Promise<BatchImportEnrollmentsResponse> => {
  // 使用配置好的 api 实例，会自动处理：
  // - 路由到正确的 Mock URL
  // - 添加 Apifox Token
  // - 添加 API ID
  // - 添加 JWT Token
  // 注意：api 响应拦截器已经返回了 response.data，所以这里直接得到数据
  return api.post(`/api/events/${activityId}/enrollments/batch-import`, {
    enrollments,
  });
};
