/**
 * Auth 模块类型定义
 *
 * 注意: 严格按照 OpenAPI 文档定义
 * 参考: docs/api_doc/modules/登录模块.openapi.json
 */

/**
 * 用户类型
 * 对应 OpenAPI schema: User.user_type
 */
export type UserType = "user" | "organizer" | "admin";

/**
 * 用户信息
 * 对应 OpenAPI schema: User
 */
export interface User {
  id: string; // UUID
  phone?: string | null;
  name: string;
  user_type: UserType; // 注意：使用下划线命名，符合后端规范
  age?: number | null;
  occupation?: string | null;
  company?: string | null;
  tags: string[];
  wechat_qr?: string | null;
}

/**
 * 登录凭证
 * 对应 OpenAPI schema: LoginRequest
 */
export interface LoginCredentials {
  identifier: string; // 用户账号（用户名或手机号）
  password: string;
}

/**
 * 登录响应
 * 对应 OpenAPI schema: LoginResponse
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string; // JWT Token
  user?: User;
  code?: string; // 错误代码（ErrorResponse）
}

/**
 * Auth 状态
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

/**
 * 测试账号选项
 */
export interface AccountOption {
  label: string;
  value: string;
  description: string;
}
