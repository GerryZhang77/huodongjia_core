/**
 * Auth 模块类型定义
 */

/**
 * 用户角色类型
 */
export type UserRole = "organizer" | "admin" | "participant";

/**
 * 用户信息
 */
export interface User {
  id: string;
  identifier: string; // 用户名/账号
  name: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

/**
 * 登录凭证
 */
export interface LoginCredentials {
  identifier: string; // 账号
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
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
