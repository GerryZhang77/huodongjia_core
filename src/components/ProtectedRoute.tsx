/**
 * 路由守卫组件
 * 保护需要登录才能访问的页面
 * 支持角色权限控制
 */

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores";
import { debugLogger } from "@/utils/debugLogger";
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
  const { isAuthenticated, user, token } = useAuthStore();

  debugLogger.log("[ProtectedRoute] 检查认证状态", {
    isAuthenticated,
    hasUser: !!user,
    hasToken: !!token,
    userName: user?.name,
    userType: user?.user_type,
    requiredRole,
  });

  // 未登录，重定向到登录页
  if (!isAuthenticated || !user) {
    debugLogger.warn("[ProtectedRoute] 未认证，重定向到登录页");
    return <Navigate to="/login" replace />;
  }

  // 检查角色权限
  if (requiredRole && !hasPermission(user.user_type, requiredRole)) {
    debugLogger.warn("[ProtectedRoute] 无权限访问，重定向到默认页面", {
      userType: user.user_type,
      requiredRole,
    });
    const defaultPath = getDefaultPathByRole(user.user_type);
    return <Navigate to={defaultPath} replace />;
  }

  debugLogger.log("[ProtectedRoute] 认证通过，渲染子组件");
  return <>{children}</>;
};
