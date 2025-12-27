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

  return (
    <label
      className={`inline-flex items-start gap-2 cursor-pointer ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        id={id}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          ${config.box}
          rounded
          border-2
          flex items-center justify-center
          flex-shrink-0
          mt-0.5
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-700 focus:ring-offset-1 dark:focus:ring-offset-gray-800
          ${
            checked
              ? "bg-primary-400 dark:bg-primary-500 border-primary-400 dark:border-primary-500"
              : "bg-gray-50 dark:bg-gray-700 border-gray-400 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-100 dark:hover:bg-gray-600"
          }
          ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        `}
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
