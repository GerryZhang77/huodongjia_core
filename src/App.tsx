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

// C端用户页面 - 懒加载
const UserHome = lazy(() => import("./pages/user/UserHome"));
const UserActivityDetail = lazy(
  () => import("./pages/user/UserActivityDetail")
);
const UserNotifications = lazy(() => import("./pages/user/UserNotifications"));
const UserProfileCards = lazy(() => import("./pages/user/UserProfileCards"));
const UserRegistration = lazy(() => import("./pages/user/UserRegistration"));
const UserMatchResult = lazy(() => import("./pages/user/UserMatchResult"));
const UserDiscover = lazy(() => import("./pages/user/UserDiscover"));
const UserSettings = lazy(() => import("./pages/user/UserSettings"));
const UserFavorites = lazy(() => import("./pages/user/UserFavorites"));
const UserFriends = lazy(() => import("./pages/user/UserFriends"));
const UserEditProfile = lazy(() => import("./pages/user/UserEditProfile"));
const UserActivityHistory = lazy(
  () => import("./pages/user/UserActivityHistory")
);

// 开发调试页面 - 懒加载
const ComponentShowcase = lazy(() => import("./pages/dev/ComponentShowcase"));
const TailwindTest = lazy(() => import("./pages/dev/TailwindTest"));
const SimpleTailwindTest = lazy(() => import("./pages/dev/SimpleTailwindTest"));
const ButtonTest = lazy(() => import("./pages/dev/ButtonTest"));

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

                {/* ========== C端用户路由 ========== */}
                {/* 用户首页 */}
                <Route
                  path="/u/home"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserHome />
                    </ProtectedRoute>
                  }
                />

                {/* 用户活动详情 */}
                <Route
                  path="/u/activities/:id"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserActivityDetail />
                    </ProtectedRoute>
                  }
                />

                {/* 用户通知页 */}
                <Route
                  path="/u/notifications"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserNotifications />
                    </ProtectedRoute>
                  }
                />

                {/* 用户名片页 */}
                <Route
                  path="/u/cards"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserProfileCards />
                    </ProtectedRoute>
                  }
                />

                {/* 活动报名页 */}
                <Route
                  path="/u/activities/:id/register"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserRegistration />
                    </ProtectedRoute>
                  }
                />

                {/* 匹配结果页 */}
                <Route
                  path="/u/activities/:id/match-result"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserMatchResult />
                    </ProtectedRoute>
                  }
                />

                {/* 发现/活动列表页 */}
                <Route
                  path="/u/discover"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserDiscover />
                    </ProtectedRoute>
                  }
                />

                {/* 设置页 */}
                <Route
                  path="/u/settings"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserSettings />
                    </ProtectedRoute>
                  }
                />

                {/* 收藏页 */}
                <Route
                  path="/u/favorites"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserFavorites />
                    </ProtectedRoute>
                  }
                />

                {/* 好友页 */}
                <Route
                  path="/u/friends"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserFriends />
                    </ProtectedRoute>
                  }
                />

                {/* 个人资料 - 重定向到名片页 */}
                <Route
                  path="/u/profile"
                  element={<Navigate to="/u/cards" replace />}
                />

                {/* 编辑名片页 */}
                <Route
                  path="/u/cards/edit"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserEditProfile />
                    </ProtectedRoute>
                  }
                />

                {/* 活动记录页 */}
                <Route
                  path="/u/activities/history"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserActivityHistory />
                    </ProtectedRoute>
                  }
                />

                {/* ========== 开发调试路由 ========== */}
                {isDevelopment && (
                  <>
                    <Route path="/components" element={<ComponentShowcase />} />
                    <Route path="/button-test" element={<ButtonTest />} />
                    <Route path="/tailwind-test" element={<TailwindTest />} />
                    <Route
                      path="/simple-test"
                      element={<SimpleTailwindTest />}
                    />
                  </>
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
