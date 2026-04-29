/**
 * Auth API - 认证接口
 * 底层 API 调用，与后端接口 1:1 对应
 */

import { api } from "@/services/api";

// ============================================
// 类型定义
// ============================================

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  userType: "user" | "organizer" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

// ============================================
// API 函数
// ============================================

/**
 * 用户登录
 * POST /api/auth/login
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  return api.post<LoginResponse>("/api/auth/login", credentials);
}

/**
 * 用户登出
 * 本地清理登录态；当前后端使用无状态 JWT，不需要请求服务端登出。
 */
export async function logout(): Promise<{ success: boolean }> {
  localStorage.removeItem("auth-storage");
  return { success: true };
}

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<{
  success: boolean;
  user?: User;
}> {
  return api.get("/api/auth/me");
}

/**
 * 刷新 Token
 * POST /api/auth/refresh
 */
export async function refreshToken(): Promise<{
  success: boolean;
  token?: string;
}> {
  return api.post("/api/auth/refresh");
}
