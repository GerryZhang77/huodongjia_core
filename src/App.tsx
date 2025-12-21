import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd-mobile";
import { QueryClientProvider } from "@tanstack/react-query";
import zhCN from "antd-mobile/es/locales/zh-CN";
import { queryClient } from "@/config/queryClient";
import { ProtectedRoute } from "./components/ProtectedRoute";

// 加载占位组件
import { Loading } from "./components/Loading";

// 公共页面 - 懒加载
const Login = lazy(() => import("./pages/common/Login"));
const ActivityDetail = lazy(() => import("./pages/common/ActivityDetail"));
const ActivityDetailTemp = lazy(
  () => import("./pages/common/ActivityDetailTemp")
);

// B端商家页面 - 懒加载
const Dashboard = lazy(() =>
  import("./pages/merchant/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const ActivityCreate = lazy(() => import("./pages/merchant/ActivityCreate"));
const ActivityEdit = lazy(() => import("./pages/merchant/ActivityEdit"));
const ActivityManage = lazy(() =>
  import("./pages/merchant/ActivityManage").then((m) => ({
    default: m.ActivityManage,
  }))
);
const EnrollmentManagement = lazy(
  () => import("./pages/merchant/EnrollmentManagement")
);
const MatchingConfiguration = lazy(
  () => import("./pages/merchant/MatchingConfiguration")
);

// 开发调试页面 - 懒加载
const ComponentShowcase = lazy(() => import("./pages/dev/ComponentShowcase"));

import "./index.css";

// 判断是否为开发环境
const isDevelopment = import.meta.env.DEV;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<Loading fullScreen tip="加载中..." />}>
              <Routes>
                {/* ========== 公开路由 ========== */}
                <Route path="/login" element={<Login />} />

                {/* ========== B端商家路由 ========== */}
                {/* 商家后台首页 */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 创建活动 */}
                <Route
                  path="/dashboard/activity/create"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <ActivityCreate />
                    </ProtectedRoute>
                  }
                />

                {/* 编辑活动 */}
                <Route
                  path="/dashboard/activity/:id/edit"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <ActivityEdit />
                    </ProtectedRoute>
                  }
                />

                {/* 活动管理 */}
                <Route
                  path="/dashboard/activity/:id/manage"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <ActivityManage />
                    </ProtectedRoute>
                  }
                />

                {/* 报名管理 */}
                <Route
                  path="/dashboard/activity/:id/enrollment"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <EnrollmentManagement />
                    </ProtectedRoute>
                  }
                />

                {/* 匹配配置 */}
                <Route
                  path="/dashboard/activity/:id/matching"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <MatchingConfiguration />
                    </ProtectedRoute>
                  }
                />

                {/* ========== 公共活动详情页 (C端用户也可访问) ========== */}
                <Route
                  path="/activity/:id"
                  element={
                    <ProtectedRoute>
                      <ActivityDetail />
                    </ProtectedRoute>
                  }
                />

                {/* 活动详情页 - 预览版本 */}
                <Route
                  path="/activity/preview/:id"
                  element={
                    <ProtectedRoute>
                      <ActivityDetailTemp />
                    </ProtectedRoute>
                  }
                />

                {/* ========== C端用户路由 (预留) ========== */}
                {/* 
              <Route
                path="/u/home"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserHome />
                  </ProtectedRoute>
                }
              />
              */}

                {/* ========== 开发调试路由 ========== */}
                {isDevelopment && (
                  <Route path="/components" element={<ComponentShowcase />} />
                )}

                {/* ========== 兼容旧路由 (重定向) ========== */}
                <Route
                  path="/activity/create"
                  element={<Navigate to="/dashboard/activity/create" replace />}
                />
                <Route
                  path="/activity-edit/:id"
                  element={
                    <Navigate to="/dashboard/activity/:id/edit" replace />
                  }
                />
                <Route
                  path="/activity-manage/:id"
                  element={
                    <Navigate to="/dashboard/activity/:id/manage" replace />
                  }
                />

                {/* ========== 默认路由 ========== */}
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
