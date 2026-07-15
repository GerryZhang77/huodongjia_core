import { useEffect, useState, type ReactNode } from "react";
import { getCurrentUser } from "../services/authApi";
import { useAuthStore } from "../stores/authStore";
import type { LoginResponse } from "../types";

interface AuthBootstrapProps {
  children: ReactNode;
}

const sessionValidationRequests = new Map<string, Promise<LoginResponse>>();

/** React StrictMode 下复用同一个会话校验请求，避免开发环境重复调用 /auth/me。 */
function validateSession(token: string): Promise<LoginResponse> {
  const existingRequest = sessionValidationRequests.get(token);
  if (existingRequest) return existingRequest;

  const request = getCurrentUser().finally(() => {
    sessionValidationRequests.delete(token);
  });
  sessionValidationRequests.set(token, request);
  return request;
}

/**
 * 在任何业务路由和用户查询渲染前确认持久化 token。
 * 浏览器只持久化 token；用户资料必须由当前 /api/auth/me 响应重新建立。
 */
export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const token = useAuthStore((state) => state.token);
  const authStatus = useAuthStore((state) => state.authStatus);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAuthAnonymous = useAuthStore((state) => state.setAuthAnonymous);
  const setAuthUnavailable = useAuthStore(
    (state) => state.setAuthUnavailable,
  );
  const [hasHydrated, setHasHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (hasHydrated) return;

    const unsubscribe = useAuthStore.persist.onFinishHydration(() =>
      setHasHydrated(true),
    );
    // 防止同步 hydration 恰好发生在首次渲染与订阅之间。
    if (useAuthStore.persist.hasHydrated()) setHasHydrated(true);
    return unsubscribe;
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      if (authStatus !== "anonymous") setAuthAnonymous();
      return;
    }

    if (authStatus !== "checking") return;

    let active = true;
    validateSession(token).then((response) => {
      if (!active) return;

      if (response.success && response.user) {
        setAuth(response.user, token);
        return;
      }

      if (response.code === "UNAUTHORIZED") {
        clearAuth();
        return;
      }

      setAuthUnavailable();
    });

    return () => {
      active = false;
    };
  }, [
    authStatus,
    clearAuth,
    hasHydrated,
    setAuth,
    setAuthAnonymous,
    setAuthUnavailable,
    token,
  ]);

  if (!hasHydrated || authStatus === "checking") {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500"
        role="status"
      >
        正在校验登录状态...
      </div>
    );
  }

  return <>{children}</>;
}
