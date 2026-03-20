/**
 * B端商家布局组件 - 重构版
 *
 * 响应式设计：
 * - 移动端/平板 (< 1024px): 全宽容器 + 底部 TabBar
 * - 桌面端 (>= 1024px): 侧边栏导航 + 居中内容区
 *
 * 设计风格：参考用户端布局，适配商家后台操作界面需求
 */

import { FC, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Bell, User, UserSearch } from "lucide-react";
import { MerchantDesktopSidebar } from "./MerchantDesktopSidebar";
import { MerchantTopBar } from "./MerchantTopBar";
import { BreadcrumbItem } from "./types";

interface MerchantLayoutProps {
  children: ReactNode;
  /** 页面标题 (用于移动端顶部栏) */
  title?: string;
  /** 是否显示返回按钮 */
  showBack?: boolean;
  /** 自定义返回处理 */
  onBack?: () => void;
  /** 是否显示底部导航栏 */
  showTabBar?: boolean;
  /** 是否显示顶部栏 */
  showTopBar?: boolean;
  /** 是否显示面包屑 */
  showBreadcrumb?: boolean;
  /** 面包屑数据 */
  breadcrumbItems?: BreadcrumbItem[];
  /** 页面背景色 */
  bgColor?: string;
  /** 右侧操作区域 */
  rightContent?: ReactNode;
  /** 是否使用全宽布局 (不限制最大宽度) */
  fullWidth?: boolean;
  /** 内容区域自定义样式 */
  contentClassName?: string;
}

interface TabItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

/**
 * B端商家布局
 * 响应式设计：
 * - 移动端/平板：全宽容器 + 底部 TabBar
 * - 桌面端：侧边栏导航 + 居中内容区
 */
export const MerchantLayout: FC<MerchantLayoutProps> = ({
  children,
  title,
  showBack = false,
  onBack,
  showTabBar = true,
  showTopBar = true,
  showBreadcrumb = false,
  breadcrumbItems = [],
  bgColor = "bg-gray-50",
  rightContent,
  fullWidth = false,
  contentClassName,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // TODO: 获取未读消息数
  const unreadCount = 3;

  // Tab 配置 - 5Tab: 活动 | 创建 | 用户 | 消息 | 我的
  const tabs: TabItem[] = [
    {
      key: "dashboard",
      label: "活动",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      key: "create",
      label: "创建",
      icon: PlusCircle,
      path: "/dashboard/activity/create",
    },
    {
      key: "user-pool",
      label: "用户",
      icon: UserSearch,
      path: "/dashboard/user-pool",
    },
    {
      key: "notifications",
      label: "消息",
      icon: Bell,
      path: "/dashboard/notifications",
      badge: unreadCount,
    },
    { key: "profile", label: "我的", icon: User, path: "/dashboard/profile" },
  ];

  // 判断当前激活的 Tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path.startsWith("/dashboard/activity/create")) return "create";
    if (path.startsWith("/dashboard/user-pool")) return "user-pool";
    if (path.startsWith("/dashboard/notifications")) return "notifications";
    if (path.startsWith("/dashboard/profile")) return "profile";
    // 活动管理相关页面归到 dashboard
    if (path.startsWith("/dashboard/activity")) return "dashboard";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: TabItem) => {
    navigate(tab.path);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`min-h-screen ${bgColor} dark:bg-gray-900`}>
      {/* 桌面端布局：侧边栏 + 内容区 */}
      <div className="hidden lg:flex">
        {/* 桌面端侧边栏 */}
        {showTabBar && <MerchantDesktopSidebar />}

        {/* 桌面端内容区 */}
        <div className="flex-1 min-h-screen">
          <div className={fullWidth ? "w-full" : "max-w-6xl mx-auto"}>
            <main className="min-h-screen">
              {/* 顶部栏 */}
              {showTopBar && (
                <MerchantTopBar
                  title={title}
                  showBack={showBack}
                  onBack={handleBack}
                  showBreadcrumb={showBreadcrumb}
                  breadcrumbItems={breadcrumbItems}
                  rightContent={rightContent}
                />
              )}
              <div className={`p-6 ${contentClassName || ""}`}>{children}</div>
            </main>
          </div>
        </div>
      </div>

      {/* 移动端/平板布局：居中容器 + 底部 TabBar */}
      <div className="lg:hidden">
        {/* 响应式容器 - 移动端全宽，平板居中 */}
        <div className="max-w-2xl mx-auto min-h-screen flex flex-col bg-white dark:bg-gray-800 shadow-sm md:shadow-xl">
          {/* 顶部栏 */}
          {showTopBar && (
            <MerchantTopBar
              title={title}
              showBack={showBack}
              onBack={handleBack}
              showBreadcrumb={showBreadcrumb}
              breadcrumbItems={breadcrumbItems}
              rightContent={rightContent}
              isMobile
            />
          )}

          {/* 主内容区域 */}
          <main
            className={`flex-1 ${showTabBar ? "pb-16" : ""} ${contentClassName || ""}`}
          >
            {children}
          </main>

          {/* 底部 TabBar - 仅移动端和平板显示 */}
          {showTabBar && (
            <nav className="fixed bottom-0 left-0 right-0 z-50">
              <div className="max-w-2xl mx-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-700">
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

export default MerchantLayout;
