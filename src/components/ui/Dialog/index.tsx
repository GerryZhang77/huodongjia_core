/**
 * Dialog - 对话框组件 (2024 新版设计系统)
 *
 * 用途: 确认、提示、警告等对话框
 *
 * 设计规范:
 * - 基于 Modal 组件
 * - 居中显示
 * - 小尺寸 (max-w-sm)
 * - 带图标和类型颜色
 *
 * @example
 * ```tsx
 * <Dialog
 *   open={open}
 *   type="confirm"
 *   title="确认删除"
 *   content="确定要删除这条记录吗？"
 *   onOk={() => handleDelete()}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */

import { FC } from "react";
import { clsx } from "clsx";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";
import { Modal } from "../Modal";
import type { DialogProps } from "./types";

/**
 * 类型图标和颜色配置
 */
const typeConfig = {
  info: {
    icon: Info,
    iconColor: "text-primary-500 dark:text-primary-400",
    bgColor: "bg-primary-50 dark:bg-primary-900/20",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-success-500 dark:text-success-400",
    bgColor: "bg-success-50 dark:bg-success-900/20",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-warning-500 dark:text-warning-400",
    bgColor: "bg-warning-50 dark:bg-warning-900/20",
  },
  error: {
    icon: XCircle,
    iconColor: "text-error-500 dark:text-error-400",
    bgColor: "bg-error-50 dark:bg-error-900/20",
  },
  confirm: {
    icon: AlertCircle,
    iconColor: "text-primary-500 dark:text-primary-400",
    bgColor: "bg-primary-50 dark:bg-primary-900/20",
  },
};

/**
 * Dialog 组件
 */
export const Dialog: FC<DialogProps> = ({
  open,
  onClose,
  type = "info",
  title,
  content,
  icon,
  okText = "确定",
  cancelText = "取消",
  onOk,
  onCancel,
  showCancel = type === "confirm",
  okLoading = false,
  className,
}) => {
  const config = typeConfig[type];
  const IconComponent = config.icon;

  // 确定按钮变体
  const okVariant =
    type === "error" ? "danger" : type === "warning" ? "secondary" : "primary";

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="small"
      centered
      closable={false}
      maskClosable={!okLoading}
      className={className}
    >
      <div className="text-center py-4">
        {/* 图标 */}
        <div className="flex justify-center mb-4">
          <div
            className={clsx(
              "w-16 h-16 rounded-full flex items-center justify-center",
              config.bgColor
            )}
          >
            {icon || <IconComponent size={32} className={config.iconColor} />}
          </div>
        </div>

        {/* 标题 */}
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
        )}

        {/* 内容 */}
        {content && (
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            {content}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3 justify-center">
          {showCancel && (
            <button
              onClick={() => {
                onCancel?.();
                onClose();
              }}
              disabled={okLoading}
              className="flex-1 h-11 rounded-[22px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={async () => {
              if (onOk) {
                await onOk();
              }
              onClose();
            }}
            disabled={okLoading}
            className={clsx(
              "flex-1 h-11 rounded-[22px] text-white text-sm font-medium transition-colors",
              okVariant === "danger" && "bg-error-500 hover:bg-error-600",
              okVariant === "secondary" &&
                "bg-secondary-500 hover:bg-secondary-600",
              okVariant === "primary" && "bg-primary-500 hover:bg-primary-600",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {okLoading ? "处理中..." : okText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

Dialog.displayName = "Dialog";
