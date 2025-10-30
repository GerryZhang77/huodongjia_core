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

// ========================================
// 新导入流程类型定义
// ========================================

/**
 * 文件上传响应
 * 注意：根据 OpenAPI 规范，响应是扁平结构，不是嵌套的 data 对象
 */
export interface FileUploadResponse {
  success: boolean;
  filename: string; // 服务端生成的文件名
  originalname: string; // 原始文件名
  size: number; // 文件大小（字节）
  path: string; // 服务端文件路径（关键字段）
  message: string;
}

/**
 * 参与者导入请求（新流程：先上传文件，再提交映射）
 */
export interface CreateParticipantsRequest {
  filepath: string; // 服务端文件路径
  fieldMapping: Record<string, string>; // 字段映射：{ "Excel列名": "字段名" }
}

/**
 * 参与者导入响应
 */
export interface CreateParticipantsResponse {
  success: boolean;
  data: {
    total: number; // 总记录数
    imported: number; // 成功导入数
    failed: number; // 失败数
    errors?: Array<{
      // 错误详情
      row: number; // 行号
      name?: string; // 姓名
      reason: string; // 失败原因
      field?: string; // 问题字段
    }>;
  };
  message: string;
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
 * 通知类型
 */
export type NotificationType = "approval" | "rejection" | "custom";

/**
 * 报名用户基础信息（用于通知）
 */
export interface EnrollmentBasicInfo {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

/**
 * 活动基础信息（用于通知）
 */
export interface ActivityBasicInfo {
  id: string;
  title: string;
  startTime?: string;
  location?: string;
}

/**
 * 发送通知请求
 */
export interface SendNotificationRequest {
  activityId: string;
  enrollmentIds: string[]; // 必填：接收通知的用户 ID 列表
  type: NotificationType; // 通知类型：批准/拒绝/自定义
  title?: string; // 通知标题（自定义类型必填）
  content: string; // 通知内容（必填）
  enrollments: EnrollmentBasicInfo[]; // 完整的报名用户信息
  activityInfo: ActivityBasicInfo; // 活动基础信息
}

/**
 * 发送通知响应
 */
export interface SendNotificationResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  failures?: Array<{
    enrollmentId: string;
    name: string;
    reason: string;
  }>;
  message?: string;
}

/**
 * 导出报名数据请求
 */
export interface ExportEnrollmentsRequest {
  activityId: string;
  enrollmentIds?: string[]; // 选中的用户 ID，为空则导出全部
  format?: "xlsx" | "csv"; // 导出格式，默认 xlsx
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
