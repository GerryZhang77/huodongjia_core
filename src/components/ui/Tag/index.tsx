/**
 * Tag - 标签组件 (2024 新版设计系统)
 *
 * 设计规范:
 * - 样式: Pill 圆角 (全圆角)
 * - 颜色: 多色标签 (蓝/橙/紫/绿/黄/红/灰)
 * - 变体: filled(填充), soft(淡色背景), outline(轮廓)
 * - 尺寸: large(28px), medium(24px), small(20px)
 *
 * @example
 * ```tsx
 * // 基础标签
 * <Tag>默认标签</Tag>
 *
 * // 不同颜色
 * <Tag color="primary">天空蓝</Tag>
 * <Tag color="secondary">活力橙</Tag>
 * <Tag color="accent">梦幻紫</Tag>
 *
 * // 淡色背景 (推荐)
 * <Tag variant="soft" color="success">成功</Tag>
 *
 * // 可关闭
 * <Tag closable onClose={() => console.log('关闭')}>可关闭</Tag>
 *
 * // 标签组
 * <TagGroup>
 *   <Tag>标签1</Tag>
 *   <Tag>标签2</Tag>
 * </TagGroup>
 * ```
 */

import { FC } from "react";
import { clsx } from "clsx";
import type { TagProps, TagGroupProps } from "./types";

/**
 * 关闭图标
 */
const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

/**
 * Tag 标签组件
 */
export const Tag: FC<TagProps> = ({
  children,
  color = "primary",
  variant = "soft",
  size = "medium",
  icon,
  closable = false,
  onClose,
  onClick,
  className,
}) => {
  // 尺寸样式 - 增大尺寸和内边距，提升视觉效果
  const sizeClasses = {
    large: "h-8 px-4 text-sm gap-2", // 32px 高度
    medium: "h-7 px-3.5 text-sm gap-1.5", // 28px 高度
    small: "h-6 px-3 text-xs gap-1", // 24px 高度
  };

  // 图标尺寸
  const iconSizes = {
    large: "w-4 h-4",
    medium: "w-3.5 h-3.5",
    small: "w-3 h-3",
  };

  // 颜色变体样式 - 使用更饱满的颜色，移除边框
  const colorVariants = {
    primary: {
      filled: "bg-primary-500 text-white shadow-sm",
      soft: "bg-primary-100 text-primary-700",
      outline: "bg-white text-primary-600 ring-1 ring-inset ring-primary-300",
    },
    secondary: {
      filled: "bg-secondary-500 text-white shadow-sm",
      soft: "bg-secondary-100 text-secondary-700",
      outline:
        "bg-white text-secondary-600 ring-1 ring-inset ring-secondary-300",
    },
    accent: {
      filled: "bg-accent-500 text-white shadow-sm",
      soft: "bg-accent-100 text-accent-700",
      outline: "bg-white text-accent-600 ring-1 ring-inset ring-accent-300",
    },
    success: {
      filled: "bg-success-500 text-white shadow-sm",
      soft: "bg-success-100 text-success-700",
      outline: "bg-white text-success-600 ring-1 ring-inset ring-success-300",
    },
    warning: {
      filled: "bg-warning-500 text-white shadow-sm",
      soft: "bg-warning-100 text-warning-800",
      outline: "bg-white text-warning-700 ring-1 ring-inset ring-warning-300",
    },
    error: {
      filled: "bg-error-500 text-white shadow-sm",
      soft: "bg-error-100 text-error-700",
      outline: "bg-white text-error-600 ring-1 ring-inset ring-error-300",
    },
    gray: {
      filled: "bg-gray-600 text-white shadow-sm",
      soft: "bg-gray-100 text-gray-700",
      outline: "bg-white text-gray-600 ring-1 ring-inset ring-gray-300",
    },
  };

  // 悬停样式 (可点击时) - 更明显的悬停效果
  const hoverClasses = onClick
    ? {
        primary: {
          filled: "hover:bg-primary-600 hover:shadow-md",
          soft: "hover:bg-primary-200",
          outline: "hover:bg-primary-50",
        },
        secondary: {
          filled: "hover:bg-secondary-600 hover:shadow-md",
          soft: "hover:bg-secondary-200",
          outline: "hover:bg-secondary-50",
        },
        accent: {
          filled: "hover:bg-accent-600 hover:shadow-md",
          soft: "hover:bg-accent-200",
          outline: "hover:bg-accent-50",
        },
        success: {
          filled: "hover:bg-success-600 hover:shadow-md",
          soft: "hover:bg-success-200",
          outline: "hover:bg-success-50",
        },
        warning: {
          filled: "hover:bg-warning-600 hover:shadow-md",
          soft: "hover:bg-warning-200",
          outline: "hover:bg-warning-50",
        },
        error: {
          filled: "hover:bg-error-600 hover:shadow-md",
          soft: "hover:bg-error-200",
          outline: "hover:bg-error-50",
        },
        gray: {
          filled: "hover:bg-gray-700 hover:shadow-md",
          soft: "hover:bg-gray-200",
          outline: "hover:bg-gray-50",
        },
      }
    : null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  const TagElement = onClick ? "button" : "span";

  return (
    <TagElement
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={clsx(
        // 基础样式
        "inline-flex items-center justify-center",
        "rounded-full", // Pill 样式
        "font-semibold", // 更粗的字重
        "transition-all duration-150",
        "select-none", // 防止文字被选中
        // 尺寸
        sizeClasses[size],
        // 颜色变体
        colorVariants[color][variant],
        // 悬停效果 (可点击时)
        onClick && "cursor-pointer active:scale-95",
        onClick && hoverClasses?.[color][variant],
        // 自定义类名
        className
      )}
    >
      {/* 左侧图标 */}
      {icon && (
        <span
          className={clsx(
            iconSizes[size],
            "shrink-0 [&>svg]:w-full [&>svg]:h-full"
          )}
        >
          {icon}
        </span>
      )}

      {/* 文本 */}
      <span className="truncate">{children}</span>

      {/* 关闭按钮 */}
      {closable && (
        <button
          type="button"
          onClick={handleClose}
          className={clsx(
            iconSizes[size],
            "ml-1 -mr-0.5",
            "rounded-full",
            "hover:bg-black/10 dark:hover:bg-white/20",
            "transition-colors duration-150",
            "flex items-center justify-center",
            "focus:outline-none"
          )}
          aria-label="关闭"
        >
          <CloseIcon className="w-full h-full" />
        </button>
      )}
    </TagElement>
  );
};

Tag.displayName = "Tag";

/**
 * TagGroup 标签组组件
 */
export const TagGroup: FC<TagGroupProps> = ({
  children,
  gap = "small",
  className,
}) => {
  const gapClasses = {
    small: "gap-1.5",
    medium: "gap-2",
    large: "gap-3",
  };

  return (
    <div className={clsx("flex flex-wrap", gapClasses[gap], className)}>
      {children}
    </div>
  );
};

TagGroup.displayName = "TagGroup";

export default Tag;
