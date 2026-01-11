/**
 * Checkbox 复选框组件
 * 符合设计系统规范的复选框
 */

import { FC } from "react";
import { CheckboxProps } from "./types";

export const Checkbox: FC<CheckboxProps> = ({
  checked = false,
  onChange,
  disabled = false,
  size = "medium",
  className = "",
  children,
  id,
}) => {
  // 尺寸配置
  const sizeConfig = {
    small: {
      box: "w-4 h-4",
      icon: "w-2.5 h-2.5",
      text: "text-xs",
    },
    medium: {
      box: "w-5 h-5",
      icon: "w-3 h-3",
      text: "text-sm",
    },
    large: {
      box: "w-6 h-6",
      icon: "w-3.5 h-3.5",
      text: "text-base",
    },
  };

  const config = sizeConfig[size];

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleClick();
    }
  };

  // 基础样式
  const baseStyles = [
    config.box,
    "rounded",
    "flex",
    "items-center",
    "justify-center",
    "flex-shrink-0",
    "transition-all",
    "duration-150",
    "border-2",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-primary-200",
    "focus:ring-offset-1",
  ];

  // 状态样式
  const stateStyles = checked
    ? ["bg-primary-400", "border-primary-400"]
    : [
        "bg-gray-200",
        "dark:bg-gray-700",
        "border-gray-400",
        "dark:border-gray-500",
        "hover:border-primary-400",
      ];

  // 禁用样式
  const disabledStyles = disabled ? "cursor-not-allowed" : "cursor-pointer";

  const buttonClassName = [...baseStyles, ...stateStyles, disabledStyles].join(
    " "
  );

  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        id={id}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled && onChange) {
            onChange(!checked);
          }
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={buttonClassName}
      >
        {checked && (
          <svg
            className={`${config.icon} text-white`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </button>
      {children && (
        <span
          className={`${config.text} text-gray-600 dark:text-gray-400 leading-relaxed select-none`}
        >
          {children}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
