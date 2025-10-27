/**
 * AuthNotification - 认证通知组件
 * 用于登录成功/失败/错误的美观提示
 */

import { FC, useEffect, useState, useCallback } from "react";
import {
  CheckCircleFill,
  CloseCircleFill,
  ExclamationCircleFill,
} from "antd-mobile-icons";

export type NotificationType = "success" | "error" | "warning";

export interface AuthNotificationProps {
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number; // 显示时长(ms)，默认2000 (与设计系统动效时长对齐)
  onClose?: () => void;
}

/**
 * AuthNotification 组件
 */
export const AuthNotification: FC<AuthNotificationProps> = ({
  type,
  message,
  description,
  duration = 2000, // 默认2秒，与设计系统动效时长对齐
  onClose,
}) => {
  const [visible, setVisible] = useState(true);
  const [animating, setAnimating] = useState(true);

  const handleClose = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // 入场动画
    const animTimer = setTimeout(() => {
      setAnimating(false);
    }, 50);

    // 自动关闭
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, handleClose]);

  if (!visible) return null;

  // 配置映射 (使用品牌色彩系统)
  const config = {
    success: {
      icon: CheckCircleFill,
      bgColor: "bg-primary-50", // 晨曦蓝浅色背景
      borderColor: "border-primary-200",
      iconColor: "text-primary-500", // 主色 #4A78FF
      titleColor: "text-primary-900",
      descColor: "text-primary-700",
    },
    error: {
      icon: CloseCircleFill,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
      titleColor: "text-red-900",
      descColor: "text-red-700",
    },
    warning: {
      icon: ExclamationCircleFill,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-500",
      titleColor: "text-yellow-900",
      descColor: "text-yellow-700",
    },
  };

  const currentConfig = config[type];
  const Icon = currentConfig.icon;

  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        w-[90%] max-w-md
        transition-all duration-300 ease-in-out
        ${animating ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"}
      `}
    >
      <div
        className={`
          ${currentConfig.bgColor}
          ${currentConfig.borderColor}
          border rounded-xl p-4 shadow-lg
          flex items-start gap-3
        `}
      >
        {/* 图标 */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={`text-2xl ${currentConfig.iconColor}`} />
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div
            className={`font-semibold text-base ${currentConfig.titleColor} mb-1`}
          >
            {message}
          </div>
          {description && (
            <div className={`text-sm ${currentConfig.descColor}`}>
              {description}
            </div>
          )}
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className={`
            flex-shrink-0 ml-2 p-1
            ${currentConfig.iconColor}
            hover:opacity-70
            transition-opacity
          `}
          aria-label="关闭"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
