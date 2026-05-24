/**
 * 路由守卫组件
 * 保护需要登录才能访问的页面
 * 支持角色权限控制
 */

import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores";
import { getCurrentUser } from "@/features/auth/services";
import { debugLogger } from "@/utils/debugLogger";
import { buildLoginPathWithRedirect } from "@/utils/redirect";
import type { UserType } from "@/features/auth/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** 允许访问的角色，不传则仅检查登录状态 */
  requiredRole?: UserType | UserType[];
}

/**
 * 根据用户类型获取默认跳转路径
 */
const getDefaultPathByRole = (userType: UserType): string => {
  switch (userType) {
    case "organizer":
    case "admin":
      return "/dashboard";
    case "user":
      return "/u/home";
    default:
      return "/login";
  }
};

const isUserType = (value: unknown): value is UserType => {
  return value === "user" || value === "organizer" || value === "admin";
};

/**
 * 检查用户是否有权限访问
 */
const hasPermission = (
  userType: UserType,
  requiredRole?: UserType | UserType[]
): boolean => {
  if (!requiredRole) return true;
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(userType);
};

/**
 * 受保护的路由组件
 * - 未登录用户会被重定向到登录页
 * - 已登录但无权限的用户会被重定向到其默认页面
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, token, setAuth, clearAuth } = useAuthStore();
  const location = useLocation();
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const userType = isUserType(user?.user_type) ? user.user_type : undefined;
  const requiredRoleKey = useMemo(
    () => (Array.isArray(requiredRole) ? requiredRole.join("|") : requiredRole || ""),
    [requiredRole],
  );
  const shouldRefreshAuth =
    !!token &&
    (!isAuthenticated ||
      !user ||
      !userType ||
      (requiredRole ? !hasPermission(userType, requiredRole) : false));

  useEffect(() => {
    if (!shouldRefreshAuth || refreshAttempted) return;

    let cancelled = false;
    setRefreshing(true);

    getCurrentUser()
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.user && token) {
          setAuth(response.user, token);
        } else if (response.code === "UNAUTHORIZED") {
          clearAuth();
        }
      })
      .catch(() => {
        debugLogger.warn("[ProtectedRoute] 刷新认证状态失败");
      })
      .finally(() => {
        if (!cancelled) {
          setRefreshAttempted(true);
          setRefreshing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    shouldRefreshAuth,
    refreshAttempted,
    token,
    setAuth,
    clearAuth,
    requiredRoleKey,
  ]);

  debugLogger.log("[ProtectedRoute] 检查认证状态", {
    isAuthenticated,
    hasUser: !!user,
    hasToken: !!token,
    userName: user?.name,
    userType: user?.user_type,
    requiredRole,
    refreshAttempted,
  });

  if (shouldRefreshAuth && !refreshAttempted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        {refreshing ? "正在校验登录状态..." : "正在恢复登录状态..."}
      </div>
    );
  }

  // 未登录，重定向到登录页
  if (!isAuthenticated || !user) {
    debugLogger.warn("[ProtectedRoute] 未认证，重定向到登录页");
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={buildLoginPathWithRedirect(redirect)} replace />;
  }

  // 检查角色权限
  if (requiredRole && (!userType || !hasPermission(userType, requiredRole))) {
    debugLogger.warn("[ProtectedRoute] 无权限访问，重定向到默认页面", {
      userType: user.user_type,
      requiredRole,
    });
    const defaultPath = userType ? getDefaultPathByRole(userType) : "/login";
    return <Navigate to={defaultPath} replace />;
  }

  debugLogger.log("[ProtectedRoute] 认证通过，渲染子组件");
  return <>{children}</>;
};
