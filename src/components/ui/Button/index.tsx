/**
 * Button - 按钮组件 (2024 新版设计系统)
 *
 * 设计规范:
 * - 样式: Pill 圆角 (22px/26px)
 * - 渐变: 135° 渐变背景
 * - 阴影: 彩色阴影 (与按钮颜色匹配)
 * - 尺寸: Large(44px), Medium(40px), Small(32px)
 * - 变体: Primary, Secondary, Accent, Success, Outline, Ghost, Text
 * - 可访问性: 符合 WCAG 2.1 AA 标准
 *
 * @example
 * ```tsx
 * // 主按钮 (天空蓝渐变)
 * <Button>立即报名</Button>
 *
 * // 次要按钮 (活力橙渐变)
 * <Button variant="secondary">热门活动</Button>
 *
 * // 强调按钮 (梦幻紫渐变)
 * <Button variant="accent">智能匹配</Button>
 *
 * // 轮廓按钮
 * <Button variant="outline">取消</Button>
 *
 * // 带图标
 * <Button icon={<PlusIcon />}>新增</Button>
 *
 * // 加载状态
 * <Button loading>提交中...</Button>
 * ```
 */

import { FC } from "react";
import { clsx } from "clsx";
import type { ButtonProps } from "./types";

/**
 * 加载图标组件
 */
const LoadingIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={clsx("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Button 组件
 */
export const Button: FC<ButtonProps> = ({
  children,
  size = "medium",
  variant = "primary",
  disabled = false,
  loading = false,
  block = false,
  icon,
  iconRight,
  className,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
}) => {
  // 是否为填充按钮 (带渐变背景)
  const isSolid = [
    "primary",
    "secondary",
    "accent",
    "success",
    "danger",
  ].includes(variant);

  // 基础样式
  const baseStyles = clsx(
    // 布局
    "inline-flex items-center justify-center gap-2",
    // 字体
    "font-semibold",
    // 过渡动画
    "transition-all duration-150 ease-out",
    // 焦点样式
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    // 块级
    block && "w-full",
    // 禁用/加载时禁止点击
    (disabled || loading) && "cursor-not-allowed",
    // 填充按钮的悬停上移效果
    isSolid && !disabled && !loading && "hover:-translate-y-0.5",
    // 按下效果
    !disabled && !loading && "active:scale-[0.98]"
  );

  // 尺寸样式 - Pill 圆角 (根据设计稿 03-buttons.svg)
  const sizeStyles = {
    large: clsx(
      "h-[52px] px-7", // 52px 高度
      "rounded-[26px]", // 26px 圆角
      "text-base" // 16px 字号
    ),
    medium: clsx(
      "h-11 px-6", // 44px 高度
      "rounded-[22px]", // 22px 圆角
      "text-sm" // 14px 字号
    ),
    small: clsx(
      "h-9 px-5", // 36px 高度
      "rounded-[18px]", // 18px 圆角
      "text-[13px]" // 13px 字号
    ),
  };

  // 变体样式
  const variantStyles = {
    // 主要按钮 - 天空蓝渐变
    primary: clsx(
      // 默认状态
      "bg-gradient-to-br from-primary-400 to-primary-500 text-white",
      // 阴影
      !disabled && "shadow-primary",
      // 悬停状态
      !disabled &&
        !loading &&
        "hover:from-primary-500 hover:to-primary-600 hover:shadow-primary-hover",
      // 焦点状态
      "focus-visible:ring-2 focus-visible:ring-primary-400",
      // 禁用状态
      disabled && "from-gray-300 to-gray-400 text-gray-500 shadow-none"
    ),
    // 次要按钮 - 活力橙渐变
    secondary: clsx(
      // 默认状态
      "bg-gradient-to-br from-secondary-400 to-secondary-500 text-white",
      // 阴影
      !disabled && "shadow-secondary",
      // 悬停状态
      !disabled &&
        !loading &&
        "hover:from-secondary-500 hover:to-secondary-600 hover:shadow-secondary-hover",
      // 焦点状态
      "focus-visible:ring-2 focus-visible:ring-secondary-400",
      // 禁用状态
      disabled && "from-gray-300 to-gray-400 text-gray-500 shadow-none"
    ),
    // 强调按钮 - 梦幻紫渐变
    accent: clsx(
      // 默认状态
      "bg-gradient-to-br from-accent-400 to-accent-500 text-white",
      // 阴影
      !disabled && "shadow-accent",
      // 悬停状态
      !disabled &&
        !loading &&
        "hover:from-accent-500 hover:to-accent-600 hover:shadow-accent-hover",
      // 焦点状态
      "focus-visible:ring-2 focus-visible:ring-accent-400",
      // 禁用状态
      disabled && "from-gray-300 to-gray-400 text-gray-500 shadow-none"
    ),
    // 成功按钮 - 成功绿渐变
    success: clsx(
      // 默认状态
      "bg-gradient-to-br from-success-400 to-success-500 text-white",
      // 阴影
      !disabled && "shadow-success",
      // 悬停状态
      !disabled &&
        !loading &&
        "hover:from-success-500 hover:to-success-600 hover:shadow-success-hover",
      // 焦点状态
      "focus-visible:ring-2 focus-visible:ring-success-400",
      // 禁用状态
      disabled && "from-gray-300 to-gray-400 text-gray-500 shadow-none"
    ),
    // 轮廓按钮
    outline: clsx(
      // 默认状态
      "bg-white text-primary-400 border-2 border-primary-400",
      // 悬停状态
      !disabled &&
        !loading &&
        "hover:bg-primary-50 hover:border-primary-500 hover:text-primary-500",
      // 焦点状态
      "focus-visible:ring-primary-400",
      // 禁用状态
      disabled && "bg-gray-50 text-gray-400 border-gray-300"
    ),
    // 幽灵按钮
    ghost: clsx(
      // 默认状态
      "bg-transparent text-primary-400",
      // 悬停状态
      !disabled && !loading && "hover:bg-primary-50 hover:text-primary-500",
      // 焦点状态
      "focus-visible:ring-primary-400",
      // 禁用状态
      disabled && "text-gray-400"
    ),
    // 文本按钮
    text: clsx(
      // 默认状态
      "bg-transparent text-primary-400 underline-offset-2",
      // 悬停状态
      !disabled && !loading && "hover:text-primary-500 hover:underline",
      // 焦点状态
      "focus-visible:ring-primary-400",
      // 禁用状态
      disabled && "text-gray-400"
    ),
    // 淡色按钮 - 淡色背景 + 品牌色文字
    light: clsx(
      // 默认状态
      "bg-primary-50 text-primary-500",
      // 悬停状态
      !disabled && !loading && "hover:bg-primary-100 hover:text-primary-600",
      // 焦点状态
      "focus-visible:ring-primary-400",
      // 禁用状态
      disabled && "bg-gray-100 text-gray-400"
    ),
    // 危险按钮 - 红色警告
    danger: clsx(
      // 默认状态
      "bg-gradient-to-br from-error-400 to-error-500 text-white",
      // 阴影
      !disabled && "shadow-danger",
      // 悬停状态
      !disabled &&
        !loading &&
        "hover:from-error-500 hover:to-error-600 hover:shadow-danger-hover",
      // 焦点状态
      "focus-visible:ring-2 focus-visible:ring-error-400",
      // 禁用状态
      disabled && "from-gray-300 to-gray-400 text-gray-500 shadow-none"
    ),
  };

  // 图标尺寸
  const iconSizes = {
    large: "w-5 h-5", // 20px
    medium: "w-4 h-4", // 16px
    small: "w-3.5 h-3.5", // 14px
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {/* 加载图标 */}
      {loading && <LoadingIcon className={iconSizes[size]} />}

      {/* 左侧图标 */}
      {!loading && icon && (
        <span
          className={clsx(
            iconSizes[size],
            "shrink-0 inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          )}
        >
          {icon}
        </span>
      )}

      {/* 按钮文本 */}
      <span>{children}</span>

      {/* 右侧图标 */}
      {!loading && iconRight && (
        <span
          className={clsx(
            iconSizes[size],
            "shrink-0 inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          )}
        >
          {iconRight}
        </span>
      )}
    </button>
  );
};

Button.displayName = "Button";
