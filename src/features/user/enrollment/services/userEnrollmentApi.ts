/**
 * C端用户报名 API
 * 业务封装层：只导出 API 函数，类型由 ../types 导出
 */

// 重新导出底层 API（只有函数）
export {
  submitEnrollment,
  getMyEnrollments,
  getMyEnrollmentDetail as getEnrollmentDetail,
  cancelEnrollment,
  checkEnrollmentStatus,
} from "@/services/enrollmentApi";
