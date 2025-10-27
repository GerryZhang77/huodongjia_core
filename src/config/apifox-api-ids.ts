/**
 * Apifox API ID 映射配置
 *
 * 说明：
 * - Apifox Cloud Mock 需要 apifoxApiId 才能精确匹配到具体接口
 * - 这个文件维护了所有 API 接口的 apifoxApiId 映射
 * - 在 Apifox Mock 模式下，请求拦截器会自动添加对应的 apifoxApiId
 *
 * 如何获取 apifoxApiId：
 * 1. 在 Apifox 平台打开具体接口
 * 2. 查看浏览器地址栏: https://app.apifox.com/project/7269221/apis/api-{此处就是apiId}
 * 3. 或者点击接口的 Mock 按钮，复制 Mock URL 中的 apifoxApiId 参数
 */

export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  apiId: string;
  description?: string;
}

// ========================================
// 认证模块 API ID 映射
// ========================================
export const AUTH_API_IDS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/auth/login",
    apiId: "366698037",
    description: "普通用户登录",
  },
  {
    method: "POST",
    path: "/api/auth/register",
    apiId: "366698038",
    description: "普通用户注册/商家注册",
  },
  {
    method: "POST",
    path: "/api/auth/organizer/login",
    apiId: "366698039",
    description: "商家登录",
  },
  {
    method: "POST",
    path: "/api/auth/organizer/register",
    apiId: "366698040",
    description: "商家注册",
  },
  {
    method: "POST",
    path: "/api/auth/admin/login",
    apiId: "366698041",
    description: "超级管理员登录",
  },
  {
    method: "GET",
    path: "/api/auth/me",
    apiId: "366698042",
    description: "获取当前用户信息",
  },
  {
    method: "PUT",
    path: "/api/auth/password",
    apiId: "366698043",
    description: "修改密码",
  },
  {
    method: "POST",
    path: "/api/auth/logout",
    apiId: "366698044",
    description: "退出登录",
  },
];

// ========================================
// 活动管理模块 API ID 映射
// ========================================
export const EVENT_API_IDS: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/events",
    apiId: "", // TODO: 从 Apifox 获取
    description: "获取活动列表",
  },
  {
    method: "GET",
    path: "/api/events/:id",
    apiId: "", // TODO: 从 Apifox 获取
    description: "获取活动详情",
  },
  {
    method: "POST",
    path: "/api/events",
    apiId: "", // TODO: 从 Apifox 获取
    description: "创建活动",
  },
  {
    method: "PUT",
    path: "/api/events/:id",
    apiId: "", // TODO: 从 Apifox 获取
    description: "更新活动",
  },
  {
    method: "DELETE",
    path: "/api/events/:id",
    apiId: "", // TODO: 从 Apifox 获取
    description: "删除活动",
  },
];

// ========================================
// 匹配模块 API ID 映射
// ========================================
export const MATCHING_API_IDS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/matching/execute",
    apiId: "", // TODO: 从 Apifox 获取
    description: "执行匹配",
  },
  {
    method: "GET",
    path: "/api/matching/result/:id",
    apiId: "", // TODO: 从 Apifox 获取
    description: "获取匹配结果",
  },
];

// ========================================
// 词嵌入模块 API ID 映射
// ========================================
export const EMBEDDING_API_IDS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/embeddings/compute",
    apiId: "", // TODO: 从 Apifox 获取
    description: "计算词嵌入",
  },
];

// ========================================
// 统一的 API ID 映射表
// ========================================
export const ALL_API_IDS: ApiEndpoint[] = [
  ...AUTH_API_IDS,
  ...EVENT_API_IDS,
  ...MATCHING_API_IDS,
  ...EMBEDDING_API_IDS,
];

// ========================================
// 工具函数：根据请求方法和路径查找 API ID
// ========================================
export function findApifoxApiId(method: string, path: string): string | null {
  // 规范化路径：移除动态参数（如 /api/events/123 -> /api/events/:id）
  const normalizedPath = path.replace(/\/\d+/g, "/:id");

  const endpoint = ALL_API_IDS.find(
    (item) =>
      item.method === method.toUpperCase() && item.path === normalizedPath
  );

  if (endpoint && endpoint.apiId) {
    return endpoint.apiId;
  }

  return null;
}

// ========================================
// 工具函数：获取所有未配置的 API
// ========================================
export function getUnconfiguredApis(): ApiEndpoint[] {
  return ALL_API_IDS.filter((item) => !item.apiId || item.apiId === "");
}
