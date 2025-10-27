import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from "vite-plugin-trae-solo-badge";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), "");
  const useMock = env.VITE_USE_MOCK;

  // ========================================
  // 条件代理配置
  // ========================================
  // - VITE_USE_MOCK=false: 启用代理到真实后端
  // - VITE_USE_MOCK=apifox: 禁用代理,直接请求 Apifox Mock
  // - VITE_USE_MOCK=msw: 禁用代理,使用 MSW 拦截
  const shouldUseProxy = useMock === "false" || !useMock;

  console.log("🔧 Vite 配置信息:");
  console.log("   模式:", mode);
  console.log("   Mock 模式:", useMock || "false (真实后端)");
  console.log("   代理状态:", shouldUseProxy ? "✅ 启用" : "❌ 禁用");

  return {
    plugins: [
      react({
        babel: {
          plugins: ["react-dev-locator"],
        },
      }),
      traeBadgePlugin({
        variant: "dark",
        position: "bottom-right",
        prodOnly: true,
        clickable: true,
        clickUrl: "https://www.trae.ai/solo?showJoin=1",
        autoTheme: true,
        autoThemeTarget: "#root",
      }),
      tsconfigPaths(),
    ],
    server: {
      proxy: shouldUseProxy
        ? {
            "/api": {
              target: "http://localhost:3001",
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
