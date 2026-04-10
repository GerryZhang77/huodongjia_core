/**
 * useRegister Hook - 用户注册逻辑
 * 支持学号 + 密码注册，可选头像上传
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import * as authApi from "../services/authApi";
import { uploadAvatar } from "@/services/userApi";

export interface UseRegisterReturn {
  /** 注册（学号 + 密码，可选头像文件） */
  register: (account: string, password: string, avatarFile?: File) => Promise<boolean>;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 清除错误 */
  clearError: () => void;
}

export function useRegister(): UseRegisterReturn {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (account: string, password: string, avatarFile?: File): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.register({
        account,
        password,
        name: account,
        userType: "user",
      });

      if (!response.success) {
        setError(response.message || "注册失败");
        return false;
      }

      if (response.token && response.user) {
        setAuth(response.user, response.token);

        // 清除旧用户的 React Query 缓存
        queryClient.clear();

        // 上传头像（非关键步骤，失败不影响注册）
        if (avatarFile) {
          try {
            await uploadAvatar(avatarFile);
          } catch (e) {
            console.warn("⚠️ [useRegister] 头像上传失败:", e);
          }
        }

        navigate("/u/home", { replace: true });
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

  return { register, loading, error, clearError };
}
