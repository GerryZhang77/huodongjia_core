/**
 * Auth 服务 - API 调用
 */

import { api } from "@/services/api";
import type { LoginCredentials, LoginResponse, UserType } from "../types";

/**
 * 根据账号判断用户角色
 * - 以 "user" 开头或包含 "user" 的账号 → 普通用户
 * - 以 "admin" 开头的账号 → 管理员
 * - 其他账号 → 商家 (organizer)
 */
function getUserTypeByIdentifier(identifier: string): UserType {
  const lowerIdentifier = identifier.toLowerCase();
  if (lowerIdentifier.startsWith("user") || lowerIdentifier.includes("user")) {
    return "user";
  }
  if (lowerIdentifier.startsWith("admin")) {
    return "admin";
  }
  return "organizer";
}

/**
 * 用户登录
 * 根据 OpenAPI 文档: POST /api/auth/login
 *
 * 🔧 临时模式: 任意账号密码都可以登录
 * - 账号包含 "user" → 普通用户角色，跳转 /u/home
 * - 账号以 "admin" 开头 → 管理员角色，跳转 /dashboard
 * - 其他账号 → 商家角色，跳转 /dashboard
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    console.log("🔐 [authApi] 发送登录请求:", {
      identifier: credentials.identifier,
      // password 不打印
    });

    // 🔧 临时: 直接返回 mock 成功响应，跳过真实 API 调用
    const userType = getUserTypeByIdentifier(credentials.identifier);
    const mockResponse: LoginResponse = {
      success: true,
      message: "登录成功",
      token: "mock_token_" + Date.now(),
      user: {
        id: "user_" + Date.now(),
        name: credentials.identifier || "测试用户",
        phone: credentials.identifier.includes("@")
          ? ""
          : credentials.identifier,
        user_type: userType, // 根据账号自动判断角色
        tags: [],
      },
    };

    console.log("✅ [authApi] Mock 登录响应:", {
      success: mockResponse.success,
      message: mockResponse.message,
      hasToken: !!mockResponse.token,
      hasUser: !!mockResponse.user,
      user: mockResponse.user,
    });

    return mockResponse;

    /* 🔧 真实 API 调用 (已禁用)
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
    */
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

/**
 * 发送短信验证码
 */
export async function sendSmsCode(
  phone: string,
  type: "register" | "login" | "reset_password" = "register"
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("📱 [authApi] 发送短信验证码:", { phone, type });

    // 🔧 临时 Mock：模拟发送成功
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return {
        success: false,
        message: "手机号格式不正确",
      };
    }

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("✅ [authApi] 短信验证码发送成功 (Mock)");
    return {
      success: true,
      message: "验证码已发送",
    };

    /* 🔧 真实 API 调用 (已禁用)
    const response = await api.post("/api/auth/send-sms", { phone, type });
    return response;
    */
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
 */
export async function verifySmsCode(
  phone: string,
  code: string
): Promise<{ success: boolean; message: string; verified?: boolean }> {
  try {
    console.log("🔍 [authApi] 验证短信验证码:", { phone, code });

    // 🔧 临时 Mock：验证码为 123456 时通过
    if (code === "123456") {
      console.log("✅ [authApi] 验证码验证成功 (Mock)");
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

    /* 🔧 真实 API 调用 (已禁用)
    const response = await api.post("/api/auth/verify-sms", { phone, code });
    return response;
    */
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
 */
export async function register(credentials: {
  phone: string;
  sms_code: string;
  password: string;
}): Promise<LoginResponse> {
  try {
    console.log("📝 [authApi] 用户注册:", { phone: credentials.phone });

    // 🔧 临时 Mock：模拟注册成功
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockResponse: LoginResponse = {
      success: true,
      message: "注册成功",
      token: "mock_token_" + Date.now(),
      user: {
        id: "user_" + Date.now(),
        name: "新用户",
        phone: credentials.phone,
        user_type: "user",
        tags: [],
      },
    };

    console.log("✅ [authApi] 注册成功 (Mock):", {
      success: mockResponse.success,
      hasUser: !!mockResponse.user,
    });

    return mockResponse;

    /* 🔧 真实 API 调用 (已禁用)
    const response = await api.post("/api/auth/register", credentials);
    return response;
    */
  } catch (error) {
    console.error("❌ [authApi] 注册失败:", error);
    return {
      success: false,
      message: "注册失败，请稍后重试",
    };
  }
}

/**
 * 重置密码
 */
export async function resetPassword(credentials: {
  phone: string;
  sms_code: string;
  new_password: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔑 [authApi] 重置密码:", { phone: credentials.phone });

    // 🔧 临时 Mock：模拟重置成功
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log("✅ [authApi] 密码重置成功 (Mock)");
    return {
      success: true,
      message: "密码重置成功",
    };

    /* 🔧 真实 API 调用 (已禁用)
    const response = await api.post("/api/auth/reset-password", credentials);
    return response;
    */
  } catch (error) {
    console.error("❌ [authApi] 重置密码失败:", error);
    return {
      success: false,
      message: "重置密码失败，请稍后重试",
    };
  }
}
