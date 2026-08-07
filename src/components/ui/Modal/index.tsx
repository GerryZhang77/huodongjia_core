/**
 * Modal - 模态框组件 (2024 新版设计系统)
 *
 * 设计规范:
 * - 圆角: 16px
 * - 阴影: shadow-lg
 * - 背景遮罩: bg-black/50 + backdrop-blur-sm
 * - 动画: fade-in + scale
 * - 移动端: 底部弹出 / 全屏
 *
 * @example
 * ```tsx
 * <Modal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="标题"
 * >
 *   <p>内容</p>
 * </Modal>
 * ```
 */

import { FC, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { X } from "lucide-react";
import { Button } from "../Button";
import type { ModalProps } from "./types";
import { useBodyScrollLock } from "../useBodyScrollLock";

/**
 * Modal 组件
 */
export const Modal: FC<ModalProps> = ({
  open,
  onClose,
  children,
  title,
  closable = true,
  maskClosable = true,
  className,
  contentClassName,
  width = "medium",
  centered = true,
  footer,
  showFooter = false,
  okText = "确定",
  cancelText = "取消",
  onOk,
  onCancel,
  okLoading = false,
  okButtonProps,
  duration = 200,
  zIndex = 1000,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);

  // 宽度映射
  const widthClasses = {
    small: "max-w-sm",
    medium: "max-w-lg",
    large: "max-w-2xl",
    full: "max-w-full mx-4",
  };

  // 处理 ESC 键关闭
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closable) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closable, onClose]);

  // 处理遮罩点击
  const handleMaskClick = (e: React.MouseEvent) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose();
    }
  };

  // 处理取消
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  // 处理确定
  const handleOk = async () => {
    if (onOk) {
      await onOk();
    }
    onClose();
  };

  if (!open) return null;

  const modalContent = (
    <>
      {/* 遮罩层 */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 backdrop-blur-sm",
          "transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        style={{
          zIndex,
          transitionDuration: `${duration}ms`,
        }}
        onClick={handleMaskClick}
        aria-hidden="true"
      />

      {/* Modal 容器 */}
      <div
        className={clsx(
          "fixed inset-0 overflow-y-auto",
          "flex items-center justify-center p-4",
          !centered && "items-start pt-20"
        )}
        style={{ zIndex: zIndex + 1 }}
        onClick={handleMaskClick}
      >
        {/* Modal 内容 */}
        <div
          ref={modalRef}
          className={clsx(
            "relative w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl",
            "transform transition-all",
            typeof width === "string" &&
              widthClasses[width as keyof typeof widthClasses]
              ? widthClasses[width as keyof typeof widthClasses]
              : "",
            open ? "opacity-100 scale-100" : "opacity-0 scale-95",
            className
          )}
          style={{
            transitionDuration: `${duration}ms`,
            width: !["small", "medium", "large", "full"].includes(width)
              ? width
              : undefined,
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          {/* 头部 */}
          {(title || closable) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  {title}
                </h3>
              )}
              {closable && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="关闭"
                >
                  <X size={18} className="text-gray-400 dark:text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* 内容区 */}
          <div className={clsx("px-6 py-4", contentClassName)}>{children}</div>

          {/* 底部操作区 */}
          {(footer !== undefined || showFooter) && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              {footer !== undefined ? (
                footer
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    {cancelText}
                  </Button>
                  <Button
                    variant={okButtonProps?.variant || "primary"}
                    onClick={handleOk}
                    loading={okLoading}
                    disabled={okButtonProps?.disabled}
                  >
                    {okText}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

Modal.displayName = "Modal";
