/**
 * 底部 TabBar 导航组件
 * 用于移动端和平板端的底部导航
 */

import { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Bell, User } from "lucide-react";

interface TabItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

interface BottomTabBarProps {
  /** 未读消息数量 */
  unreadCount?: number;
}

/**
 * 底部 TabBar 导航
 * 响应式设计，仅在移动端和平板端显示
 * 3Tab 布局: 首页 | 消息 | 我的
 */
export const BottomTabBar: FC<BottomTabBarProps> = ({ unreadCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Tab 配置 - 3Tab: 首页 | 消息 | 我的
  const tabs: TabItem[] = [
    { key: "home", label: "首页", icon: Home, path: "/u/home" },
    {
      key: "notifications",
      label: "消息",
      icon: Bell,
      path: "/u/notifications",
      badge: unreadCount,
    },
    { key: "profile", label: "我的", icon: User, path: "/u/profile" },
  ];

  // 判断当前激活的 Tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/u/notifications")) return "notifications";
    if (
      path.startsWith("/u/profile") ||
      path.startsWith("/u/cards") || // 兼容旧路径
      path.startsWith("/u/settings") ||
      path.startsWith("/u/friends") ||
      path.startsWith("/u/favorites") ||
      path.startsWith("/u/activity-history")
    )
      return "profile";
    return "home";
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: TabItem) => {
    navigate(tab.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="max-w-lg md:max-w-2xl mx-auto bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        <div className="flex items-center h-[52px]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab)}
                className="flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-all duration-200"
              >
                <div className="relative">
                  <Icon
                    size={22}
                    className={`transition-colors ${
                      isActive ? "text-primary-400" : "text-gray-400"
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {tab.badge && tab.badge > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-[16px] min-w-[16px] items-center justify-center whitespace-nowrap rounded-full bg-error-500 px-1 text-[9px] font-bold tabular-nums text-white">
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-primary-400" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* 底部安全区域 (iPhone X 系列) */}
        <div className="h-safe-area-bottom" />
      </div>
    </nav>
  );
};

export default BottomTabBar;
