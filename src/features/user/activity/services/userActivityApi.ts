/**
 * C端活动浏览 API
 * 业务封装层：只导出 API 函数，类型由 ../types 导出
 */

// 重新导出底层 API（只有函数）
export {
  // 公共接口
  getActivityDetail,
  getPublicActivities,
  // C端专属接口
  getRecommendedActivities,
  searchActivities,
  getActivityCategories,
  toggleFavoriteActivity,
  getFavoriteActivities,
} from "@/services/activityApi";
