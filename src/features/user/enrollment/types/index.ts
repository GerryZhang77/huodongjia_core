/**
 * C端用户报名 - 类型定义
 */

/**
 * 用户报名状态
 */
export type UserEnrollmentStatus =
  | "pending" // 待审核
  | "approved" // 已通过
  | "rejected" // 已拒绝
  | "waitlist" // 候补
  | "cancelled"; // 已取消

/**
 * 报名表单数据
 */
export interface EnrollmentFormData {
  name: string;
  gender?: "male" | "female" | "other";
  age?: number;
  phone: string;
  email?: string;
  occupation?: string;
  company?: string;
  city?: string;
  bio?: string;
  matchingNeeds?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

/**
 * 用户报名记录
 */
export interface UserEnrollment {
  id: string;
  activityId: string;
  activityTitle: string;
  activityCoverImage?: string;
  activityStartTime: string;
  activityLocation: string;
  status: UserEnrollmentStatus;
  enrolledAt: string;
  // 匹配结果 (如果已发布)
  matchResult?: {
    groupId: string;
    groupMembers: Array<{
      id: string;
      name: string;
      avatar?: string;
      occupation?: string;
    }>;
  };
}

/**
 * 用户报名列表响应
 */
export interface UserEnrollmentListResponse {
  success: boolean;
  enrollments: UserEnrollment[];
  total: number;
}

/**
 * 提交报名响应
 */
export interface SubmitEnrollmentResponse {
  success: boolean;
  message: string;
  enrollment?: UserEnrollment;
}
