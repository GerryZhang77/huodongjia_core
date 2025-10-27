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
 * 报名实体
 */
export interface Enrollment {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  userAvatar?: string;
  gender?: Gender;
  age?: number;
  profession?: string;
  city?: string;
  bio?: string;
  requirements?: string;
  additionalInfo?: Record<string, unknown>;
  tags?: string[];
  status: EnrollmentStatus;
  registrationTime: string;
  approvedTime?: string;
  rejectedTime?: string;
  createdAt: string;
  updatedAt: string;
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
 * 报名列表响应
 */
export interface EnrollmentListResponse {
  data: Enrollment[];
  total: number;
  page: number;
  pageSize: number;
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
