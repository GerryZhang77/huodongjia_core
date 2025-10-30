/**
 * Auth 服务 - API 调用
 */

import { api } from "@/lib/api";
import type { LoginCredentials, LoginResponse } from "../types";

/**
 * 用户登录
 * 根据 OpenAPI 文档: POST /api/auth/login
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    console.log("🔐 [authApi] 发送登录请求:", {
      identifier: credentials.identifier,
      // password 不打印
    });

    const response = (await api.post("/api/auth/login", {
      identifier: credentials.identifier,
      password: credentials.password,
    })) as LoginResponse;

    console.log("✅ [authApi] 登录响应:", {
      success: response.success,
      message: response.message,
      hasToken: !!response.token,
      hasUser: !!response.user,
      user: response.user,
    });

    return response;
  } catch (error) {
    console.error("❌ [authApi] 登录错误:", error);
    return {
      success: false,
      message: "登录失败，请重试",
    };
  }
}

/**
 * 用户登出
 * 根据 OpenAPI 文档: POST /api/auth/logout
 */
export async function logout(): Promise<void> {
  try {
    await api.post("/api/auth/logout", {});
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // 清理本地存储
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  }
}

/**
 * 获取当前用户信息
 *
 * @todo 待实现：从 token 或服务器获取用户信息
 */
export async function getCurrentUser(): Promise<LoginResponse> {
  // TODO: 实现从 token 解析或从服务器获取用户信息
  return {
    success: false,
    message: "未实现",
  };
}
