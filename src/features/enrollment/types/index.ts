/**
 * Enrollment Module - Type Definitions
 * 报名模块 - 类型定义
 */

/**
 * 报名状态
 */
export type EnrollmentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

/**
 * 性别
 */
export type Gender = "male" | "female" | "other";

/**
 * 报名实体（完整数据结构，匹配 OpenAPI Enrollment schema）
 */
export interface Enrollment {
  id: string;
  activityId: string;
  userId?: string;
  name: string;
  gender?: Gender;
  age?: number;
  phone?: string;
  email?: string;
  occupation?: string;
  company?: string;
  industry?: string;
  city?: string;
  tags?: string[];
  customFields?: Record<string, unknown>; // 自定义字段，存储未识别的 Excel 列
  status: EnrollmentStatus;
  enrolledAt: string;
  updatedAt: string;
}

/**
 * 批量导入报名输入（匹配 OpenAPI EnrollmentInput schema）
 */
export interface EnrollmentInput {
  name: string; // 必填
  gender?: Gender;
  age?: number;
  phone?: string;
  email?: string;
  occupation?: string;
  company?: string;
  industry?: string;
  city?: string;
  tags?: string[];
  customFields?: Record<string, unknown>; // 自定义字段
}

/**
 * 报名列表查询参数
 */
export interface EnrollmentListQuery {
  activityId: string;
  page?: number;
  pageSize?: number;
  status?: EnrollmentStatus;
  searchText?: string;
  gender?: Gender;
  city?: string;
}

/**
 * 报名列表响应（完整数据结构，匹配 OpenAPI）
 */
export interface EnrollmentListResponse {
  success: boolean;
  total: number;
  enrollments: Enrollment[];
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * 批量导入报名请求（新接口，前端解析）
 */
export interface BatchImportEnrollmentsRequest {
  enrollments: EnrollmentInput[];
}

/**
 * 批量导入报名响应（新接口）
 */
export interface BatchImportEnrollmentsResponse {
  success: boolean;
  successCount: number;
  failedCount: number;
  errors?: Array<{
    index: number;
    name: string;
    reason: string;
    field?: string;
  }>;
  message?: string;
}

/**
 * 更新报名状态请求
 */
export interface UpdateEnrollmentStatusRequest {
  enrollmentIds: string[];
  status: EnrollmentStatus;
  reason?: string;
}

/**
 * 导入报名数据请求
 */
export interface ImportEnrollmentRequest {
  activityId: string;
  file: File;
}

/**
 * 导入报名数据响应
 */
export interface ImportEnrollmentResponse {
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
}

/**
 * 发送通知请求
 */
export interface SendNotificationRequest {
  activityId: string;
  enrollmentIds?: string[];
  message: string;
  sendToAll?: boolean;
}

/**
 * 筛选选项
 */
export interface FilterOptions {
  status: EnrollmentStatus[];
  gender: Gender[];
  city: string[];
  searchText: string;
}

/**
 * Enrollment Store 状态
 */
export interface EnrollmentState {
  enrollments: Enrollment[];
  total: number;
  loading: boolean;
  selectedIds: string[];
  filterOptions: FilterOptions;
  setEnrollments: (enrollments: Enrollment[], total: number) => void;
  setLoading: (loading: boolean) => void;
  setSelectedIds: (ids: string[]) => void;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  clearEnrollments: () => void;
}
