import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { findApifoxApiId } from "@/config/apifox-api-ids";

// ========================================
// 自定义 API 响应类型
// ========================================
// 由于响应拦截器返回 response.data，实际返回的是数据本身，不是 AxiosResponse
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CustomAxiosInstance
  extends Omit<AxiosInstance, "get" | "post" | "put" | "delete" | "patch"> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get<T = any>(url: string, config?: any): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put<T = any>(url: string, data?: any, config?: any): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete<T = any>(url: string, config?: any): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
}

// ========================================
// 模块路由映射配置
// ========================================
// 根据请求路径前缀，路由到对应模块的 Mock URL
// 注意：路由按照从最具体到最通用的顺序排列

const MODULE_ROUTES = [
  // 报名通知接口（最具体的路径，优先匹配）
  // 在"报名管理 - 通知与导出 API"模块中
  {
    prefix: "/api/events/",
    pattern: /^\/api\/events\/[^/]+\/enrollments\/notify/,
    mockUrl: import.meta.env.VITE_ENROLLMENT_MOCK_URL,
    name: "报名管理模块 - 通知",
  },
  // 认证模块
  {
    prefix: "/api/auth",
    pattern: /^\/api\/auth/,
    mockUrl: import.meta.env.VITE_AUTH_MOCK_URL,
    name: "认证模块",
  },
  // 文件上传模块
  {
    prefix: "/api/file",
    pattern: /^\/api\/file/,
    mockUrl: import.meta.env.VITE_FILE_MOCK_URL,
    name: "文件上传模块",
  },
  // 活动模块（包含批量导入、报名列表等接口）
  // 在"活动管理模块"中
  {
    prefix: "/api/events",
    pattern: /^\/api\/events/,
    mockUrl: import.meta.env.VITE_EVENT_MOCK_URL,
    name: "活动模块",
  },
  // 匹配结果发布（最具体的路径，优先匹配）
  {
    prefix: "/api/match-groups",
    pattern: /^\/api\/match-groups/,
    mockUrl: import.meta.env.VITE_MATCH_RESULT_MOCK_URL,
    name: "匹配结果发布",
  },
  // 匹配模块
  {
    prefix: "/api/matching",
    pattern: /^\/api\/matching/,
    mockUrl: import.meta.env.VITE_MATCHING_MOCK_URL,
    name: "匹配模块",
  },
  // 规则设置模块 (Phase 2 & 3) - 必须在 /api/match 之前，避免被误匹配
  {
    prefix: "/api/match-rules",
    pattern: /^\/api\/match(-rules|\/[^/]+\/(generate|execute))/, // 匹配 /api/match-rules 和 /api/match/:id/generate|execute
    mockUrl: import.meta.env.VITE_RULES_MOCK_URL,
    name: "规则设置模块",
  },
  // 词嵌入模块（使用 /api/match/ 路径）
  {
    prefix: "/api/match",
    pattern: /^\/api\/match\/[^/]+\/(get-embedding|calculate)/, // 只匹配词嵌入相关接口
    mockUrl: import.meta.env.VITE_EMBEDDING_MOCK_URL,
    name: "词嵌入模块",
  },
  // 报名模块（旧版，待废弃）
  {
    prefix: "/api/registrations",
    pattern: /^\/api\/registrations/,
    mockUrl: import.meta.env.VITE_REGISTRATION_MOCK_URL,
    name: "报名模块（旧）",
  },
] as const;

// ========================================
// 根据请求路径获取对应的 Base URL
// ========================================
function getBaseURLByPath(path: string): string {
  const useMock = import.meta.env.VITE_USE_MOCK;

  // 非 Mock 模式：使用统一的真实后端 URL
  if (useMock !== "apifox") {
    return import.meta.env.VITE_API_BASE_URL || "";
  }

  // Apifox Mock 模式：根据路径正则匹配路由到对应模块
  // 按照数组顺序匹配，更具体的规则优先
  for (const route of MODULE_ROUTES) {
    if (route.pattern.test(path)) {
      if (!route.mockUrl) {
        console.warn(
          `警告: 路径 "${path}" 匹配到模块 "${route.name}"，但未配置对应的 Mock URL。`,
          `请在 .env.mock 中配置对应的环境变量。`
        );
        return import.meta.env.VITE_API_BASE_URL || "";
      }
      console.log(`[API Router] ${path} -> ${route.name} (${route.mockUrl})`);
      return route.mockUrl;
    }
  }

  // 未匹配到任何模块，回退到默认 URL
  console.warn(
    `警告: 路径 "${path}" 未匹配到任何已配置的模块。`,
    `已知模块: ${MODULE_ROUTES.map((r) => r.name).join(", ")}`
  );
  return import.meta.env.VITE_API_BASE_URL || "";
}

// ========================================
// 创建 Axios 实例
// ========================================
// 注意：响应拦截器返回 response.data，所以实际返回类型是数据本身
export const api = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
}) as CustomAxiosInstance;

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
