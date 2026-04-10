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
 * 报名表单数据（与后端 form_data 字段对应）
 */
export interface EnrollmentFormData {
  // 基本信息
  姓名: string;
  性别: string;
  student_id: string;
  联系方式?: string;
  学院专业?: string;
  年级?: string;
  一句话自我介绍?: string;
  // 匹配信息（必填，用于智能分组计算）
  兴趣爱好: string;
  所在职能部门: string;
  "关注/从事的行业方向": string;
  软件技能: string;
  擅长领域: string;
  // 补充信息（选填）
  过往相关经历?: string;
  所在创投俱乐部?: string;
  过往成果?: string;
  核心人脉资源?: string;
  工作风格?: string;
  擅长工作场景?: string;
  加入初衷?: string;
  可投入时间?: string;
  对社团的理解?: string;
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
