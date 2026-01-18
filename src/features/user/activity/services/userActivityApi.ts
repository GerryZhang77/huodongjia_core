/**
 * C端活动浏览 API
 * 业务封装层：只导出 API 函数，类型由 ../types 导出
 */

// 从 userApi 导出 C端专属接口
export {
  getUserActivities,
  getRecommendedActivities,
  searchActivities,
  getActivityCategories,
  getUserActivityDetail,
  getFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite,
} from "@/services/userApi";

// 公共接口（B/C端共用）
export { getActivityDetail, getPublicActivities } from "@/services/activityApi";
