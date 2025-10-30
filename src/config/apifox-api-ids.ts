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
// 注意：根据 OpenAPI 文档，/api/auth/login 用于商家登录
// ========================================
export const AUTH_API_IDS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/auth/login",
    apiId: "366698039",
    description: "商家登录",
  },
  {
    method: "POST",
    path: "/api/auth/register",
    apiId: "366698040",
    description: "商家注册",
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
    apiId: "366698236",
    description: "获取所有活动",
  },
  {
    method: "GET",
    path: "/api/events/:eventId",
    apiId: "366698237",
    description: "获取特定活动信息",
  },
  {
    method: "GET",
    path: "/api/events/my",
    apiId: "366698238",
    description: "获取自己创建的活动",
  },
  {
    method: "POST",
    path: "/api/events/create",
    apiId: "366698241",
    description: "商家创建活动",
  },
  {
    method: "PUT",
    path: "/api/events/:eventId",
    apiId: "366698239",
    description: "编辑活动",
  },
  {
    method: "DELETE",
    path: "/api/events/:eventId",
    apiId: "366698240",
    description: "取消活动",
  },
  {
    method: "POST",
    path: "/api/events/upload-image",
    apiId: "367000012", // 请替换为实际的 API ID
    description: "上传活动封面图片",
  },
  {
    method: "POST",
    path: "/api/events/:eventId/participants",
    apiId: "366773774",
    description: "导入参与者（批量创建报名）",
  },
  {
    method: "GET",
    path: "/:eventId/participants",
    apiId: "366698242",
    description: "获取活动报名信息",
  },
  {
    method: "GET",
    path: "/api/events/:eventId/enrollments",
    apiId: "367265652",
    description: "获取活动报名详细信息列表（包含完整字段和自定义字段）",
  },
  {
    method: "POST",
    path: "/api/events/:eventId/enrollments/batch-import",
    apiId: "367265653",
    description:
      "【已废弃】批量导入报名信息（新流程使用 /api/file/upload + /api/events/:eventId/participants）",
  },
  {
    method: "POST",
    path: "/api/events/:eventId/enrollments/notify",
    apiId: "367358266",
    description: "发送报名通知",
  },
  {
    method: "GET",
    path: "/api/events/:eventId/match-rules",
    apiId: "366698243",
    description: "提取匹配规则",
  },
  {
    method: "POST",
    path: "/api/events/extract-headers",
    apiId: "366698244",
    description: "提取报名表表头",
  },
];

// ========================================
// 文件上传模块 API ID 映射
// ========================================
export const FILE_API_IDS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/file/upload",
    apiId: "366621854",
    description: "上传文件（Excel等）",
  },
];

// ========================================
// 匹配模块 API ID 映射
// ========================================
export const MATCHING_API_IDS: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/matching/:eventId/extract-keywords",
    apiId: "368050996",
    description: "提取用户关键词条",
  },
  {
    method: "GET",
    path: "/api/match-groups/:activityId",
    apiId: "367384350",
    description: "获取匹配结果",
  },
  {
    method: "POST",
    path: "/api/match-groups/:activityId/publish",
    apiId: "367384351",
    description: "发布匹配结果",
  },
];

// ========================================
// 词嵌入模块 API ID 映射
// ========================================
export const EMBEDDING_API_IDS: ApiEndpoint[] = [
  {
    method: "GET", // Apifox 上配置的是 GET，不是 POST
    path: "/api/match/:eventId/get-embedding",
    apiId: "366709734",
    description: "获取词向量",
  },
  {
    method: "GET",
    path: "/api/match/:eventId/calculate",
    apiId: "366709735",
    description: "计算相似度并保存到数据库",
  },
];

// ========================================
// 规则设置模块 API ID 映射 (Phase 2 & 3)
// ========================================
export const RULES_API_IDS: ApiEndpoint[] = [
  // Phase 2: 规则设置
  {
    method: "POST",
    path: "/api/match/:eventId/generate",
    apiId: "367410116",
    description: "AI 生成匹配规则",
  },
  {
    method: "GET",
    path: "/api/match-rules/:activityId",
    apiId: "367410117",
    description: "获取活动规则列表",
  },
  {
    method: "POST",
    path: "/api/match-rules/:activityId",
    apiId: "367410118",
    description: "批量保存规则配置（创建/更新/删除）",
  },
  {
    method: "GET",
    path: "/api/match-rules/:activityId/constraints",
    apiId: "367410119",
    description: "获取约束条件",
  },
  {
    method: "POST",
    path: "/api/match-rules/:activityId/constraints",
    apiId: "367410120",
    description: "保存约束条件",
  },
  // Phase 3: 匹配执行
  {
    method: "POST",
    path: "/api/match/:activityId/execute",
    apiId: "367410121",
    description: "执行匹配算法（异步任务）",
  },
  {
    method: "GET",
    path: "/api/match-rules/task/:taskId",
    apiId: "367410122",
    description: "查询匹配任务进度",
  },
];

// ========================================
// 统一的 API ID 映射表
// ========================================
export const ALL_API_IDS: ApiEndpoint[] = [
  ...AUTH_API_IDS,
  ...EVENT_API_IDS,
  ...FILE_API_IDS,
  ...MATCHING_API_IDS,
  ...EMBEDDING_API_IDS,
  ...RULES_API_IDS,
];

// ========================================
// 工具函数：根据请求方法和路径查找 API ID
// ========================================
export function findApifoxApiId(method: string, path: string): string | null {
  // 规范化路径：移除动态参数（如 /api/events/123 -> /api/events/:eventId）
  const normalizedPath = path
    .replace(/\/[a-f0-9-]{36}(?=\/|$)/gi, "/:eventId") // UUID
    .replace(/\/\d+(?=\/|$)/g, "/:eventId"); // 数字 ID

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
