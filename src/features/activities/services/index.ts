/**
 * Activities Module - Services Barrel Export
 */

// activityApi 导出（各个 API 函数）
export {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  uploadCoverImage,
} from "./activityApi";

// activitiesApi 导出（使用 TanStack Query 的 hooks 使用的 API）
// GetActivitiesResponse 从这里导出，因为它包含 hasMore 属性
export { getMyActivities, type GetActivitiesResponse } from "./activitiesApi";
