import { authHandlers } from "./auth";
import { activityHandlers } from "./activities";

// ========================================
// 汇总所有 MSW Handlers
// ========================================
export const handlers = [
  ...authHandlers,
  ...activityHandlers,
  // 后续可添加更多模块：
  // ...enrollmentHandlers,
  // ...matchingHandlers,
];
