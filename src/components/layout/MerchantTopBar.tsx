/**
 * 商家端顶部栏组件
 * 支持标题、返回按钮、面包屑和右侧操作区
 */

import { FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { BreadcrumbItem } from "./types";
import { useAuthStore } from "@/features/auth/stores";

interface MerchantTopBarProps {
  /** 页面标题 */
  title?: string;
  /** 是否显示返回按钮 */
  showBack?: boolean;
  /** 返回按钮点击事件 */
  onBack?: () => void;
  /** 是否显示面包屑 */
  showBreadcrumb?: boolean;
  /** 面包屑数据 */
  breadcrumbItems?: BreadcrumbItem[];
  /** 右侧自定义内容 */
  rightContent?: ReactNode;
  /** 是否为移动端样式 */
  isMobile?: boolean;
}

export const MerchantTopBar: FC<MerchantTopBarProps> = ({
  title,
  showBack = false,
  onBack,
  showBreadcrumb = false,
  breadcrumbItems = [],
  rightContent,
  isMobile = false,
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // TODO: 从通知数据获取未读数量
  const unreadCount = 3;

  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  // 移动端样式
  if (isMobile) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center h-14 px-4">
          {/* 返回按钮 */}
          {showBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 -ml-2 mr-2 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="返回"
            >
              <ChevronLeft
                size={24}
                className="text-gray-700 dark:text-gray-200"
              />
            </button>
          )}

          {/* 标题 */}
          <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {title || "活动家"}
          </h1>

          {/* 右侧内容 */}
          <div className="flex items-center gap-2">
            {rightContent}
            {!rightContent && (
              <>
                {/* 通知图标 */}
                <button
                  onClick={() => navigate("/dashboard/notifications")}
                  className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="消息通知"
                >
                  <Bell
                    size={20}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-error-500 rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {/* 用户头像 */}
                <button
                  onClick={() => navigate("/dashboard/profile")}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm"
                  aria-label="个人中心"
                >
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || "商"}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  // 桌面端样式
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-6">
        {/* 左侧：返回按钮 + 面包屑/标题 */}
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="返回"
            >
              <ChevronLeft
                size={22}
                className="text-gray-600 dark:text-gray-300"
              />
            </button>
          )}

          {/* 面包屑 */}
          {showBreadcrumb && breadcrumbItems.length > 0 ? (
            <nav className="flex items-center gap-1 text-sm">
              {breadcrumbItems.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight size={14} className="text-gray-400" />
                  )}
                  {item.path && index < breadcrumbItems.length - 1 ? (
                    <button
                      onClick={() => handleBreadcrumbClick(item)}
                      className="text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          ) : (
            title && (
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
            )
          )}
        </div>

        {/* 右侧内容 */}
        <div className="flex items-center gap-3">{rightContent}</div>
      </div>
    </header>
  );
};

export default MerchantTopBar;
