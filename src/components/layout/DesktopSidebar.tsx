/**
 * 桌面端侧边导航栏
 * 大屏幕设备 (lg: 1024px+) 显示，替代底部 TabBar
 */

import { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Bell, User, Settings, LogOut, LogIn } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores";
import { useNotifications } from "@/features/user/profile/hooks/useNotifications";
import { useUserProfile } from "@/features/user";
import { useLogout, useRequireAuthNavigation } from "@/features/auth/hooks";
import { OpenEventLogo } from "./OpenEventLogo";

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

export const DesktopSidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { navigateWithAuth } = useRequireAuthNavigation();
  const logout = useLogout();
  const hasIdentity =
    authStatus === "authenticated" && isAuthenticated && !!user;

  // 获取用户资料（包含头像）
  const { data: profileData } = useUserProfile({ enabled: hasIdentity });
  const profile = profileData?.profile;

  // 获取未读消息数 - 使用 React Query 实现响应式更新
  const { data: notificationsData } = useNotifications({ enabled: hasIdentity });
  const unreadCount = notificationsData?.data?.unreadCount ?? 0;

  // 导航配置 - 3Tab: 首页 | 消息 | 我的
  const navItems: NavItem[] = [
    {
      key: "home",
      label: "首页",
      icon: Home,
      path: hasIdentity ? "/u/home" : "/",
    },
    {
      key: "notifications",
      label: "消息",
      icon: Bell,
      path: "/u/notifications",
      badge: unreadCount,
    },
    { key: "profile", label: "我的", icon: User, path: "/u/profile" },
  ];

  const getActiveItem = () => {
    const path = location.pathname;
    const item = navItems.find((n) =>
      n.path === "/" ? path === "/" : path.startsWith(n.path),
    );
    return item?.key || "home";
  };

  const activeKey = getActiveItem();

  const handleLogout = () => {
    logout();
  };

  const handleNavClick = (item: NavItem) => {
    if (item.key === "home") {
      navigate(item.path);
      return;
    }
    navigateWithAuth(item.path, { redirectAfterLogin: "/u/home" });
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 h-screen sticky top-0">
      {/* Logo 和用户信息 */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => navigate(hasIdentity ? "/u/home" : "/")}
          className="flex items-center gap-3 mb-4 group transition-transform duration-150 active:scale-95"
          aria-label="返回首页"
        >
          <OpenEventLogo
            decorative
            className="h-[38px] w-10 shrink-0 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-400 transition-colors duration-200">
            活动家
          </h1>
        </button>
        {hasIdentity && user && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name || user.name || "用户"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {user.name?.charAt(0) || "U"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {profile?.name || user.name || "用户"}
              </p>
            </div>
          </div>
        )}
        {!hasIdentity && (
          <button
            type="button"
            onClick={() =>
              navigateWithAuth("/u/home", {
                redirectAfterLogin: "/u/home",
                showLoginPrompt: false,
              })
            }
        className="flex w-full flex-nowrap items-center gap-3 whitespace-nowrap rounded-xl bg-gray-50 p-3 text-left transition-colors hover:bg-primary-50 dark:bg-gray-700/50 dark:hover:bg-primary-900/20 [&>svg]:shrink-0"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                登录后查看个人信息
              </p>
              <p className="mt-0.5 text-xs text-gray-500">登录 / 注册</p>
            </div>
          </button>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item)}
              className={`
                w-full flex flex-nowrap items-center gap-3 whitespace-nowrap px-4 py-3 rounded-xl [&>svg]:shrink-0
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }
                `}
              >
                <div className="relative">
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-colors"
                  />
                  {!!item.badge && item.badge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[16px] min-w-[16px] items-center justify-center whitespace-nowrap rounded-full bg-error-500 px-1 text-[9px] font-bold tabular-nums text-white">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 底部操作 */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() =>
            navigateWithAuth("/u/settings", { redirectAfterLogin: "/u/home" })
          }
          className="mb-2 flex w-full flex-nowrap items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 [&>svg]:shrink-0"
        >
          <Settings size={20} />
          <span className="text-sm font-medium">设置</span>
        </button>
        {hasIdentity ? (
          <button
            onClick={handleLogout}
          className="flex w-full flex-nowrap items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-error-600 transition-colors hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 [&>svg]:shrink-0"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">退出登录</span>
          </button>
        ) : (
          <button
            onClick={() =>
              navigateWithAuth("/u/home", {
                redirectAfterLogin: "/u/home",
                showLoginPrompt: false,
              })
            }
          className="flex w-full flex-nowrap items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 [&>svg]:shrink-0"
          >
            <LogIn size={20} />
            <span className="text-sm font-medium">登录 / 注册</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default DesktopSidebar;
