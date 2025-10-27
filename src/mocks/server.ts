import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// ========================================
// Node.js 环境 MSW Server (用于测试)
// ========================================
export const server = setupServer(...handlers);
