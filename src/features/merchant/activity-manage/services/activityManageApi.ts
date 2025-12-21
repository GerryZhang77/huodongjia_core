/**
 * B端活动管理 API
 * 业务封装层：只导出 API 函数，类型由 ../types 导出
 */

// 重新导出底层 API（只有函数）
export {
  getMyActivities as getMerchantActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  publishActivity,
  cancelActivity,
} from "@/services/activityApi";
