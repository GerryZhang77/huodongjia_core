/**
 * 面包屑导航组件
 * 用于显示当前页面的路径层级
 */

import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { BreadcrumbItem } from "./types";

interface BreadcrumbProps {
  /** 面包屑项目列表 */
  items: BreadcrumbItem[];
  /** 移动端隐藏第一级入口，给当前路径留出空间 */
  compactOnMobile?: boolean;
}

/**
 * 面包屑导航
 * 符合设计系统规范：
 * - 字号: text-sm (14px)
 * - 颜色: 链接 gray-500 / 悬停 primary-400 / 当前 gray-900
 * - 间距: gap-2 (8px)
 */
export const Breadcrumb: FC<BreadcrumbProps> = ({
  items,
  compactOnMobile = false,
}) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return null;
  }

  const handleClick = (item: BreadcrumbItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav
      className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
      aria-label="面包屑导航"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;
        const isClickable = !isLast && !!item.path;
        const hideOnMobile = compactOnMobile && index === 0 && items.length > 1;

        return (
          <div
            key={`${item.label}-${index}`}
            className={`items-center gap-2 ${
              hideOnMobile ? "hidden sm:flex" : "flex"
            } ${index === 0 || isLast ? "shrink-0" : "min-w-0"}`}
          >
            {/* 面包屑项 */}
            {isClickable ? (
              <button
                onClick={() => handleClick(item)}
                className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500 transition-colors duration-150 hover:text-primary-400 active:scale-95 dark:text-gray-400"
              >
                {Icon && <Icon size={14} className="shrink-0" />}
                <span className={index > 0 ? "truncate" : "whitespace-nowrap"}>
                  {item.label}
                </span>
              </button>
            ) : (
              <div
                className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-gray-100"
                aria-current={isLast ? "page" : undefined}
              >
                {Icon && <Icon size={14} className="shrink-0" />}
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
            )}

            {/* 分隔符 */}
            {!isLast && (
              <ChevronRight
                size={14}
                className="text-gray-300 dark:text-gray-600 flex-shrink-0"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
