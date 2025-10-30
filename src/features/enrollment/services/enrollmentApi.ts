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
  SendNotificationResponse,
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
 * 发送通知给报名用户（新接口）
 * 使用 POST /api/events/{eventId}/enrollments/notify
 */
export const sendEnrollmentNotification = async (
  request: SendNotificationRequest
): Promise<SendNotificationResponse> => {
  const { activityId, ...payload } = request;

  return api.post(`/api/events/${activityId}/enrollments/notify`, payload);
};

/**
 * 旧版发送通知接口（保留兼容）
 */
export const sendNotification = async (
  request: Omit<SendNotificationRequest, "enrollments" | "activityInfo">
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
      content: request.content,
      type: request.type,
      title: request.title,
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
 * 批量导入报名（旧接口 - 已废弃）
 * @deprecated 使用新流程：先上传文件 (fileUploadApi.uploadExcel)，再提交映射 (participantsApi.createParticipants)
 *
 * 旧流程：POST /api/events/{eventId}/enrollments/batch-import
 * 新流程：
 *   1. POST /api/file/upload (上传文件)
 *   2. POST /api/events/{eventId}/participants (提交字段映射和文件路径)
 *   3. GET /api/events/{eventId}/enrollments (刷新报名列表)
 */
export const batchImportEnrollments = async (
  activityId: string,
  enrollments: EnrollmentInput[]
): Promise<BatchImportEnrollmentsResponse> => {
  console.warn(
    "batchImportEnrollments 已废弃，请使用新的导入流程：fileUploadApi + participantsApi"
  );
  return api.post(`/api/events/${activityId}/enrollments/batch-import`, {
    enrollments,
  });
};
