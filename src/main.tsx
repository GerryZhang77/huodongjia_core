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
      return;
    }
    const { worker } = await import("./mocks/browser");
    return worker.start({
      onUnhandledRequest: "warn",
    });
  }

  // 生产环境：临时演示模式，始终启用 MSW Mock
  // TODO: 后端接口完善后移除此逻辑
  const { worker } = await import("./mocks/browser");
  return worker.start({
    onUnhandledRequest: "bypass", // 生产环境静默忽略未匹配请求
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
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
