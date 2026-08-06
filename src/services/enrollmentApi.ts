/**
 * Enrollment API - 报名接口
 * 底层 API 调用，与后端接口 1:1 对应
 */

import { api } from "@/services/api";
import type { RegistrationFormField } from "@/features/activities/types";

// ============================================
// 类型定义
// ============================================

export type EnrollmentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "waitlist"
  | "cancelled";

export interface Enrollment {
  id: string;
  activityId: string;
  userId?: string;
  name: string;
  gender?: "male" | "female" | "other";
  age?: number;
  phone?: string;
  email?: string;
  city?: string;
  occupation?: string;
  industry?: string;
  bio?: string;
  matchingNeeds?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  registrationTypeId?: string;
  registrationTypeName?: string;
  registrationTypeMatchEnabled?: boolean;
  imageCount?: number;
  status: EnrollmentStatus;
  isInfoComplete?: boolean;
  enrolledAt?: string;
  updatedAt?: string;
}

export interface EnrollmentListResponse {
  success: boolean;
  data?: {
    enrollments: Enrollment[];
    total?: number;
  };
  message?: string;
}

export interface EnrollmentDetailResponse {
  success: boolean;
  data?: Enrollment;
  message?: string;
}

export interface ImportEnrollmentResult {
  success: boolean;
  data?: {
    total: number;
    success: number;
    failed: number;
    errors?: Array<{
      row: number;
      field: string;
      reason: string;
    }>;
  };
  message?: string;
}

export type EnrollmentFormData = Record<string, string | string[]>;
export type EnrollmentImageAnswers = Record<string, string[]>;

export interface EnrollmentImageAsset {
  id: string;
  field_key: string;
  field_label_snapshot: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export type EnrollmentEditFieldState =
  | "complete"
  | "missing_required"
  | "invalid_option"
  | "reconfirm";

export interface EnrollmentEditContext {
  activityId: string;
  activityTitle: string;
  schema: RegistrationFormField[];
  schemaVersion: number;
  registrationType: { id: string; name: string } | null;
  enrollment: {
    id: string;
    status: EnrollmentStatus;
    answers: Record<string, string | string[]>;
    answerRevision: number;
    hasUnreviewedChanges: boolean;
    lastParticipantUpdateAt?: string | null;
  };
  fieldStates: Array<{
    key: string;
    state: EnrollmentEditFieldState;
    reason?: string;
  }>;
  updateRequest: {
    id: string;
    fieldKeys: string[];
    fieldReasons: Record<string, string>;
    note?: string | null;
    source: "form_change" | "organizer_request";
    requestedAt: string;
  } | null;
  canEdit: boolean;
  editBlockedReason?: string;
}

export interface EnrollmentAnswerChange {
  fieldKey: string;
  label: string;
  before: unknown;
  after: unknown;
  confirmedOnly: boolean;
}

export interface SendNotificationRequest {
  enrollmentIds: string[];
  message: string;
  title?: string;
  type?: "enrollment" | "matching";
  channels?: ("sms" | "email" | "wechat")[];
}

// ============================================
// 商家接口 (B端)
// ============================================

/**
 * 获取活动的报名列表 (商家)
 * GET /api/enrollments/{activityId}
 */
export async function getEnrollmentList(
  activityId: string
): Promise<EnrollmentListResponse> {
  return api.get(`/api/enrollments/${activityId}`);
}

/**
 * 获取报名详情
 * GET /api/enrollments/{eventId}/{userId}
 */
export async function getEnrollmentDetail(
  eventId: string,
  userId: string
): Promise<EnrollmentDetailResponse> {
  return api.get(`/api/enrollments/${eventId}/${userId}`);
}

/**
 * 更新报名状态
 * PATCH /api/enrollments/{eventId}/status
 */
export async function updateEnrollmentStatus(
  eventId: string,
  userId: string,
  status: EnrollmentStatus
): Promise<{ success: boolean }> {
  return api.patch(`/api/enrollments/${eventId}/status`, { userId, status });
}

/**
 * 批量导入报名
 * POST /api/enrollments/{activityId}/import
 */
export async function importEnrollments(
  activityId: string,
  formData: FormData
): Promise<ImportEnrollmentResult> {
  return api.post(`/api/enrollments/${activityId}/import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60_000,
  });
}

/**
 * 导出报名数据
 * GET /api/enrollments/{activityId}/export
 */
export async function exportEnrollments(activityId: string): Promise<Blob> {
  return api.get(`/api/enrollments/${activityId}/export`, {
    responseType: "blob",
  });
}

/**
 * 发送通知
 * POST /api/notification/notify
 */
export async function sendNotification(
  activityId: string,
  data: SendNotificationRequest
): Promise<{ success: boolean; sentCount?: number }> {
  return api.post(`/api/notification/notify`, {
    enrollment_ids: data.enrollmentIds,
    message: data.message,
    title: data.title || "活动通知",
    type: data.type || "enrollment",
    event_id: activityId,
  });
}

// ============================================
// C端用户接口
// ============================================

/**
 * 提交报名 (用户)
 * POST /api/user/activities/{activityId}/enroll
 */
export async function submitEnrollment(
  activityId: string,
  data: EnrollmentFormData,
  registrationTypeId?: string,
  imageAnswers?: EnrollmentImageAnswers,
): Promise<EnrollmentDetailResponse> {
  // 后端期望 { enrollment: {...} } 格式
  return api.post(`/api/user/activities/${activityId}/enroll`, {
    enrollment: data,
    imageAnswers: imageAnswers || {},
    ...(registrationTypeId ? { registrationTypeId } : {}),
  });
}

export async function getEnrollmentEditContext(
  activityId: string,
): Promise<{ success: boolean; data: EnrollmentEditContext }> {
  return api.get(`/api/user/activities/${activityId}/enrollment-edit-context`);
}

export async function updateEnrollmentAnswers(
  activityId: string,
  data: {
    answers: Record<string, string | string[]>;
    schemaVersion: number;
    answerRevision: number;
    confirmedFieldKeys?: string[];
  },
): Promise<{
  success: boolean;
  message?: string;
  data?: { changedFields: EnrollmentAnswerChange[]; status: EnrollmentStatus };
}> {
  return api.patch(`/api/user/activities/${activityId}/enrollment`, data);
}

export async function requestEnrollmentUpdate(
  eventId: string,
  participantId: string,
  data: { fieldKeys: string[]; note?: string },
): Promise<{ success: boolean; message?: string }> {
  return api.post(
    `/api/enrollments/${eventId}/${participantId}/update-request`,
    data,
  );
}

export async function reviewEnrollmentChanges(
  eventId: string,
  participantId: string,
): Promise<{ success: boolean; message?: string }> {
  return api.post(
    `/api/enrollments/${eventId}/${participantId}/changes/review`,
  );
}

export async function uploadEnrollmentImage(
  activityId: string,
  file: File,
  fieldKey: string,
  registrationTypeId?: string,
): Promise<EnrollmentImageAsset> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fieldKey", fieldKey);
  if (registrationTypeId) formData.append("registrationTypeId", registrationTypeId);
  const response = await api.post<{
    success: boolean;
    data: { asset: EnrollmentImageAsset };
  }>(`/api/user/activities/${activityId}/enrollment-images`, formData, {
    timeout: 60_000,
  });
  return response.data.asset;
}

export async function deletePendingEnrollmentImage(assetId: string): Promise<void> {
  await api.delete(`/api/user/enrollment-images/${assetId}`);
}

export async function getEnrollmentImages(
  activityId: string,
  participantId: string,
): Promise<EnrollmentImageAsset[]> {
  const response = await api.get<{
    success: boolean;
    data: { images: EnrollmentImageAsset[] };
  }>(`/api/enrollments/${activityId}/${participantId}/images`);
  return response.data.images || [];
}

export async function getEnrollmentImageBlob(
  activityId: string,
  participantId: string,
  assetId: string,
): Promise<Blob> {
  return api.get(
    `/api/enrollments/${activityId}/${participantId}/images/${assetId}/content`,
    { responseType: "blob" },
  );
}

/**
 * 获取我的报名列表 (用户)
 * GET /api/user/enrollments
 */
export async function getMyEnrollments(): Promise<EnrollmentListResponse> {
  return api.get("/api/user/enrollments");
}

/**
 * 获取我的报名详情 (用户)
 * GET /api/user/enrollments/{id}
 */
export async function getMyEnrollmentDetail(
  id: string
): Promise<EnrollmentDetailResponse> {
  return api.get(`/api/user/enrollments/${id}`);
}

/**
 * 取消报名 (用户)
 * POST /api/user/enrollments/{id}/cancel
 */
export async function cancelEnrollment(
  id: string
): Promise<{ success: boolean }> {
  return api.post(`/api/user/enrollments/${id}/cancel`);
}

/**
 * 检查报名状态 (用户)
 * GET /api/user/activities/{activityId}/enrollment-status
 */
export async function checkEnrollmentStatus(activityId: string): Promise<{
  success: boolean;
  isEnrolled?: boolean;
  enrollment?: Enrollment;
}> {
  return api.get(`/api/user/activities/${activityId}/enrollment-status`);
}
