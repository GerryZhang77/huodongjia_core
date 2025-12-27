/**
 * Input - 输入框组件 (2024 新版设计系统)
 *
 * 设计规范:
 * - 圆角: 10px
 * - 边框: 默认 #CBD5E1, 焦点时 #3B82F6
 * - 焦点阴影: 蓝色光晕
 * - 图标支持: 左侧/右侧图标
 * - 状态: default, error, success, warning
 *
 * @example
 * ```tsx
 * // 基础输入框
 * <Input placeholder="请输入用户名" />
 *
 * // 带图标
 * <Input prefix={<UserIcon />} placeholder="用户名" />
 *
 * // 带标签和帮助文本
 * <Input label="邮箱" helperText="请输入有效的邮箱地址" />
 *
 * // 错误状态
 * <Input status="error" helperText="邮箱格式不正确" />
 * ```
 */

import { forwardRef, useId } from "react";
import { clsx } from "clsx";
import type { InputProps, TextareaProps, SearchInputProps } from "./types";

/**
 * 搜索图标
 */
const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * 加载图标
 */
const LoadingIcon = ({ className }: { className?: string }) => (
  <svg
    className={clsx("animate-spin", className)}
    viewBox="0 0 24 24"
    fill="none"
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
 * Input 输入框组件
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "medium",
      status = "default",
      disabled = false,
      prefix,
      suffix,
      label,
      helperText,
      required = false,
      className,
      inputClassName,
      id: propId,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const id = propId || autoId;

    // 容器高度 - 增加适当内边距
    const sizeClasses = {
      large: "h-12", // 48px
      medium: "h-11", // 44px
      small: "h-9", // 36px
    };

    // 文字大小
    const textSizes = {
      large: "text-base", // 16px
      medium: "text-sm", // 14px
      small: "text-sm", // 14px
    };

    // 状态边框颜色 - 优化聚焦状态
    const statusClasses = {
      default: clsx(
        "border-gray-200 dark:border-gray-600",
        "focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/30"
      ),
      error: clsx(
        "bg-error-50/50 dark:bg-error-900/20 border-error-300 dark:border-error-700",
        "focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:border-error-400 focus-within:ring-4 focus-within:ring-error-100 dark:focus-within:ring-error-900/30"
      ),
      success: clsx(
        "border-success-300 dark:border-success-700",
        "focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:border-success-400 focus-within:ring-4 focus-within:ring-success-100 dark:focus-within:ring-success-900/30"
      ),
      warning: clsx(
        "border-warning-300 dark:border-warning-700",
        "focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:border-warning-400 focus-within:ring-4 focus-within:ring-warning-100 dark:focus-within:ring-warning-900/30"
      ),
    };

    // 帮助文本颜色
    const helperTextColors = {
      default: "text-gray-500 dark:text-gray-400",
      error: "text-error-500 dark:text-error-400",
      success: "text-success-500 dark:text-success-400",
      warning: "text-warning-500 dark:text-warning-400",
    };

    return (
      <div className={clsx("w-full", className)}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
            {required && <span className="text-error-400 ml-0.5">*</span>}
          </label>
        )}

        {/* 输入框容器 */}
        <div
          className={clsx(
            "flex items-center gap-2.5",
            "px-4", // 增加水平内边距
            "bg-gray-50/80 dark:bg-gray-700/50 border rounded-xl", // 更柔和的背景色，12px 圆角
            "transition-all duration-200",
            sizeClasses[size],
            statusClasses[status],
            disabled && "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60"
          )}
        >
          {/* 左侧图标 */}
          {prefix && (
            <span className="shrink-0 text-gray-400 [&>svg]:w-5 [&>svg]:h-5">
              {prefix}
            </span>
          )}

          {/* 输入框 */}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={clsx(
              "flex-1 min-w-0 py-0.5",
              "bg-transparent",
              "outline-none border-none focus:outline-none focus:ring-0", // 彻底移除默认聚焦样式
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              textSizes[size],
              "text-gray-900 dark:text-gray-100",
              disabled && "cursor-not-allowed",
              inputClassName
            )}
            {...rest}
          />

          {/* 右侧图标 */}
          {suffix && (
            <span className="shrink-0 text-gray-400 [&>svg]:w-5 [&>svg]:h-5">
              {suffix}
            </span>
          )}
        </div>

        {/* 帮助文本 */}
        {helperText && (
          <p className={clsx("mt-1.5 text-xs", helperTextColors[status])}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/**
 * Textarea 多行文本输入组件
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = "medium",
      status = "default",
      disabled = false,
      label,
      helperText,
      required = false,
      className,
      inputClassName,
      rows = 3,
      resize = "vertical",
      id: propId,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const id = propId || autoId;

    // 文字大小
    const textSizes = {
      large: "text-base",
      medium: "text-sm",
      small: "text-sm",
    };

    // 状态边框颜色 - 优化聚焦状态
    const statusClasses = {
      default: clsx(
        "border-gray-200",
        "focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
      ),
      error: clsx(
        "bg-error-50/50 border-error-300",
        "focus:bg-white focus:border-error-400 focus:ring-4 focus:ring-error-100"
      ),
      success: clsx(
        "border-success-300",
        "focus:bg-white focus:border-success-400 focus:ring-4 focus:ring-success-100"
      ),
      warning: clsx(
        "border-warning-300",
        "focus:bg-white focus:border-warning-400 focus:ring-4 focus:ring-warning-100"
      ),
    };

    // 帮助文本颜色
    const helperTextColors = {
      default: "text-gray-500",
      error: "text-error-500",
      success: "text-success-500",
      warning: "text-warning-500",
    };

    // 调整大小
    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    };

    return (
      <div className={clsx("w-full", className)}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
            {required && <span className="text-error-400 ml-0.5">*</span>}
          </label>
        )}

        {/* 文本域 */}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          className={clsx(
            "w-full px-4 py-3", // 增加内边距
            "bg-gray-50/80 border rounded-xl", // 更柔和的背景色，12px 圆角
            "outline-none border-none focus:outline-none", // 移除默认聚焦样式
            "transition-all duration-200",
            "placeholder:text-gray-400",
            textSizes[size],
            "text-gray-900",
            "border", // 重新添加边框
            statusClasses[status],
            resizeClasses[resize],
            disabled && "bg-gray-100 cursor-not-allowed opacity-60",
            inputClassName
          )}
          {...rest}
        />

        {/* 帮助文本 */}
        {helperText && (
          <p className={clsx("mt-1.5 text-xs", helperTextColors[status])}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

/**
 * SearchInput 搜索输入框组件
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      onSearch,
      searchOnType = false,
      loading = false,
      size = "medium",
      className,
      onChange,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch((e.target as HTMLInputElement).value);
      }
      onKeyDown?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      if (searchOnType && onSearch) {
        onSearch(e.target.value);
      }
    };

    // 图标尺寸
    const iconSizes = {
      large: "w-5 h-5",
      medium: "w-4 h-4",
      small: "w-3.5 h-3.5",
    };

    return (
      <Input
        ref={ref}
        size={size}
        prefix={
          <SearchIcon className={clsx(iconSizes[size], "text-gray-400")} />
        }
        suffix={
          loading ? (
            <LoadingIcon className={clsx(iconSizes[size], "text-gray-400")} />
          ) : undefined
        }
        className={className}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...rest}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";

export default Input;
