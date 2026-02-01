/**
 * 商家端桌面侧边导航栏
 * 大屏幕设备 (lg: 1024px+) 显示，替代底部 TabBar
 */

import { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Bell,
  User,
  Settings,
  LogOut,
  CalendarDays,
  UserSearch,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores";

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
  /** 是否为新功能标记 */
  isNew?: boolean;
  /** 功能说明提示 */
  tooltip?: string;
}

export const MerchantDesktopSidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // TODO: 从通知数据获取未读数量
  const unreadCount = 3;

  // 商家端导航配置 - 5项: 活动管理 | 创建活动 | 用户发现 | 消息 | 我的
  const navItems: NavItem[] = [
    {
      key: "dashboard",
      label: "活动管理",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      key: "create",
      label: "创建活动",
      icon: PlusCircle,
      path: "/dashboard/activity/create",
    },
    {
      key: "talent-pool",
      label: "用户发现",
      icon: UserSearch,
      path: "/dashboard/talent-pool",
      isNew: true,
      tooltip: "发现活跃用户，可按活跃度、职业、出勤率等维度筛选并推送活动邀请",
    },
    {
      key: "notifications",
      label: "消息中心",
      icon: Bell,
      path: "/dashboard/notifications",
      badge: unreadCount,
    },
    {
      key: "profile",
      label: "个人中心",
      icon: User,
      path: "/dashboard/profile",
    },
  ];

  const getActiveItem = () => {
    const path = location.pathname;
    // 精确匹配或前缀匹配
    if (path === "/dashboard") return "dashboard";
    if (path.startsWith("/dashboard/activity/create")) return "create";
    if (path.startsWith("/dashboard/talent-pool")) return "talent-pool";
    if (path.startsWith("/dashboard/notifications")) return "notifications";
    if (path.startsWith("/dashboard/profile")) return "profile";
    // 活动管理相关页面都归到 dashboard
    if (path.startsWith("/dashboard/activity")) return "dashboard";
    return "dashboard";
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
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 mb-4 group transition-transform duration-150 active:scale-95"
          aria-label="返回首页"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-400/30 transition-shadow duration-200">
            <CalendarDays className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-400 transition-colors duration-200">
              活动家
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              商家管理后台
            </p>
          </div>
        </button>
        {user && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-sm">
                {user.name?.charAt(0) || "商"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.name || "商家"}
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                {user.user_type === "admin" ? "管理员" : "商家账号"}
              </p>
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
                title={item.tooltip}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
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
                {item.isNew && (
                  <span className="px-1.5 py-0.5 bg-accent-100 text-accent-600 text-[10px] font-bold rounded-full">
                    NEW
                  </span>
                )}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 底部操作 */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => navigate("/dashboard/settings")}
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

export default MerchantDesktopSidebar;
