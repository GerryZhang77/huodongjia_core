/**
 * 日期时间选择器字段组件
 * 封装 Ant Design Mobile 的 DatePicker，提供统一的样式和交互
 */

import React, { useState } from "react";
import { DatePicker } from "antd-mobile";

interface DatePickerFieldProps {
  /**
   * 当前值
   */
  value?: Date | null;
  /**
   * 值变化回调
   */
  onChange?: (value: Date | null) => void;
  /**
   * 占位文本
   */
  placeholder?: string;
  /**
   * 精度 (year, month, day, hour, minute, second)
   */
  precision?: "year" | "month" | "day" | "hour" | "minute" | "second";
  /**
   * 触发验证的回调（用于触发相关字段的重新验证）
   */
  onValidate?: () => void;
}

/**
 * 日期时间选择器字段组件
 */
export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  value,
  onChange,
  placeholder = "请选择时间",
  precision = "minute",
  onValidate,
}) => {
  const [visible, setVisible] = useState(false);

  const handleClick = () => {
    setVisible(true);
  };

  const handleConfirm = (val: Date) => {
    onChange?.(val);
    setVisible(false);
    // 触发相关字段的重新验证
    onValidate?.();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <div
        onClick={handleClick}
        style={{
          padding: "10px 12px",
          borderRadius: "8px",
          border: "1px solid #e5e5e5",
          backgroundColor: "#fff",
          cursor: "pointer",
          width: "100%",
          userSelect: "none",
          minHeight: "40px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {value ? (
          <span style={{ color: "#333" }}>
            {value.toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ) : (
          <span style={{ color: "#999", fontSize: "14px" }}>
            {placeholder || "YYYY-MM-DD HH:mm"}
          </span>
        )}
      </div>

      <DatePicker
        visible={visible}
        value={value || undefined}
        onConfirm={handleConfirm}
        onClose={handleCancel}
        precision={precision}
        title="选择时间"
      />
    </>
  );
};
