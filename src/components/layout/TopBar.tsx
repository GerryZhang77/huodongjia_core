/**
 * 顶部导航栏组件
 * 包含 Logo、面包屑、通知等元素
 * 响应式设计：移动端和桌面端适配
 */

import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";
import { OpenEventLogo } from "./OpenEventLogo";
import { TopBarProps } from "./types";
import { useNotifications } from "@/features/user/profile/hooks/useNotifications";
import { useAuthStore } from "@/features/auth/stores";
import { useRequireAuthNavigation } from "@/features/auth/hooks";

/**
 * 顶部导航栏
 * 符合设计系统规范：
 * - 背景: 毛玻璃效果 bg-white/95 backdrop-blur-md
 * - 边框: border-b border-gray-100
 * - 间距: px-4 py-3 (移动端) / px-6 py-4 (桌面端)
 * - Logo: 复用登录页 OpenEvent 品牌图形
 *
 * 注意: showNotification 默认关闭，因为底部 TabBar 已有消息入口
 */
export const TopBar: FC<TopBarProps> = ({
  showBreadcrumb = false,
  breadcrumbItems = [],
  showNotification = false, // 改为 false，避免与 TabBar 消息入口重复
  onLogoClick,
  showDesktopBrand = false,
  rightContent,
}) => {
  const navigate = useNavigate();
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { navigateWithAuth } = useRequireAuthNavigation();
  const hasIdentity =
    authStatus === "authenticated" && isAuthenticated && !!user;

  // 获取未读消息数 - 使用 React Query 实现响应式更新
  const { data: notificationsData } = useNotifications({
    enabled: showNotification && hasIdentity,
  });
  const unreadCount = notificationsData?.data?.unreadCount ?? 0;

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate(hasIdentity ? "/u/home" : "/");
    }
  };

  const handleNotificationClick = () => {
    navigateWithAuth("/u/notifications", { redirectAfterLogin: "/u/home" });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-700">
      <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* 左侧：Logo + 面包屑 */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Logo - 有桌面侧栏时仅在小屏显示 */}
            <button
              onClick={handleLogoClick}
              className={`group flex flex-shrink-0 flex-nowrap items-center gap-3 whitespace-nowrap transition-transform duration-150 active:scale-95 ${
                showDesktopBrand ? "" : "lg:hidden"
              }`}
              aria-label="返回首页"
            >
              <OpenEventLogo
                decorative
                className="h-[34px] w-9 shrink-0 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight group-hover:text-primary-400 transition-colors duration-200 hidden sm:block">
                活动家
              </h1>
            </button>

            {/* 面包屑导航：移动端隐藏首页层级并压缩活动标题 */}
            {showBreadcrumb && breadcrumbItems.length > 0 && (
              <div className="min-w-0 flex-1">
                <Breadcrumb items={breadcrumbItems} compactOnMobile />
              </div>
            )}
          </div>

          {/* 右侧：自定义内容或通知按钮 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {rightContent ? (
              rightContent
            ) : showNotification ? (
              <button
                onClick={handleNotificationClick}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 active:bg-gray-200/80 dark:active:bg-gray-600/80 transition-all duration-200"
                aria-label="通知"
              >
                <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-[10px] font-bold tabular-nums text-white shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
