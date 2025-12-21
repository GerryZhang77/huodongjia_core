/**
 * Auth 模块类型定义 (共享)
 *
 * 注意: 严格按照 OpenAPI 文档定义
 * 参考: docs/api_doc/modules/登录模块.openapi.json
 */

/**
 * 用户类型
 * - user: C端普通用户
 * - organizer: B端商家/主办方
 * - admin: 管理员
 */
export type UserType = "user" | "organizer" | "admin";

/**
 * 用户信息
 */
export interface User {
  id: string;
  phone?: string | null;
  name: string;
  user_type: UserType;
  avatar?: string | null;
  age?: number | null;
  occupation?: string | null;
  company?: string | null;
  tags: string[];
  wechat_qr?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * 登录凭证
 */
export interface LoginCredentials {
  identifier: string; // 用户账号（用户名或手机号）
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  code?: string;
}

/**
 * Auth 状态
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * 判断用户是否为商家
 */
export function isMerchant(user: User | null): boolean {
  return user?.user_type === "organizer" || user?.user_type === "admin";
}

/**
 * 判断用户是否为普通用户
 */
export function isNormalUser(user: User | null): boolean {
  return user?.user_type === "user";
}
