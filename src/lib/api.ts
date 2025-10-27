import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { findApifoxApiId } from "@/config/apifox-api-ids";

// ========================================
// 模块路由映射配置
// ========================================
// 根据请求路径前缀，路由到对应模块的 Mock URL

const MODULE_ROUTES = {
  "/api/auth": import.meta.env.VITE_AUTH_MOCK_URL,
  "/api/events": import.meta.env.VITE_EVENT_MOCK_URL,
  "/api/matching": import.meta.env.VITE_MATCHING_MOCK_URL,
  "/api/registrations": import.meta.env.VITE_REGISTRATION_MOCK_URL,
  "/api/embeddings": import.meta.env.VITE_EMBEDDING_MOCK_URL,
} as const;

// ========================================
// 根据请求路径获取对应的 Base URL
// ========================================
function getBaseURLByPath(path: string): string {
  const useMock = import.meta.env.VITE_USE_MOCK;

  // 非 Mock 模式：使用统一的真实后端 URL
  if (useMock !== "apifox") {
    return import.meta.env.VITE_API_BASE_URL || "";
  }

  // Apifox Mock 模式：根据路径前缀路由到对应模块
  for (const [prefix, mockUrl] of Object.entries(MODULE_ROUTES)) {
    if (path.startsWith(prefix)) {
      if (!mockUrl) {
        console.warn(
          `警告: 路径 "${path}" 匹配到模块 "${prefix}"，但未配置对应的 Mock URL。`,
          `请在 .env.development.mock 中配置对应的环境变量。`
        );
        return import.meta.env.VITE_API_BASE_URL || "";
      }
      console.log(`[API Router] ${path} -> ${mockUrl}`);
      return mockUrl;
    }
  }

  // 未匹配到任何模块，回退到默认 URL
  console.warn(
    `警告: 路径 "${path}" 未匹配到任何已配置的模块。`,
    `已知模块: ${Object.keys(MODULE_ROUTES).join(", ")}`
  );
  return import.meta.env.VITE_API_BASE_URL || "";
}

// ========================================
// 创建 Axios 实例
// ========================================
export const api: AxiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================
// 请求拦截器
// ========================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const useMock = import.meta.env.VITE_USE_MOCK;
    const originalPath = config.url || "";

    // 动态设置 baseURL（根据请求路径）
    config.baseURL = getBaseURLByPath(originalPath);

    // Apifox Mock 模式：保留完整路径（不需要重写）
    // Apifox Mock URL 已经是完整的路径，例如：
    // https://m1.apifoxmock.com/m1/7269221-6996856-6378684/api/auth/login
    if (useMock === "apifox") {
      console.log(`[Apifox] Using full path: ${originalPath}`);
    }

    // 添加 JWT Token（如果存在）
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Apifox Mock 模式：添加 apifoxToken 和 apifoxApiId
    if (useMock === "apifox") {
      const apifoxToken = import.meta.env.VITE_APIFOX_TOKEN;
      if (apifoxToken && config.headers) {
        config.headers["apifoxToken"] = apifoxToken;
        console.log("[Apifox] Token added:", apifoxToken);
      } else {
        console.warn(
          "[Apifox] Mock mode enabled but VITE_APIFOX_TOKEN not configured"
        );
      }

      // 自动添加 apifoxApiId 到查询参数
      const method = config.method || "GET";
      const apiId = findApifoxApiId(method, originalPath);

      if (apiId) {
        // 添加 apifoxApiId 到 URL 查询参数
        const url = new URL(config.url || "", config.baseURL);
        url.searchParams.set("apifoxApiId", apiId);
        config.url = url.pathname + url.search;
        console.log(
          `[Apifox] API ID added: ${apiId} for ${method} ${originalPath}`
        );
      } else {
        console.warn(
          `[Apifox] No API ID found for ${method} ${originalPath}. Please update src/config/apifox-api-ids.ts`
        );
      }
    }

    // 开发环境日志
    if (import.meta.env.DEV) {
      console.log("[API Request]", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// ========================================
// 响应拦截器
// ========================================
api.interceptors.response.use(
  (response) => {
    // 开发环境日志
    if (import.meta.env.DEV) {
      console.log("[API Response]", {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }

    // 直接返回 data 部分（适配我们的响应格式）
    return response.data;
  },
  (error) => {
    // 错误处理
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    console.error("[API Error]", {
      status,
      message,
      url: error.config?.url,
      response: error.response?.data,
    });

    // 401 未授权：清除 token，跳转登录
    if (status === 401) {
      localStorage.removeItem("access_token");

      // 避免在登录页重复跳转
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // 抛出错误供上层处理
    return Promise.reject(error);
  }
);

// ========================================
// 导出便捷方法
// ========================================
export default api;
