/**
 * C端用户布局组件
 * 包含底部 TabBar 导航，响应式容器
 */

import { FC, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, CreditCard, Bell } from "lucide-react";
import { getUnreadCount } from "@/mocks/data/user-notifications";

interface UserLayoutProps {
  children: ReactNode;
  /** 是否显示底部 TabBar */
  showTabBar?: boolean;
  /** 页面背景色 */
  bgColor?: string;
}

interface TabItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

/**
 * C端用户布局
 * 响应式设计：移动端全宽，平板及以上居中限宽
 */
export const UserLayout: FC<UserLayoutProps> = ({
  children,
  showTabBar = true,
  bgColor = "bg-gray-50",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 获取未读消息数
  const unreadCount = getUnreadCount();

  // Tab 配置
  const tabs: TabItem[] = [
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

  // 判断当前激活的 Tab
  const getActiveTab = () => {
    const path = location.pathname;
    const tab = tabs.find((t) => path.startsWith(t.path));
    return tab?.key || "home";
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: TabItem) => {
    navigate(tab.path);
  };

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* 响应式容器 - 移动端全宽，桌面端居中 */}
      <div className="max-w-lg mx-auto min-h-screen flex flex-col bg-white shadow-sm md:shadow-xl">
        {/* 主内容区域 */}
        <main className={`flex-1 ${showTabBar ? "pb-16" : ""}`}>
          {children}
        </main>

        {/* 底部 TabBar */}
        {showTabBar && (
          <nav className="fixed bottom-0 left-0 right-0 z-50">
            <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-gray-100">
              <div className="flex items-center h-14">
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
                            isActive ? "text-primary-500" : "text-gray-400"
                          }`}
                          strokeWidth={isActive ? 2.5 : 1.8}
                        />
                        {tab.badge && tab.badge > 0 && (
                          <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
                            {tab.badge > 99 ? "99+" : tab.badge}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-medium ${
                          isActive ? "text-primary-500" : "text-gray-400"
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
        )}
      </div>
    </div>
  );
};

export default UserLayout;
