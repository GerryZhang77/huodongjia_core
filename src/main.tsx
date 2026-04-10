import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// 导入样式 - 顺序很重要
import "./styles/variables.css";
import "./styles/base.css";
import "./index.css";

import App from "./App";
import "./store/themeStore"; // 导入即触发同步主题初始化

// ========================================
// MSW Mock 配置
// ========================================
async function enableMocking() {
  const useMock = import.meta.env.VITE_USE_MOCK;

  // 开发环境：根据配置决定是否启用 MSW
  if (import.meta.env.DEV) {
    if (useMock !== "msw") {
      console.log("🚫 MSW Mock 已禁用，使用真实后端");
      return;
    }
    console.log("✅ MSW Mock 已启用");
    const { worker } = await import("./mocks/browser");
    return worker.start({
      onUnhandledRequest: "warn",
    });
  }

  // 生产环境：仅在明确配置时启用 MSW Mock
  if (useMock === "msw") {
    console.log("✅ 生产环境 MSW Mock 已启用");
    const { worker } = await import("./mocks/browser");
    return worker.start({
      onUnhandledRequest: "bypass", // 生产环境静默忽略未匹配请求
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    });
  }

  console.log("🚫 生产环境 MSW Mock 已禁用");
}

// ========================================
// 启动应用
// ========================================
enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
