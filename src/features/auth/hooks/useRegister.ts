/**
 * useRegister Hook - 用户注册逻辑
 * 支持手机号 + 验证码 + 密码注册
 */

import { useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import * as authApi from "../services/authApi";
import {
  consumePendingRedirectPath,
  sanitizeRedirectPath,
} from "@/utils/redirect";
import { clearProtectedImageObjectUrlCache } from "@/services/protectedImageCache";

export interface UseRegisterReturn {
  /** 注册（手机号 + 验证码 + 密码 + 用户名） */
  register: (phone: string, smsCode: string, password: string, username?: string) => Promise<boolean>;
  /** 发送验证码 */
  sendCode: (phone: string) => Promise<boolean>;
  /** 加载状态 */
  loading: boolean;
  /** 发送验证码中 */
  sendingCode: boolean;
  /** 倒计时秒数（0 表示可重新发送） */
  countdown: number;
  /** 错误信息 */
  error: string | null;
  /** 清除错误 */
  clearError: () => void;
}

export function useRegister(): UseRegisterReturn {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const startCountdown = useCallback(() => {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendCode = async (phone: string): Promise<boolean> => {
    setError(null);
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError("请输入正确的手机号");
      return false;
    }

    setSendingCode(true);
    try {
      const result = await authApi.sendSmsCode(phone, "register");
      if (result.success) {
        startCountdown();
        return true;
      }
      setError(result.message);
      return false;
    } catch {
      setError("发送验证码失败");
      return false;
    } finally {
      setSendingCode(false);
    }
  };

  const register = async (phone: string, smsCode: string, password: string, username?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // 先验证短信验证码
      const verifyResult = await authApi.verifySmsCode(phone, smsCode);
      if (!verifyResult.success || !verifyResult.verified) {
        setError(verifyResult.message || "验证码错误");
        return false;
      }

      // 注册 — 使用 username 作为 account（若未提供则用手机号）
      const response = await authApi.register({
        account: username || phone,
        password,
        phone,
        sms_code: smsCode,
        name: username || phone,
        userType: "user",
      });

      if (!response.success) {
        setError(response.message || "注册失败");
        return false;
      }

      if (response.token && response.user) {
        setAuth(response.user, response.token);
        clearProtectedImageObjectUrlCache();
        queryClient.clear();
        const redirect = sanitizeRedirectPath(searchParams.get("redirect"));
        const pendingRedirect = consumePendingRedirectPath();
        navigate(redirect || pendingRedirect || "/u/home", { replace: true });
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "注册失败，请稍后重试";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { register, sendCode, loading, sendingCode, countdown, error, clearError };
}
