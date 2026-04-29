/**
 * Auth 服务 - API 调用
 *
 * 联调模式：通过 axios 调用真实后端 API
 * Mock 模式：MSW 拦截请求返回 mock 数据
 */

import { api } from "@/services/api";
import type { LoginCredentials, LoginResponse } from "../types";

/**
 * 检查账号是否可用
 * GET /api/auth/check-account?account=xxx
 */
export async function checkAccount(account: string): Promise<{ available: boolean; message?: string }> {
  try {
    const response = await api.get<{ success: boolean; available: boolean; message?: string }>(
      `/api/auth/check-account?account=${encodeURIComponent(account)}`
    );
    return { available: response.available, message: response.message };
  } catch {
    return { available: false, message: "检查失败" };
  }
}

/**
 * 检查手机号是否可用
 * GET /api/auth/check-phone?phone=xxx
 */
export async function checkPhone(phone: string): Promise<{ available: boolean; message?: string }> {
  try {
    const response = await api.get<{ success: boolean; available: boolean; message?: string }>(
      `/api/auth/check-phone?phone=${encodeURIComponent(phone)}`
    );
    return { available: response.available, message: response.message };
  } catch {
    return { available: false, message: "检查失败" };
  }
}

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
 * 手机号 + 短信验证码登录
 * POST /api/auth/login-sms
 *
 * 后端接受 { phone, code }
 * 验证码校验在后端完成（调用阿里云），前端不要预先调用 /verify-code。
 */
export async function loginBySms(
  phone: string,
  code: string,
): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>("/api/auth/login-sms", {
      phone,
      code,
    });
    return response;
  } catch (error: unknown) {
    console.error("❌ [authApi] 验证码登录错误:", error);
    const axiosError = error as {
      response?: { data?: { message?: string; code?: string } };
    };
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
 * 本地清理登录态；当前后端使用无状态 JWT，不需要请求服务端登出。
 */
export async function logout(): Promise<void> {
  localStorage.removeItem("auth-storage");
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
 * POST /api/auth/send-code
 */
export async function sendSmsCode(
  phone: string,
  _type: "register" | "login" | "reset_password" = "register"
): Promise<{ success: boolean; message: string }> {
  try {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return {
        success: false,
        message: "手机号格式不正确",
      };
    }

    const response = await api.post<{ success: boolean; message: string }>(
      "/api/auth/send-code",
      { phoneNumber: phone }
    );

    return response;
  } catch (error) {
    console.error("❌ [authApi] 发送验证码失败:", error);
    const axiosError = error as { response?: { data?: { message?: string } } };
    const message =
      axiosError?.response?.data?.message || "发送验证码失败，请稍后重试";
    return {
      success: false,
      message,
    };
  }
}

/**
 * 验证短信验证码
 * POST /api/auth/verify-code
 */
export async function verifySmsCode(
  phone: string,
  code: string
): Promise<{ success: boolean; message: string; verified?: boolean }> {
  try {
    const response = await api.post<{ success: boolean; message: string }>(
      "/api/auth/verify-code",
      { phoneNumber: phone, code }
    );

    return {
      ...response,
      verified: response.success,
    };
  } catch (error) {
    console.error("❌ [authApi] 验证码验证失败:", error);
    const axiosError = error as { response?: { data?: { message?: string } } };
    const message =
      axiosError?.response?.data?.message || "验证失败，请稍后重试";
    return {
      success: false,
      message,
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
 * 注销账号
 * DELETE /api/auth/account
 */
export async function deleteAccount(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(
      "/api/auth/account"
    );
    return response;
  } catch (error) {
    console.error("❌ [authApi] 注销账号失败:", error);
    const axiosError = error as { response?: { data?: { message?: string } } };
    const message =
      axiosError?.response?.data?.message || "注销失败，请稍后重试";
    return {
      success: false,
      message,
    };
  }
}

/**
 * 重置密码（忘记密码场景）
 * POST /api/auth/reset-password-by-sms
 *
 * 后端接受 { phone, code, newPassword }
 * 验证码校验在后端完成（调用阿里云），前端不要预先调用 /verify-code。
 */
export async function resetPassword(credentials: {
  phone: string;
  sms_code: string;
  new_password: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.post<{ success: boolean; message: string }>(
      "/api/auth/reset-password-by-sms",
      {
        phone: credentials.phone,
        code: credentials.sms_code,
        newPassword: credentials.new_password,
      }
    );
    return response;
  } catch (error) {
    console.error("❌ [authApi] 重置密码失败:", error);
    const axiosError = error as { response?: { data?: { message?: string } } };
    const message =
      axiosError?.response?.data?.message || "重置密码失败，请稍后重试";
    return {
      success: false,
      message,
    };
  }
}
