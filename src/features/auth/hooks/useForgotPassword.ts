/**
 * useForgotPassword Hook - 忘记密码/重置密码逻辑
 */

import { useState } from "react";
import * as authApi from "../services/authApi";

export interface UseForgotPasswordReturn {
  /** 发送短信验证码 */
  sendSmsCode: (phone: string) => Promise<boolean>;
  /** 验证短信验证码 */
  verifyCode: (phone: string, code: string) => Promise<boolean>;
  /** 重置密码 */
  resetPassword: (
    phone: string,
    smsCode: string,
    newPassword: string
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

export function useForgotPassword(): UseForgotPasswordReturn {
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
      const response = await authApi.sendSmsCode(phone, "reset_password");

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
   * 验证短信验证码
   */
  const verifyCode = async (phone: string, code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.verifySmsCode(phone, code);

      if (!response.success || !response.verified) {
        setError(response.message || "验证码错误或已过期");
        return false;
      }

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "验证失败，请稍后重试";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 重置密码
   */
  const resetPassword = async (
    phone: string,
    smsCode: string,
    newPassword: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.resetPassword({
        phone,
        sms_code: smsCode,
        new_password: newPassword,
      });

      if (!response.success) {
        setError(response.message || "重置密码失败");
        return false;
      }

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "重置密码失败，请稍后重试";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    sendSmsCode,
    verifyCode,
    resetPassword,
    loading,
    sendingCode,
    error,
    clearError,
  };
}
