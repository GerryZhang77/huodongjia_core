/**
 * 路由守卫组件
 * 保护需要登录才能访问的页面
 * 支持角色权限控制
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores";
import { debugLogger } from "@/utils/debugLogger";
import {
  buildLoginPathWithRedirect,
  savePendingRedirectPath,
} from "@/utils/redirect";
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);
  const setAuthChecking = useAuthStore((state) => state.setAuthChecking);
  const location = useLocation();
  const userType = isUserType(user?.user_type) ? user.user_type : undefined;

  debugLogger.log("[ProtectedRoute] 检查认证状态", {
    authStatus,
    isAuthenticated,
    hasUser: !!user,
    userType: user?.user_type,
    requiredRole,
  });

  if (authStatus === "checking") {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500"
        role="status"
      >
        正在校验登录状态...
      </div>
    );
  }

  if (authStatus === "unavailable") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-center">
        <div className="max-w-sm" role="alert">
          <h1 className="text-base font-semibold text-gray-900">
            暂时无法验证登录状态
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            服务暂时不可用。为保护个人信息，当前不会展示缓存账号，请稍后重试。
          </p>
          <button
            type="button"
            className="mt-5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white"
            onClick={setAuthChecking}
          >
            重新验证
          </button>
        </div>
      </div>
    );
  }

  // 未登录，重定向到登录页
  if (authStatus !== "authenticated" || !isAuthenticated || !user) {
    debugLogger.warn("[ProtectedRoute] 未认证，重定向到登录页");
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    savePendingRedirectPath(redirect);
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
