import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// 导入样式 - 顺序很重要
import "./styles/variables.css";
import "./styles/base.css";
import "./index.css";

import App from "./App";

// ========================================
// MSW Mock 配置
// ========================================
async function enableMocking() {
  const useMock = import.meta.env.VITE_USE_MOCK;

  // 仅在 MSW 模式下启用
  if (useMock !== "msw") {
    return;
  }

  // 动态导入 MSW worker (仅开发环境)
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");

    // 启动 MSW worker
    return worker.start({
      onUnhandledRequest: "warn", // 未匹配的请求发出警告
    });
  }
}

// ========================================
// 启动应用
// ========================================
enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
