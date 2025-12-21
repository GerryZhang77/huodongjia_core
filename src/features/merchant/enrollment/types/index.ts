/**
 * B端报名管理 - 类型定义
 */

/**
 * 报名状态
 */
export type EnrollmentStatus =
  | "pending" // 待审核
  | "approved" // 已通过
  | "rejected" // 已拒绝
  | "waitlist" // 候补
  | "cancelled"; // 已取消

/**
 * 报名信息
 */
export interface Enrollment {
  id: string;
  activityId: string;
  userId?: string;
  name: string;
  gender?: "male" | "female" | "other";
  age?: number;
  phone?: string;
  email?: string;
  occupation?: string;
  industry?: string;
  company?: string;
  city?: string;
  bio?: string;
  matchingNeeds?: string;
  tags: string[];
  status: EnrollmentStatus;
  enrolledAt: string;
  updatedAt: string;
}

/**
 * 报名列表响应
 */
export interface EnrollmentListResponse {
  success: boolean;
  participants: Enrollment[];
  total: number;
}

/**
 * 导入报名结果
 */
export interface ImportEnrollmentResult {
  success: boolean;
  total: number;
  successCount: number;
  failedCount: number;
  errors?: Array<{
    row: number;
    field: string;
    reason: string;
  }>;
}

/**
 * 发送通知请求
 */
export interface SendNotificationRequest {
  enrollmentIds: string[];
  templateType: "match_result" | "activity_reminder" | "custom";
  customMessage?: string;
}
