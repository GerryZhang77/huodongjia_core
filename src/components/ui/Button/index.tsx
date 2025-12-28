/**
 * Button - 按钮组件
 *
 * 设计规范 (基于 UI 稿 03-buttons.svg):
 * - 样式: Pill 圆角
 * - 尺寸: Large(52px), Medium(44px), Small(36px)
 * - 变体: Primary(天空蓝), Secondary(活力橙), Accent(梦幻紫), Success(成功绿), Danger(错误红), Outline, Light, Ghost, Text
 * - 纯 Tailwind v3 类名，无自定义 CSS
 *
 * @example
 * ```tsx
 * <Button>主按钮</Button>
 * <Button variant="secondary">次要按钮</Button>
 * <Button variant="accent">智能匹配</Button>
 * <Button variant="success">完成</Button>
 * <Button variant="danger">删除</Button>
 * <Button variant="outline">轮廓按钮</Button>
 * <Button size="large" loading>加载中...</Button>
 * ```
 */

import { FC } from "react";
import type { ButtonProps } from "./types";

/**
 * 加载图标 (SVG)
 */
const LoadingIcon: FC = () => (
  <svg
    className="animate-spin w-4 h-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
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
  className = "",
  onClick,
  type = "button",
}) => {
  // 基础类名 - 所有按钮共享
  let classes =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  // 块级按钮
  if (block) {
    classes += " w-full";
  }

  // 尺寸类名 (Pill 圆角)
  if (size === "large") {
    classes += " h-[52px] px-7 text-base";
    // Pill 圆角 = 高度的一半
    classes += " rounded-[26px]";
  } else if (size === "medium") {
    classes += " h-11 px-6 text-sm";
    classes += " rounded-[22px]";
  } else if (size === "small") {
    classes += " h-9 px-5 text-[13px]";
    classes += " rounded-[18px]";
  }

  // 变体类名
  if (variant === "primary") {
    // 主按钮 - 天空蓝
    classes += " bg-primary-400 text-white shadow-button";
    if (!disabled && !loading) {
      classes +=
        " hover:bg-primary-500 hover:-translate-y-0.5 active:scale-[0.98]";
    }
    if (disabled) {
      classes += " opacity-50 cursor-not-allowed";
    }
  } else if (variant === "secondary") {
    // 次要按钮 - 活力橙
    classes += " bg-secondary-400 text-white shadow-button";
    if (!disabled && !loading) {
      classes +=
        " hover:bg-secondary-500 hover:-translate-y-0.5 active:scale-[0.98]";
    }
    if (disabled) {
      classes += " opacity-50 cursor-not-allowed";
    }
  } else if (variant === "accent") {
    // 强调按钮 - 梦幻紫
    classes += " bg-accent-400 text-white shadow-button";
    if (!disabled && !loading) {
      classes +=
        " hover:bg-accent-500 hover:-translate-y-0.5 active:scale-[0.98]";
    }
    if (disabled) {
      classes += " opacity-50 cursor-not-allowed";
    }
  } else if (variant === "success") {
    // 成功按钮 - 成功绿
    classes += " bg-success-400 text-white shadow-button";
    if (!disabled && !loading) {
      classes +=
        " hover:bg-success-500 hover:-translate-y-0.5 active:scale-[0.98]";
    }
    if (disabled) {
      classes += " opacity-50 cursor-not-allowed";
    }
  } else if (variant === "danger") {
    // 危险按钮 - 错误红
    classes += " bg-error-400 text-white shadow-button";
    if (!disabled && !loading) {
      classes +=
        " hover:bg-error-500 hover:-translate-y-0.5 active:scale-[0.98]";
    }
    if (disabled) {
      classes += " opacity-50 cursor-not-allowed";
    }
  } else if (variant === "outline") {
    // 轮廓按钮
    classes +=
      " bg-white dark:bg-gray-800 text-primary-400 dark:text-primary-400 border-2 border-primary-400 dark:border-primary-400";
    if (!disabled && !loading) {
      classes += " hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98]";
    }
    if (disabled) {
      classes += " opacity-50 cursor-not-allowed";
    }
  } else if (variant === "light") {
    // 浅色按钮
    classes += " bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100";
    if (!disabled && !loading) {
      classes +=
        " hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-[0.98]";
    }
    if (disabled) {
      classes += " opacity-50 cursor-not-allowed";
    }
  } else if (variant === "ghost") {
    // 幽灵按钮
    classes += " bg-transparent text-primary-400 dark:text-primary-400";
    if (!disabled && !loading) {
      classes +=
        " hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98]";
    }
    if (disabled) {
      classes += " opacity-50 cursor-not-allowed";
    }
  } else if (variant === "text") {
    // 文本按钮
    classes += " bg-transparent text-primary-400";
    if (!disabled && !loading) {
      classes += " hover:underline active:scale-[0.98]";
    }
    if (disabled) {
      classes += " opacity-50 cursor-not-allowed";
    }
  }

  // 加载/禁用状态
  if (disabled || loading) {
    classes += " cursor-not-allowed";
  }

  // 自定义类名
  if (className) {
    classes += " " + className;
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
    >
      {/* 加载图标 */}
      {loading && <LoadingIcon />}

      {/* 左侧图标 */}
      {!loading && icon && (
        <span className="w-4 h-4 shrink-0 flex items-center justify-center">
          {icon}
        </span>
      )}

      {/* 按钮文本 */}
      <span>{children}</span>

      {/* 右侧图标 */}
      {!loading && iconRight && (
        <span className="w-4 h-4 shrink-0 flex items-center justify-center">
          {iconRight}
        </span>
      )}
    </button>
  );
};

Button.displayName = "Button";
