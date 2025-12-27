/**
 * 桌面端侧边导航栏
 * 大屏幕设备 (lg: 1024px+) 显示，替代底部 TabBar
 */

import { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, CreditCard, Bell, Settings, LogOut } from "lucide-react";
import { getUnreadCount } from "@/mocks/data/user-notifications";
import { useAuthStore } from "@/features/auth/stores";

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
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const unreadCount = getUnreadCount();

  const navItems: NavItem[] = [
    { key: "home", label: "首页", icon: Home, path: "/u/home" },
    { key: "cards", label: "名片", icon: CreditCard, path: "/u/cards" },
    {
      key: "notifications",
      label: "消息",
      icon: Bell,
      path: "/u/notifications",
      badge: unreadCount,
    },
  ];

  const getActiveItem = () => {
    const path = location.pathname;
    const item = navItems.find((n) => path.startsWith(n.path));
    return item?.key || "home";
  };

  const activeKey = getActiveItem();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 h-screen sticky top-0">
      {/* Logo 和用户信息 */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => navigate("/u/home")}
          className="flex items-center gap-3 mb-4 group transition-transform duration-150 active:scale-95"
          aria-label="返回首页"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-400/30 transition-shadow duration-200">
            <span className="text-white font-bold text-lg">活</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-400 transition-colors duration-200">
            活动家
          </h1>
        </button>
        {user && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-sm">
                {user.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.name || "用户"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">C端用户</p>
            </div>
          </div>
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
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
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
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[9px] font-bold text-white bg-error-500 rounded-full">
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
          onClick={() => navigate("/u/settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors mb-2"
        >
          <Settings size={20} />
          <span className="text-sm font-medium">设置</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">退出登录</span>
        </button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
