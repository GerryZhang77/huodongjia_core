import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量（从 env/ 目录）
  const env = loadEnv(mode, "env", "");
  const useMock = env.VITE_USE_MOCK;
  const enableDevLocator = env.VITE_ENABLE_DEV_LOCATOR === "true";

  // 调试：打印所有环境变量
  console.log("🐛 调试信息:");
  console.log("   VITE_USE_MOCK:", env.VITE_USE_MOCK);
  console.log("   VITE_API_BASE_URL:", env.VITE_API_BASE_URL);

  // ========================================
  // 条件代理配置
  // ========================================
  // - VITE_USE_MOCK=false: 启用代理到真实后端
  // - VITE_USE_MOCK=apifox: 禁用代理,直接请求 Apifox Mock
  // - VITE_USE_MOCK=msw: 禁用代理,使用 MSW 拦截
  const shouldUseProxy = useMock === "false" || !useMock;

  // 获取代理目标地址（优先使用环境变量中的真实后端地址）
  const proxyTarget = env.VITE_API_BASE_URL || "http://localhost:3001";

  console.log("🔧 Vite 配置信息:");
  console.log("   模式:", mode);
  console.log("   Mock 模式:", useMock || "false (真实后端)");
  console.log("   代理状态:", shouldUseProxy ? "✅ 启用" : "❌ 禁用");
  console.log("   代理目标:", shouldUseProxy ? proxyTarget : "N/A");
  console.log("   环境变量目录: env/");
  console.log("   加载文件: env/.env." + mode);

  return {
    envDir: "env",
    plugins: [
      react(
        enableDevLocator
          ? {
              babel: {
                plugins: ["react-dev-locator"],
              },
            }
          : undefined
      ),
      // traeBadgePlugin({
      //   variant: "dark",
      //   position: "bottom-right",
      //   prodOnly: true,
      //   clickable: true,
      //   clickUrl: "https://www.trae.ai/solo?showJoin=1",
      //   autoTheme: true,
      //   autoThemeTarget: "#root",
      // }),
      tsconfigPaths(),
    ],

    // ========================================
    // 构建优化配置
    // ========================================
    build: {
      rollupOptions: {
        output: {
          // 手动分割代码块，优化首屏加载
          manualChunks: {
            // React 核心库
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            // UI 组件库（最大的依赖）
            "vendor-antd-mobile": ["antd-mobile", "antd-mobile-icons"],
            // 数据管理
            "vendor-data": ["@tanstack/react-query", "zustand", "axios", "zod"],
            // 工具库
            "vendor-utils": ["dayjs", "lodash-es", "classnames"],
          },
        },
      },
      // 提高警告阈值（可选，如果仍有大文件）
      chunkSizeWarningLimit: 600,
    },

    server: {
      host: "0.0.0.0",
      proxy: shouldUseProxy
        ? {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
              configure: (proxy, _options) => {
                proxy.on("error", (err, _req, _res) => {
                  console.log("proxy error", err);
                });
                proxy.on("proxyReq", (proxyReq, req, _res) => {
                  console.log(
                    "Sending Request to the Target:",
                    req.method,
                    req.url
                  );
                });
                proxy.on("proxyRes", (proxyRes, req, _res) => {
                  console.log(
                    "Received Response from the Target:",
                    proxyRes.statusCode,
                    req.url
                  );
                });
              },
            },
          }
        : undefined,
    },
  };
});
