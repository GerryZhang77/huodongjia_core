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
}

/**
 * 面包屑导航
 * 符合设计系统规范：
 * - 字号: text-sm (14px)
 * - 颜色: 链接 gray-500 / 悬停 primary-400 / 当前 gray-900
 * - 间距: gap-2 (8px)
 */
export const Breadcrumb: FC<BreadcrumbProps> = ({ items }) => {
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
    <nav className="flex items-center gap-2" aria-label="面包屑导航">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;
        const isClickable = !isLast && !!item.path;

        return (
          <div key={index} className="flex items-center gap-2">
            {/* 面包屑项 */}
            {isClickable ? (
              <button
                onClick={() => handleClick(item)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-400 transition-colors duration-150 active:scale-95"
              >
                {Icon && <Icon size={14} />}
                <span>{item.label}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-gray-900 font-medium">
                {Icon && <Icon size={14} />}
                <span>{item.label}</span>
              </div>
            )}

            {/* 分隔符 */}
            {!isLast && (
              <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
