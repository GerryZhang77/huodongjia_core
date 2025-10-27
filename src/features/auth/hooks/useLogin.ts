/**
 * useLogin Hook - 登录逻辑
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores";
import { login as loginApi } from "../services";
import type { LoginCredentials } from "../types";
import { authNotification } from "@/components/ui/AuthNotification/manager";

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  /**
   * 执行登录
   *
   * 注意：只有登录成功才跳转到 Dashboard
   * 失败时停留在登录页，显示错误通知
   */
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);

    try {
      const response = await loginApi(credentials);

      // 登录成功
      if (response.success && response.token && response.user) {
        // 保存认证信息到 Store
        setAuth(response.user, response.token);

        // 显示成功通知
        authNotification.success(
          "登录成功",
          `欢迎回来，${response.user.name}！`
        );

        // 延迟跳转，确保通知显示
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000); // 延长到 1 秒，确保用户看到成功提示

        return true;
      } else {
        // 登录失败 - 根据错误代码提供详细信息
        const errorMessage = getErrorMessage(response.code, response.message);

        authNotification.error("登录失败", errorMessage);

        // ⚠️ 重要：登录失败时不跳转，停留在登录页
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);

      // 网络错误或其他异常
      authNotification.error(
        "网络错误",
        "无法连接到服务器，请检查网络连接后重试"
      );

      // ⚠️ 重要：错误时不跳转
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
  };
}

/**
 * 根据错误代码返回用户友好的错误信息
 */
function getErrorMessage(code?: string, defaultMessage?: string): string {
  const errorMessages: Record<string, string> = {
    INVALID_CREDENTIALS: "账号或密码错误，请检查后重试",
    MISSING_CREDENTIALS: "请输入完整的账号和密码",
    ACCOUNT_LOCKED: "账号已被锁定，请联系管理员",
    ACCOUNT_DISABLED: "账号已被禁用",
    TOO_MANY_ATTEMPTS: "登录尝试次数过多，请稍后再试",
    NETWORK_ERROR: "网络连接失败，请检查网络后重试",
  };

  return code && errorMessages[code]
    ? errorMessages[code]
    : defaultMessage || "登录失败，请重试";
}
