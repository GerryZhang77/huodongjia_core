/**
 * Auth 服务 - API 调用
 */

import type { LoginCredentials, LoginResponse } from "../types";

/**
 * 用户登录
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    const response = await fetch("/api/auth/login-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "网络错误，请重试",
    };
  }
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  // 清理本地存储
  localStorage.removeItem("token");
  localStorage.removeItem("user");
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
