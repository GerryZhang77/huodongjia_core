/**
 * Activity API - 活动 API (共享)
 * 业务封装层：调用底层 API + 数据转换
 *
 * 只导出 API 函数，不导出类型（类型由 ./types 模块导出）
 */

// 重新导出底层 API 供 features 使用
export { getActivityDetail, getPublicActivities } from "@/services/activityApi";
