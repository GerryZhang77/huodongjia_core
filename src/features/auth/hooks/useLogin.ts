/**
 * useLogin Hook - 登录逻辑
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "antd-mobile";
import { useAuthStore } from "../stores";
import { login as loginApi } from "../services";
import type { LoginCredentials } from "../types";

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  /**
   * 执行登录
   */
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);

    try {
      const response = await loginApi(credentials);

      if (response.success && response.token && response.user) {
        // 保存认证信息
        setAuth(response.user, response.token);
        Toast.show({
          icon: "success",
          content: "登录成功",
        });

        // 跳转到 Dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
        return true;
      } else {
        Toast.show({
          icon: "fail",
          content: response.message || "登录失败",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.show({
        icon: "fail",
        content: "网络错误，请重试",
      });
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
