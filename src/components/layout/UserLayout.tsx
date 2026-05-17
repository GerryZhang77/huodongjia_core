/**
 * C端用户布局组件
 * 包含底部 TabBar 导航（移动端）和侧边栏导航（桌面端），响应式容器
 */

import { FC, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Bell, User } from "lucide-react";
import { useNotifications } from "@/features/user/profile/hooks/useNotifications";
import { DesktopSidebar } from "./DesktopSidebar";
import { TopBar } from "./TopBar";
import { BreadcrumbItem } from "./types";

interface UserLayoutProps {
  children: ReactNode;
  /** 是否显示导航 (移动端 TabBar / 桌面端 Sidebar) */
  showTabBar?: boolean;
  /** 是否显示顶部栏 */
  showTopBar?: boolean;
  /** 是否显示面包屑 */
  showBreadcrumb?: boolean;
  /** 面包屑数据 */
  breadcrumbItems?: BreadcrumbItem[];
  /** 页面背景色 */
  bgColor?: string;
  /** 自定义 TopBar 右侧内容 */
  topBarRightContent?: ReactNode;
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
 * 响应式设计：
 * - 移动端/平板：全宽容器 + 底部 TabBar
 * - 桌面端：侧边栏导航 + 居中内容区
 */
export const UserLayout: FC<UserLayoutProps> = ({
  children,
  showTabBar = true,
  showTopBar = false,
  showBreadcrumb = false,
  breadcrumbItems = [],
  bgColor = "bg-gray-50",
  topBarRightContent,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 获取未读消息数 - 使用 React Query 实现响应式更新
  const { data: notificationsData } = useNotifications();
  const unreadCount = notificationsData?.data?.unreadCount ?? 0;

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
    const tab = tabs.find((t) => path.startsWith(t.path));
    return tab?.key || "home";
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: TabItem) => {
    navigate(tab.path);
  };

  return (
    <div className={`min-h-screen ${bgColor} dark:bg-gray-900`}>
      {/* 桌面端布局：侧边栏 + 内容区 */}
      <div className="hidden lg:flex">
        {/* 桌面端侧边栏 */}
        {showTabBar && <DesktopSidebar />}

        {/* 桌面端内容区 */}
        <div className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <main className="bg-white dark:bg-gray-800 min-h-screen">
              {/* 顶部栏 */}
              {showTopBar && (
                <TopBar
                  showBreadcrumb={showBreadcrumb}
                  breadcrumbItems={breadcrumbItems}
                  showNotification={true}
                  rightContent={topBarRightContent}
                />
              )}
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* 移动端/平板布局：居中容器 + 底部 TabBar */}
      <div className="lg:hidden">
        {/* 响应式容器 - 移动端全宽，平板居中 */}
        <div className="max-w-lg md:max-w-2xl mx-auto min-h-screen flex flex-col bg-white dark:bg-gray-800 shadow-sm md:shadow-xl">
          {/* 顶部栏 */}
          {showTopBar && (
            <TopBar
              showBreadcrumb={showBreadcrumb}
              breadcrumbItems={breadcrumbItems}
              showNotification={true}
              rightContent={topBarRightContent}
            />
          )}

          {/* 主内容区域 */}
          <main
            className={`flex-1 ${
              showTabBar ? "mobile-tabbar-content-padding" : ""
            }`}
          >
            {children}
          </main>

          {/* 底部 TabBar - 仅移动端和平板显示 */}
          {showTabBar && (
            <nav className="fixed bottom-0 left-0 right-0 z-50">
              <div className="max-w-lg md:max-w-2xl mx-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center h-14">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;

                    return (
                      <button
                        key={tab.key}
                        onClick={() => handleTabClick(tab)}
                        className="flex-1 flex flex-col items-center justify-center h-full gap-1 transition-all duration-200"
                      >
                        <div className="relative leading-none">
                          <Icon
                            size={22}
                            className={`block transition-colors ${
                              isActive ? "text-primary-400" : "text-gray-400"
                            }`}
                            strokeWidth={isActive ? 2.5 : 1.8}
                          />
                          {tab.badge !== undefined && tab.badge > 0 && (
                            <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-error-500 rounded-full">
                              {tab.badge > 99 ? "99+" : tab.badge}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] leading-none font-medium ${
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
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
