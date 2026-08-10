/**
 * Enrollment Module - API Service
 * 报名模块 - API 服务
 */

import { api } from "@/services/api";
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
  Enrollment,
  Gender,
  EnrollmentStatus,
} from "../types";

/**
 * 后端返回的原始报名数据结构（数据库字段命名）
 */
interface BackendEnrollment {
  id: string;
  // 后端在不同接口返回字段名不统一，兼容 snake_case 和 camelCase
  event_id?: string;
  eventId?: string;
  user_id?: string | null;
  userId?: string | null;
  name: string;
  /** 用户主页姓名（users.name） */
  profileName?: string;
  /** 报名表单中"姓名"字段（form_data['姓名']） */
  formName?: string;
  avatar?: string | null;
  sex?: string | null;
  age?: number | null;
  occupation?: string | null;
  other_info?: string | null;
  formData?: Record<string, unknown> | null;
  formAnswers?: Record<string, unknown> | null;
  formSchemaSnapshot?: Enrollment["formSchemaSnapshot"];
  answerRevision?: number | null;
  hasUnreviewedChanges?: boolean | null;
  lastParticipantUpdateAt?: string | null;
  updateRequired?: boolean | null;
  updateRequest?: Enrollment["updateRequest"];
  latestChanges?: Enrollment["latestChanges"];
  latestChangeAt?: string | null;
  merchantDerivedFields?: Record<string, string | number> | null;
  registrationTypeId?: string | null;
  registrationTypeName?: string | null;
  registrationTypeMatchEnabled?: boolean | null;
  imageCount?: number | null;
  isExternal?: boolean | null;
  is_external?: boolean | null;
  status: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

/**
 * 转换后端数据到前端 Enrollment 类型
 */
const transformBackendEnrollment = (backend: BackendEnrollment): Enrollment => {
  // 解析 other_info / formData（后端不同接口字段名不一致）
  let otherInfo: Record<string, unknown> = {};
  if (backend.formData && typeof backend.formData === "object") {
    otherInfo = backend.formData as Record<string, unknown>;
  } else if (backend.other_info) {
    if (typeof backend.other_info === "string") {
      try {
        otherInfo = JSON.parse(backend.other_info);
      } catch {
        console.warn("Failed to parse other_info:", backend.other_info);
      }
    } else if (typeof backend.other_info === "object") {
      otherInfo = backend.other_info as Record<string, unknown>;
    }
  }

  // 从 other_info 中提取字段
  const phone = (otherInfo.phone || otherInfo.手机号 || otherInfo.联系方式) as
    | string
    | undefined;
  const email = (otherInfo.email || otherInfo.邮箱 || otherInfo.电子邮箱) as
    | string
    | undefined;
  const company = (otherInfo.company || otherInfo.公司 || otherInfo.单位) as
    | string
    | undefined;
  const industry = (otherInfo.industry || otherInfo.行业) as string | undefined;
  const city = (otherInfo.city || otherInfo.城市 || otherInfo.所在地) as
    | string
    | undefined;

  const registrationTypeName = backend.registrationTypeName || undefined;

  return {
    id: backend.id,
    activityId: backend.event_id ?? backend.eventId ?? "",
    userId: backend.user_id ?? backend.userId ?? undefined,
    name: backend.name,
    profileName: backend.profileName || undefined,
    formName: backend.formName || undefined,
    avatar: backend.avatar ?? null,
    gender: (backend.sex as Gender) || undefined,
    age: backend.age || undefined,
    phone,
    email,
    occupation: backend.occupation || undefined,
    company,
    industry,
    city,
    customFields: {
      ...otherInfo,
      ...(registrationTypeName ? { 报名类型: registrationTypeName } : {}),
    },
    registrationTypeId: backend.registrationTypeId || undefined,
    registrationTypeName,
    registrationTypeMatchEnabled: backend.registrationTypeMatchEnabled ?? undefined,
    imageCount: Number(backend.imageCount) || 0,
    isExternal: backend.isExternal ?? backend.is_external ?? !(
      backend.user_id ?? backend.userId
    ),
    formData: otherInfo,
    formAnswers: backend.formAnswers || {},
    formSchemaSnapshot: backend.formSchemaSnapshot || [],
    answerRevision: backend.answerRevision || 1,
    hasUnreviewedChanges: backend.hasUnreviewedChanges === true,
    lastParticipantUpdateAt: backend.lastParticipantUpdateAt || null,
    updateRequired: backend.updateRequired === true,
    updateRequest: backend.updateRequest || null,
    latestChanges: backend.latestChanges || [],
    latestChangeAt: backend.latestChangeAt || null,
    merchantDerivedFields: backend.merchantDerivedFields || {},
    status: backend.status as EnrollmentStatus,
    enrolledAt: backend.created_at ?? backend.createdAt ?? "",
    updatedAt: backend.updated_at ?? backend.updatedAt ?? "",
  };
};

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
  request: UpdateEnrollmentStatusRequest & { activityId: string }
): Promise<{
  success: boolean;
  message?: string;
  data?: {
    updatedCount: number;
    inAppNotificationTargetCount: number;
    smsQueuedCount: number;
    smsSkippedCount: number;
  };
}> => {
  const { activityId, enrollmentIds, status } = request;
  return api.patch(`/api/enrollments/${activityId}/status`, { enrollment_ids: enrollmentIds, status });
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
 * POST /api/notification/notify
 */
export const sendEnrollmentNotification = async (
  request: SendNotificationRequest
): Promise<SendNotificationResponse> => {
  const { enrollmentIds, title, content, type } = request;
  return api.post(`/api/notification/notify`, {
    enrollment_ids: enrollmentIds,
    title: title || '活动通知',
    message: content,
    type: type || 'enrollment',
  });
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
 * 获取报名列表（详细版）
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
  // 🎯 演示活动 ID 映射：将演示活动 ID 映射为固定 ID
  const DEMO_ACTIVITY_ID = "act-pku-innovation-2025-fall";
  const FIXED_ENROLLMENT_ID = "00000000-0000-0000-0000-000000000000";

  const requestId =
    activityId === DEMO_ACTIVITY_ID ? FIXED_ENROLLMENT_ID : activityId;

  // 后端返回格式: { success: true, data: { enrollments: [], total: number } }
  const response = await api.get<{
    success: boolean;
    data: { enrollments: BackendEnrollment[]; total: number };
  }>(`/api/enrollments/${requestId}`, { params });

  const backendEnrollments = response.data?.enrollments || [];
  const enrollments = backendEnrollments.map(transformBackendEnrollment);

  return {
    success: true,
    enrollments,
    total: response.data?.total ?? enrollments.length,
  };
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
