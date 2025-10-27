import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "../src/mocks/server";

// ========================================
// 启动 MSW 服务器 (测试环境)
// ========================================
beforeAll(() => {
  server.listen({
    onUnhandledRequest: "warn",
  });
});

// ========================================
// 每个测试后重置 handlers
// ========================================
afterEach(() => {
  server.resetHandlers();
});

// ========================================
// 所有测试完成后关闭服务器
// ========================================
afterAll(() => {
  server.close();
});
