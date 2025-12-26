/**
 * 顶部导航栏组件
 * 包含 Logo、面包屑、通知等元素
 * 响应式设计：移动端和桌面端适配
 */

import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Sparkles } from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";
import { TopBarProps } from "./types";
import { getUnreadCount } from "@/mocks/data/user-notifications";

/**
 * 顶部导航栏
 * 符合设计系统规范：
 * - 背景: 毛玻璃效果 bg-white/95 backdrop-blur-md
 * - 边框: border-b border-gray-100
 * - 间距: px-4 py-3 (移动端) / px-6 py-4 (桌面端)
 * - Logo: 渐变圆角方块 from-primary-400 to-accent-400
 */
export const TopBar: FC<TopBarProps> = ({
  showBreadcrumb = false,
  breadcrumbItems = [],
  showNotification = true,
  onLogoClick,
  rightContent,
}) => {
  const navigate = useNavigate();
  const unreadCount = getUnreadCount();

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate("/u/home");
    }
  };

  const handleNotificationClick = () => {
    navigate("/u/notifications");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* 左侧：Logo + 面包屑 */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Logo - 可点击返回首页（桌面端隐藏，因为 Sidebar 已有 Logo） */}
            <button
              onClick={handleLogoClick}
              className="lg:hidden flex items-center gap-3 flex-shrink-0 group transition-transform duration-150 active:scale-95"
              aria-label="返回首页"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-400/25 group-hover:shadow-primary-400/40 transition-shadow duration-200">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                {/* 装饰光点 */}
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent-400 rounded-full border-2 border-white" />
              </div>
              <h1 className="text-base md:text-lg font-bold text-gray-900 tracking-tight group-hover:text-primary-400 transition-colors duration-200 hidden sm:block">
                活动家
              </h1>
            </button>

            {/* 面包屑导航（桌面端左对齐，移动端独占一行） */}
            {showBreadcrumb && breadcrumbItems.length > 0 && (
              <div className="min-w-0 lg:flex-1">
                <Breadcrumb items={breadcrumbItems} />
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
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100/80 active:bg-gray-200/80 transition-all duration-200"
                aria-label="通知"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-full shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            ) : null}
          </div>
        </div>

        {/* 移动端面包屑（第二行） */}
        {showBreadcrumb && breadcrumbItems.length > 0 && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
