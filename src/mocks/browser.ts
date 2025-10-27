import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// ========================================
// 浏览器环境 MSW Worker
// ========================================
export const worker = setupWorker(...handlers);
