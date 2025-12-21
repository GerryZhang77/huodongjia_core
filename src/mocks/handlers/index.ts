/**
 * MSW Handlers 统一入口
 *
 * 聚合所有模块的 Mock Handlers
 */

// 导入各模块 handlers
import { authHandlers } from "./auth.handlers";
import { activityHandlers } from "./events.handlers";
import { enrollmentHandlers } from "./enrollment.handlers";
import { matchingHandlers } from "./matching.handlers";

/**
 * 所有 handlers 的聚合
 * 按业务模块组织，便于维护
 */
export const handlers = [
  // 认证模块
  ...authHandlers,

  // 活动模块
  ...activityHandlers,

  // 报名模块
  ...enrollmentHandlers,

  // 匹配模块
  ...matchingHandlers,
];

// 导出各模块 handlers（用于单独测试）
export { authHandlers } from "./auth.handlers";
export { activityHandlers } from "./events.handlers";
export { enrollmentHandlers } from "./enrollment.handlers";
export { matchingHandlers } from "./matching.handlers";
