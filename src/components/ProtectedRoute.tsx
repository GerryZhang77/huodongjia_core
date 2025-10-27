/**
 * 路由守卫组件
 * 保护需要登录才能访问的页面
 */

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 受保护的路由组件
 * 未登录用户会被重定向到登录页
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
