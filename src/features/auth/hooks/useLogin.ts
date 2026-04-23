/**
 * useLogin Hook - 登录逻辑
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores";
import { login as loginApi } from "../services";
import type { LoginCredentials } from "../types";
import { authNotification } from "@/components/ui/AuthNotification/manager";
import { debugLogger } from "@/utils/debugLogger";

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();
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
      debugLogger.log("[useLogin] 开始登录流程");
      console.log("🚀 [useLogin] 开始登录流程");

      const response = await loginApi(credentials);

      debugLogger.log("[useLogin] 收到响应", {
        success: response.success,
        hasToken: !!response.token,
        hasUser: !!response.user,
      });
      console.log("📥 [useLogin] 收到响应:", {
        success: response.success,
        hasToken: !!response.token,
        hasUser: !!response.user,
      });

      // 登录成功
      if (response.success && response.token && response.user) {
        debugLogger.log("[useLogin] 登录成功，保存认证信息");
        console.log("✅ [useLogin] 登录成功，保存认证信息");

        // 保存认证信息到 Store
        setAuth(response.user, response.token);

        // 清除旧用户的 React Query 缓存，避免数据残留
        queryClient.clear();

        debugLogger.log("[useLogin] 认证信息已保存，检查 localStorage");
        console.log("💾 [useLogin] 认证信息已保存，检查 localStorage");

        const stored = localStorage.getItem("auth-storage");
        debugLogger.log("[useLogin] localStorage 内容", stored);
        console.log("🔍 [useLogin] localStorage 内容:", stored);

        // 显示成功通知
        // 兜底顺序：服务端 name → 服务端 account → 用户刚输入的 identifier（手机号脱敏） → 空
        // 全空时不要再强塞"你"，改用无称呼问候
        const rawName = response.user.name?.trim();
        const rawAccount = response.user.account?.trim();
        const rawIdentifier = credentials.identifier?.trim();
        const maskedIdentifier =
          rawIdentifier && /^1[3-9]\d{9}$/.test(rawIdentifier)
            ? rawIdentifier.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
            : rawIdentifier;
        const displayName = rawName || rawAccount || maskedIdentifier || "";

        if (!rawName && !rawAccount) {
          console.warn(
            "[useLogin] 服务端未返回 name/account，回退到用户输入的 identifier",
            { userId: response.user.id },
          );
        }

        authNotification.success(
          "登录成功",
          displayName ? `欢迎回来，${displayName}！` : "欢迎回来！",
        );

        // 延迟跳转，确保通知显示
        debugLogger.log("[useLogin] 准备跳转");
        console.log("🔄 [useLogin] 准备跳转");

        // 根据用户角色跳转到不同页面
        const targetPath =
          response.user.user_type === "user" ? "/u/home" : "/dashboard";

        setTimeout(() => {
          debugLogger.log(`[useLogin] 执行跳转到 ${targetPath}`);
          console.log(`➡️  [useLogin] 执行跳转到 ${targetPath}`);
          navigate(targetPath, { replace: true });
        }, 1000); // 延长到 1 秒，确保用户看到成功提示

        return true;
      } else {
        console.warn("⚠️  [useLogin] 登录失败:", response.message);

        const errorMessage = getErrorMessage(response.code, response.message);
        authNotification.error("登录失败", errorMessage);

        return false;
      }
    } catch (error) {
      console.error("❌ [useLogin] 捕获异常:", error);

      authNotification.error(
        "网络错误",
        "无法连接到服务器，请检查网络连接"
      );

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
