/**
 * useRegister Hook - 用户注册逻辑
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import * as authApi from "../services/authApi";

export interface UseRegisterReturn {
  /** 发送短信验证码 */
  sendSmsCode: (phone: string) => Promise<boolean>;
  /** 注册 */
  register: (
    phone: string,
    smsCode: string,
    password: string
  ) => Promise<boolean>;
  /** 加载状态 */
  loading: boolean;
  /** 发送验证码加载状态 */
  sendingCode: boolean;
  /** 错误信息 */
  error: string | null;
  /** 清除错误 */
  clearError: () => void;
}

export function useRegister(): UseRegisterReturn {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 发送短信验证码
   */
  const sendSmsCode = async (phone: string): Promise<boolean> => {
    setSendingCode(true);
    setError(null);

    try {
      const response = await authApi.sendSmsCode(phone, "register");

      if (!response.success) {
        setError(response.message || "发送验证码失败");
        return false;
      }

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "发送验证码失败，请稍后重试";
      setError(message);
      return false;
    } finally {
      setSendingCode(false);
    }
  };

  /**
   * 用户注册
   */
  const register = async (
    phone: string,
    smsCode: string,
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.register({
        phone,
        sms_code: smsCode,
        password,
      });

      if (!response.success) {
        setError(response.message || "注册失败");
        return false;
      }

      // 注册成功，自动登录
      if (response.token && response.user) {
        setAuth(response.user, response.token);

        // 根据用户类型跳转
        const redirectPath =
          response.user.user_type === "user" ? "/u/home" : "/dashboard";
        navigate(redirectPath, { replace: true });
      }

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "注册失败，请稍后重试";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    sendSmsCode,
    register,
    loading,
    sendingCode,
    error,
    clearError,
  };
}
