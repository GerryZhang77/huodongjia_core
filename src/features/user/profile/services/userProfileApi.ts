/**
 * C端个人中心 API
 * 业务封装层：只导出 API 函数，类型由 ../types 导出
 */

// 重新导出底层 API（只有函数）
export {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUserStats,
  changePassword,
} from "@/services/userApi";
