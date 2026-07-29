import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
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
import { useAuthStore } from "@/features/auth/stores";
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap";
import { LoginRequiredPromptProvider } from "@/features/auth/components/LoginRequiredPromptProvider";

// 加载占位组件
import { Loading } from "./components/Loading";

// 公共页面 - 懒加载
const Login = lazy(() => import("./pages/common/Login"));
const Register = lazy(() => import("./pages/common/Register"));
const ForgotPassword = lazy(() => import("./pages/common/ForgotPassword"));
const ActivityDetail = lazy(() => import("./pages/common/ActivityDetail"));
const ActivityDetailTemp = lazy(
  () => import("./pages/common/ActivityDetailTemp"),
);

// B端商家页面 - 懒加载 (使用新版重构组件)
const Dashboard = lazy(() => import("./pages/merchant/DashboardNew"));
const ActivityCreate = lazy(() => import("./pages/merchant/ActivityCreateNew"));
const ActivityEdit = lazy(() => import("./pages/merchant/ActivityEditNew"));
const ActivityManage = lazy(() => import("./pages/merchant/ActivityManageNew"));
const ActivityRecapEdit = lazy(
  () => import("./pages/merchant/ActivityRecapEditPage"),
);
const ActivityRecap = lazy(() => import("./pages/user/ActivityRecapPage"));
const EnrollmentManagement = lazy(
  () => import("./pages/merchant/EnrollmentManagementNew"),
);
// 使用重构后的匹配配置页面
const MatchingConfiguration = lazy(
  () => import("./pages/merchant/MatchingConfig"),
);
const MerchantNotifications = lazy(
  () => import("./pages/merchant/NotificationsPage"),
);
const MerchantProfile = lazy(() => import("./pages/merchant/ProfilePage"));
const MerchantProfileEdit = lazy(
  () => import("./pages/merchant/ProfileEditPage"),
);
const MerchantTemplates = lazy(
  () => import("./pages/merchant/TemplateListPage"),
);
const MerchantHelpCenter = lazy(
  () => import("./pages/merchant/HelpCenterPage"),
);
const MerchantAnalytics = lazy(() => import("./pages/merchant/AnalyticsPage"));
const MerchantSettings = lazy(() => import("./pages/merchant/SettingsPage"));
const UserPool = lazy(() => import("./pages/merchant/UserPoolPage"));

// C端用户页面 - 懒加载
const UserHome = lazy(() => import("./pages/user/UserHome"));
const UserActivityDetail = lazy(
  () => import("./pages/user/UserActivityDetail"),
);
const UserNotifications = lazy(() => import("./pages/user/UserNotifications"));
const UserProfileCards = lazy(() => import("./pages/user/UserProfileCards"));
const UserRegistration = lazy(() => import("./pages/user/UserRegistration"));
const UserMatchResult = lazy(() => import("./pages/user/UserMatchResult"));
const UserMatchDetail = lazy(() => import("./pages/user/UserMatchDetail"));
const UserDiscover = lazy(() => import("./pages/user/UserDiscover"));
const UserSettings = lazy(() => import("./pages/user/UserSettings"));
const UserFavorites = lazy(() => import("./pages/user/UserFavorites"));
const UserFriends = lazy(() => import("./pages/user/UserFriends"));
const UserDiscoverPeople = lazy(
  () => import("./pages/user/UserDiscoverPeople"),
);
const UserConversations = lazy(() => import("./pages/user/UserConversations"));
const UserChatRoom = lazy(() => import("./pages/user/UserChatRoom"));
const UserEditProfile = lazy(() => import("./pages/user/UserEditProfile"));
const UserFieldLibrary = lazy(() => import("./pages/user/UserFieldLibrary"));
const UserActivityHistory = lazy(
  () => import("./pages/user/UserActivityHistory"),
);
const UserPublicProfile = lazy(() => import("./pages/user/UserPublicProfile"));
const NFCResultPage = lazy(() => import("./pages/user/NFCResultPage"));

// 开发调试页面 - 懒加载
const ComponentShowcase = lazy(() => import("./pages/dev/ComponentShowcase"));
const TailwindTest = lazy(() => import("./pages/dev/TailwindTest"));
const SimpleTailwindTest = lazy(() => import("./pages/dev/SimpleTailwindTest"));
const ButtonTest = lazy(() => import("./pages/dev/ButtonTest"));

import "./index.css";
import { RouteScrollRestoration } from "./components/routing/RouteScrollRestoration";

// 判断是否为开发环境
const isDevelopment = import.meta.env.DEV;

interface RouteChunkErrorBoundaryProps {
  children: ReactNode;
}

interface RouteChunkErrorBoundaryState {
  error: Error | null;
}

class RouteChunkErrorBoundary extends Component<
  RouteChunkErrorBoundaryProps,
  RouteChunkErrorBoundaryState
> {
  state: RouteChunkErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[RouteChunkErrorBoundary] 页面资源加载失败", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 px-6 text-center backdrop-blur-sm">
          <div className="max-w-sm">
            <p className="text-base font-semibold text-gray-900">
              页面资源加载失败
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              当前网络没有完成页面代码加载，刷新后会重新请求资源。
            </p>
            <button
              type="button"
              className="mt-5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white"
              onClick={() => window.location.reload()}
            >
              刷新重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const RouteLoadingFallback = () => {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 px-6 text-center backdrop-blur-sm">
      <div>
        <Loading tip={slow ? "资源加载较慢，请检查网络" : "加载中..."} />
        {slow && (
          <button
            type="button"
            className="mt-3 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
            onClick={() => window.location.reload()}
          >
            刷新重试
          </button>
        )}
      </div>
    </div>
  );
};

/** 根入口按身份分流：游客看公开首页，已登录用户进入各自工作台。 */
const DefaultEntryRoute = () => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (authStatus === "authenticated" && isAuthenticated && user) {
    return (
      <Navigate
        to={user.user_type === "user" ? "/u/home" : "/dashboard"}
        replace
      />
    );
  }

  return <UserHome accessMode="guest" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <AuthBootstrap>
          <Router>
            <RouteScrollRestoration />
            <LoginRequiredPromptProvider>
              <div className="min-h-screen bg-gray-50">
                <RouteChunkErrorBoundary>
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Routes>
                {/* ========== 公开路由 ========== */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* NFC 手环 token 页（公开；绑定时需要登录） */}
                <Route path="/nfc/t/:token" element={<NFCResultPage />} />

                {/* NFC 碰一碰结果页（旧路径兼容，公开，无需登录） */}
                <Route path="/nfc/:eventId/:userId" element={<NFCResultPage />} />

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

                {/* 活动回顾编辑（商家） */}
                <Route
                  path="/dashboard/activity/:id/recap/edit"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <ActivityRecapEdit />
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

                {/* 活动详情 (商家端) */}
                <Route
                  path="/dashboard/activity/:id/detail"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <ActivityDetail />
                    </ProtectedRoute>
                  }
                />

                {/* B端商家 - 消息中心 */}
                <Route
                  path="/dashboard/notifications"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <MerchantNotifications />
                    </ProtectedRoute>
                  }
                />

                {/* B端商家 - 个人中心 */}
                <Route
                  path="/dashboard/profile"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <MerchantProfile />
                    </ProtectedRoute>
                  }
                />

                {/* B端商家 - 编辑个人资料 */}
                <Route
                  path="/dashboard/profile/edit"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <MerchantProfileEdit />
                    </ProtectedRoute>
                  }
                />

                {/* B端商家 - 我的模板 */}
                <Route
                  path="/dashboard/profile/templates"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <MerchantTemplates />
                    </ProtectedRoute>
                  }
                />

                {/* B端商家 - 帮助中心 */}
                <Route
                  path="/dashboard/help"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <MerchantHelpCenter />
                    </ProtectedRoute>
                  }
                />

                {/* B端商家 - 数据分析 */}
                <Route
                  path="/dashboard/analytics"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <MerchantAnalytics />
                    </ProtectedRoute>
                  }
                />

                {/* B端商家 - 设置 */}
                <Route
                  path="/dashboard/settings"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <MerchantSettings />
                    </ProtectedRoute>
                  }
                />

                {/* B端商家 - 用户管理 */}
                <Route
                  path="/dashboard/user-pool"
                  element={
                    <ProtectedRoute requiredRole={["organizer", "admin"]}>
                      <UserPool />
                    </ProtectedRoute>
                  }
                />

                {/* ========== 公共活动详情页 (C端用户也可访问) ========== */}
                <Route
                  path="/activity/:id"
                  element={
                    <ProtectedRoute>
                      <UserActivityDetail />
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
                  element={<UserActivityDetail />}
                />

                {/* 活动回顾查看 */}
                <Route
                  path="/u/activities/:id/recap"
                  element={
                    <ProtectedRoute>
                      <ActivityRecap />
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

                {/* 用户个人中心页（原名片页，现为"我的"） */}
                <Route
                  path="/u/profile"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserProfileCards />
                    </ProtectedRoute>
                  }
                />

                {/* 兼容旧路径 /u/cards - 重定向到 /u/profile */}
                <Route
                  path="/u/cards"
                  element={<Navigate to="/u/profile" replace />}
                />

                {/* 活动报名页 */}
                <Route
                  path="/u/activities/:id/register"
                  element={<UserRegistration />}
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

                <Route
                  path="/u/activities/:id/match-result/:userId"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserMatchDetail />
                    </ProtectedRoute>
                  }
                />

                {/* 用户公开资料页 (查看其他用户)
                    商家侧在匹配结果中点击参与者也会进入此页 */}
                <Route
                  path="/u/profile/:userId"
                  element={
                    <ProtectedRoute requiredRole={["user", "organizer", "admin"]}>
                      <UserPublicProfile />
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

                {/* 发现用户（C 端 opt-in 列表） */}
                <Route
                  path="/u/discover/people"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserDiscoverPeople />
                    </ProtectedRoute>
                  }
                />

                {/* 私信会话列表 */}
                <Route
                  path="/u/messages"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserConversations />
                    </ProtectedRoute>
                  }
                />

                {/* 私信聊天室（与某用户/商家） */}
                <Route
                  path="/u/messages/:peerId"
                  element={
                    <ProtectedRoute requiredRole={["user", "organizer", "admin"]}>
                      <UserChatRoom />
                    </ProtectedRoute>
                  }
                />

                {/* 编辑个人资料页 */}
                <Route
                  path="/u/profile/edit"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserEditProfile />
                    </ProtectedRoute>
                  }
                />

                {/* 我的信息库（仅自己可见，可对外公开个别字段） */}
                <Route
                  path="/u/field-library"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <UserFieldLibrary />
                    </ProtectedRoute>
                  }
                />

                {/* 兼容旧路径 /u/cards/edit */}
                <Route
                  path="/u/cards/edit"
                  element={<Navigate to="/u/profile/edit" replace />}
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
                {/* 组件展示页面 - 在所有环境可访问，用于演示和测试 */}
                <Route path="/components" element={<ComponentShowcase />} />

                {/* 其他开发页面 - 仅开发环境 */}
                {isDevelopment && (
                  <>
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
                <Route path="/" element={<DefaultEntryRoute />} />
                    </Routes>
                  </Suspense>
                </RouteChunkErrorBoundary>
              </div>
            </LoginRequiredPromptProvider>
          </Router>
        </AuthBootstrap>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
