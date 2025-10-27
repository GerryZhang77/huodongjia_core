/**
 * Button - 按钮组件
 *
 * 设计规范:
 * - 尺寸: Large(48px), Medium(40px), Small(32px)
 * - 变体: Primary, Secondary, Text
 * - 状态: Default, Hover, Active, Disabled, Loading
 * - 可访问性: 符合 WCAG 2.1 AA 标准
 *
 * @example
 * ```tsx
 * // 主按钮
 * <Button>立即报名</Button>
 *
 * // 大按钮
 * <Button size="large">立即报名</Button>
 *
 * // 次要按钮
 * <Button variant="secondary">取消</Button>
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
  className,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
}) => {
  // 基础样式
  const baseStyles = clsx(
    // 布局
    "inline-flex items-center justify-center gap-2",
    "font-medium transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    // 块级
    block && "w-full",
    // 禁用/加载时禁止点击
    (disabled || loading) && "cursor-not-allowed"
  );

  // 尺寸样式
  const sizeStyles = {
    large: clsx(
      "h-12 px-6 rounded-[10px]", // 48px 高度, 24px 水平内边距, 10px 圆角
      "text-lg" // 18px 字号
    ),
    medium: clsx(
      "h-10 px-6 rounded-lg", // 40px 高度, 24px 水平内边距, 8px 圆角
      "text-base" // 16px 字号
    ),
    small: clsx(
      "h-8 px-4 rounded-md", // 32px 高度, 16px 水平内边距, 6px 圆角
      "text-sm" // 14px 字号
    ),
  };

  // 变体样式
  const variantStyles = {
    primary: clsx(
      // 默认状态
      "bg-primary-500 text-white",
      // 悬停状态
      !disabled &&
        !loading &&
        "hover:bg-primary-600 hover:shadow-[0_0_0_3px_rgba(74,120,255,0.2)]",
      // 按下状态
      !disabled && !loading && "active:bg-primary-700",
      // 焦点状态
      "focus:ring-primary-500",
      // 禁用状态
      disabled && "bg-gray-300 text-gray-500",
      // 加载状态
      loading && "bg-primary-500"
    ),
    secondary: clsx(
      // 默认状态
      "bg-white text-primary-500 border border-primary-500",
      // 悬停状态
      !disabled &&
        !loading &&
        "hover:bg-primary-50 hover:shadow-[0_0_0_3px_rgba(74,120,255,0.2)]",
      // 按下状态
      !disabled && !loading && "active:bg-primary-100",
      // 焦点状态
      "focus:ring-primary-500",
      // 禁用状态
      disabled && "bg-gray-50 text-gray-400 border-gray-300",
      // 加载状态
      loading && "bg-white border-primary-500"
    ),
    text: clsx(
      // 默认状态
      "bg-transparent text-primary-500",
      // 悬停状态
      !disabled && !loading && "hover:bg-primary-50",
      // 按下状态
      !disabled && !loading && "active:bg-primary-100",
      // 焦点状态
      "focus:ring-primary-500",
      // 禁用状态
      disabled && "text-gray-400",
      // 加载状态
      loading && "bg-transparent"
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
      {!loading && icon && <span className={iconSizes[size]}>{icon}</span>}

      {/* 按钮文本 */}
      <span>{children}</span>
    </button>
  );
};

Button.displayName = "Button";
