/**
 * Auth Store - 认证状态管理
 *
 * 使用 Zustand 管理认证状态
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthStatus, User } from "../types";

interface AuthStoreState {
  // 状态
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  authStatus: AuthStatus;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setAuthChecking: () => void;
  setAuthAnonymous: () => void;
  setAuthUnavailable: () => void;
  updateUser: (user: Partial<User>) => void;
}

type PersistedAuthState = Pick<AuthStoreState, "token">;

/**
 * Auth Store
 *
 * 持久化存储到 localStorage
 */
export const useAuthStore = create<AuthStoreState>()(
  persist<AuthStoreState, [], [], PersistedAuthState>(
    (set) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      authStatus: "checking",

      // 设置认证信息
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          authStatus: "authenticated",
        });
      },

      // 清除认证信息
      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          authStatus: "anonymous",
        });
      },

      // 刷新页面后先隐藏缓存身份，等待 /api/auth/me 确认。
      setAuthChecking: () => {
        set({
          user: null,
          isAuthenticated: false,
          authStatus: "checking",
        });
      },

      setAuthAnonymous: () => {
        set({
          user: null,
          isAuthenticated: false,
          authStatus: "anonymous",
        });
      },

      // 服务异常时保留 token 供重试，但绝不恢复缓存用户信息。
      setAuthUnavailable: () => {
        set({
          user: null,
          isAuthenticated: false,
          authStatus: "unavailable",
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
      version: 2,
      // 用户资料和 isAuthenticated 都必须由 /api/auth/me 重新确认。
      partialize: (state) => ({ token: state.token }),
      migrate: (persistedState) => {
        const previous = persistedState as Partial<PersistedAuthState> | null;
        return {
          token: typeof previous?.token === "string" ? previous.token : null,
        };
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PersistedAuthState> | null;
        return {
          ...currentState,
          token: typeof persisted?.token === "string" ? persisted.token : null,
          user: null,
          isAuthenticated: false,
          authStatus: "checking",
        };
      },
    }
  )
);
