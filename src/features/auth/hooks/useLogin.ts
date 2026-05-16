/**
 * useLogin Hook - 登录逻辑
 */

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores";
import { login as loginApi, loginBySms as loginBySmsApi } from "../services";
import type { LoginCredentials, LoginResponse, User } from "../types";
import { authNotification } from "@/components/ui/AuthNotification/manager";
import { debugLogger } from "@/utils/debugLogger";

const phoneRe = /^1[3-9]\d{9}$/;
const maskPhone = (v: string) =>
  v.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");

/**
 * 计算欢迎语展示名：
 * 1. 优先选"不是手机号形态"的 name / account（用户真实昵称或账号）
 * 2. 都没有就从 phone / name / account / 输入 identifier 里挑一个手机号并脱敏
 * 3. 全空时返回空串（上层会降级为无称呼欢迎语）
 */
function computeDisplayName(user: User, rawIdentifier?: string): string {
  const name = user.name?.trim();
  const account = user.account?.trim();
  const phone = user.phone?.trim();
  const id = rawIdentifier?.trim();

  const realName = [name, account].find((v) => v && !phoneRe.test(v));
  if (realName) return realName;

  const phoneSource = [phone, name, account, id].find(
    (v) => v && phoneRe.test(v),
  );
  return phoneSource ? maskPhone(phoneSource) : "";
}

export function useLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  /**
   * 登录成功的通用收尾：保存认证信息、清缓存、提示欢迎语、跳转
   */
  const handleLoginSuccess = (
    response: LoginResponse,
    rawIdentifier?: string,
  ) => {
    if (!response.user || !response.token) return;

    setAuth(response.user, response.token);
    queryClient.clear();

    const displayName = computeDisplayName(response.user, rawIdentifier);
    if (!response.user.name?.trim() && !response.user.account?.trim()) {
      console.warn(
        "[useLogin] 服务端未返回 name/account，回退到输入 identifier",
        { userId: response.user.id },
      );
    }

    authNotification.success(
      "登录成功",
      displayName ? `欢迎回来，${displayName}！` : "欢迎回来！",
    );

    const redirect = searchParams.get("redirect");
    const safeRedirect = redirect?.startsWith("/") ? redirect : "";
    const targetPath =
      safeRedirect ||
      (response.user.user_type === "user" ? "/u/home" : "/dashboard");
    setTimeout(() => {
      navigate(targetPath, { replace: true });
    }, 1000);
  };

  /**
   * 账号/手机号 + 密码 登录
   * 注意：只有登录成功才跳转到 Dashboard
   * 失败时停留在登录页，显示错误通知
   */
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      debugLogger.log("[useLogin] 开始登录流程(password)");
      const response = await loginApi(credentials);

      if (response.success && response.token && response.user) {
        debugLogger.log("[useLogin] 登录成功，保存认证信息");
        handleLoginSuccess(response, credentials.identifier);
        return true;
      }

      const errorMessage = getErrorMessage(response.code, response.message);
      authNotification.error("登录失败", errorMessage);
      return false;
    } catch (error) {
      console.error("❌ [useLogin] 捕获异常:", error);
      authNotification.error(
        "网络错误",
        "无法连接到服务器，请检查网络连接",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 手机号 + 短信验证码 登录
   */
  const loginBySms = async (phone: string, code: string) => {
    setLoading(true);
    try {
      debugLogger.log("[useLogin] 开始登录流程(sms)");
      const response = await loginBySmsApi(phone, code);

      if (response.success && response.token && response.user) {
        debugLogger.log("[useLogin] 验证码登录成功，保存认证信息");
        handleLoginSuccess(response, phone);
        return true;
      }

      authNotification.error(
        "登录失败",
        response.message || "登录失败，请重试",
      );
      return false;
    } catch (error) {
      console.error("❌ [useLogin] 验证码登录捕获异常:", error);
      authNotification.error(
        "网络错误",
        "无法连接到服务器，请检查网络连接",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loginBySms,
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
