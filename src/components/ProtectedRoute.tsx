/**
 * 路由守卫组件
 * 保护需要登录才能访问的页面
 */

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores";
import { debugLogger } from "@/utils/debugLogger";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 受保护的路由组件
 * 未登录用户会被重定向到登录页
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, token } = useAuthStore();

  debugLogger.log("[ProtectedRoute] 检查认证状态", {
    isAuthenticated,
    hasUser: !!user,
    hasToken: !!token,
    userName: user?.name,
  });
  console.log("🛡️  [ProtectedRoute] 检查认证状态:", {
    isAuthenticated,
    hasUser: !!user,
    hasToken: !!token,
    userName: user?.name,
  });

  if (!isAuthenticated) {
    debugLogger.warn("[ProtectedRoute] 未认证，重定向到登录页");
    console.warn("⚠️  [ProtectedRoute] 未认证，重定向到登录页");
    return <Navigate to="/login" replace />;
  }

  debugLogger.log("[ProtectedRoute] 认证通过，渲染子组件");
  console.log("✅ [ProtectedRoute] 认证通过，渲染子组件");
  return <>{children}</>;
};
