/**
 * Auth Store - 认证状态管理
 *
 * 使用 Zustand 管理认证状态
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

/**
 * Auth Store
 *
 * 持久化存储到 localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,

      // 设置认证信息
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      // 清除认证信息
      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // 更新用户信息
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: "auth-storage", // localStorage key
      // 保存 user, token 和 isAuthenticated
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
