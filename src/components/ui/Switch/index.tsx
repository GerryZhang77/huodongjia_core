import React from "react";

export interface SwitchProps {
  /** 是否选中 */
  checked: boolean;
  /** 切换回调 */
  onChange: (checked: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 尺寸 */
  size?: "small" | "medium" | "large";
  /** 自定义类名 */
  className?: string;
  /** aria-label */
  "aria-label"?: string;
}

/**
 * Switch 开关组件
 *
 * @example
 * ```tsx
 * <Switch checked={enabled} onChange={setEnabled} />
 * <Switch checked={enabled} onChange={setEnabled} size="small" />
 * ```
 */
export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "medium",
  className = "",
  "aria-label": ariaLabel,
}) => {
  // 根据尺寸计算样式
  const sizeStyles = {
    small: {
      track: "w-8 h-[18px]",
      thumb: "w-3.5 h-3.5",
      thumbOffset: checked ? "left-[16px]" : "left-[2px]",
    },
    medium: {
      track: "w-10 h-6",
      thumb: "w-5 h-5",
      thumbOffset: checked ? "left-[18px]" : "left-[2px]",
    },
    large: {
      track: "w-12 h-7",
      thumb: "w-6 h-6",
      thumbOffset: checked ? "left-[22px]" : "left-[2px]",
    },
  };

  const styles = sizeStyles[size];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex flex-shrink-0 rounded-full 
        transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2
        ${styles.track}
        ${checked ? "bg-primary-400" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {/* 滑块 */}
      <span
        className={`
          absolute top-1/2 -translate-y-1/2
          bg-white rounded-full shadow-md
          transition-all duration-200 ease-in-out
          ${styles.thumb}
          ${styles.thumbOffset}
        `}
      />
    </button>
  );
};

Switch.displayName = "Switch";

export default Switch;
