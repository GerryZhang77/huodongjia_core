/**
 * Auth 服务 - API 调用
 *
 * 联调模式：通过 axios 调用真实后端 API
 * Mock 模式：MSW 拦截请求返回 mock 数据
 */

import { api } from "@/services/api";
import type { LoginCredentials, LoginResponse } from "../types";

/**
 * 用户登录
 * POST /api/auth/login
 *
 * 后端接受 { identifier, password }
 * identifier 可以是用户名或手机号
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>("/api/auth/login", {
      identifier: credentials.identifier,
      password: credentials.password,
    });

    return response;
  } catch (error: unknown) {
    console.error("❌ [authApi] 登录错误:", error);

    // 提取后端返回的错误信息
    const axiosError = error as { response?: { data?: { message?: string } } };
    const message =
      axiosError?.response?.data?.message || "登录失败，请检查网络连接";

    return {
      success: false,
      message,
    };
  }
}

/**
 * 用户登出
 * POST /api/auth/logout
 */
export async function logout(): Promise<void> {
  try {
    await api.post("/api/auth/logout", {});
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("auth-storage");
  }
}

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<LoginResponse> {
  try {
    const response = await api.get<{ success: boolean; user: LoginResponse["user"] }>("/api/auth/me");
    return {
      success: true,
      message: "获取成功",
      user: response.user,
    };
  } catch (error) {
    console.error("❌ [authApi] 获取用户信息失败:", error);
    return {
      success: false,
      message: "获取用户信息失败",
    };
  }
}

/**
 * 发送短信验证码
 *
 * 注意：后端目前未实现短信验证码接口
 * 联调时此功能暂不可用，保留接口定义以备后续实现
 */
export async function sendSmsCode(
  phone: string,
  type: "register" | "login" | "reset_password" = "register"
): Promise<{ success: boolean; message: string }> {
  try {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return {
        success: false,
        message: "手机号格式不正确",
      };
    }

    // 后端未实现，返回提示
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      message: "验证码已发送（模拟模式，验证码为 123456）",
    };
  } catch (error) {
    console.error("❌ [authApi] 发送验证码失败:", error);
    return {
      success: false,
      message: "发送验证码失败，请稍后重试",
    };
  }
}

/**
 * 验证短信验证码
 *
 * 注意：后端目前未实现，使用固定验证码 123456
 */
export async function verifySmsCode(
  phone: string,
  code: string
): Promise<{ success: boolean; message: string; verified?: boolean }> {
  try {
    // 后端未实现，使用固定验证码
    if (code === "123456") {
      return {
        success: true,
        message: "验证成功",
        verified: true,
      };
    }

    return {
      success: false,
      message: "验证码错误或已过期",
      verified: false,
    };
  } catch (error) {
    console.error("❌ [authApi] 验证码验证失败:", error);
    return {
      success: false,
      message: "验证失败，请稍后重试",
      verified: false,
    };
  }
}

/**
 * 用户注册
 * POST /api/auth/register
 *
 * 后端接受 { account, password, phone?, userType?, name? }
 * account 为学号（3-20位字母/数字/下划线）
 */
export async function register(credentials: {
  account: string;
  password: string;
  phone?: string;
  sms_code?: string;
  name?: string;
  userType?: string;
}): Promise<LoginResponse> {
  try {
    console.log("📝 [authApi] 用户注册:", { account: credentials.account });

    const response = await api.post<LoginResponse>("/api/auth/register", {
      account: credentials.account,
      password: credentials.password,
      phone: credentials.phone,
      name: credentials.name || credentials.account,
      userType: credentials.userType || "user",
    });

    console.log("✅ [authApi] 注册响应:", {
      success: response.success,
      hasUser: !!response.user,
      account: credentials.account,
    });

    return response;
  } catch (error: unknown) {
    console.error("❌ [authApi] 注册失败:", error);

    const axiosError = error as { response?: { data?: { message?: string } } };
    const message =
      axiosError?.response?.data?.message || "注册失败，请稍后重试";

    return {
      success: false,
      message,
    };
  }
}

/**
 * 重置密码
 * PUT /api/auth/password
 *
 * 后端接受 { oldPassword, newPassword }，需要认证
 * 注意：后端不支持通过短信验证码重置密码，仅支持已登录用户修改密码
 */
export async function resetPassword(credentials: {
  phone: string;
  sms_code: string;
  new_password: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔑 [authApi] 重置密码:", { phone: credentials.phone });

    // 后端当前仅支持已登录用户通过旧密码修改，不支持短信验证码重置
    console.warn("⚠️ [authApi] 后端不支持短信验证码重置密码，此功能暂不可用");
    return {
      success: false,
      message: "暂不支持短信验证码重置密码，请联系管理员",
    };
  } catch (error) {
    console.error("❌ [authApi] 重置密码失败:", error);
    return {
      success: false,
      message: "重置密码失败，请稍后重试",
    };
  }
}
