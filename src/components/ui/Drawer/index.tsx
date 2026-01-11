/**
 * Drawer - 抽屉组件 (2024 新版设计系统)
 *
 * 用途: 从屏幕边缘滑出的面板，适合移动端
 *
 * 设计规范:
 * - 圆角: 顶部 16px (bottom) / 左侧 16px (right)
 * - 阴影: shadow-2xl
 * - 动画: slide-in
 * - 默认从底部弹出（移动端友好）
 *
 * @example
 * ```tsx
 * <Drawer
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="筛选"
 *   placement="bottom"
 * >
 *   <p>内容</p>
 * </Drawer>
 * ```
 */

import { FC, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { X } from "lucide-react";
import type { DrawerProps } from "./types";

/**
 * Drawer 组件
 */
export const Drawer: FC<DrawerProps> = ({
  open,
  onClose,
  children,
  title,
  placement = "bottom",
  closable = true,
  maskClosable = true,
  className,
  size = "medium",
  footer,
  zIndex = 1000,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // 尺寸映射
  const sizeClasses = {
    small: {
      top: "h-1/3",
      bottom: "h-1/3",
      left: "w-64",
      right: "w-64",
    },
    medium: {
      top: "h-1/2",
      bottom: "h-1/2",
      left: "w-80",
      right: "w-80",
    },
    large: {
      top: "h-2/3",
      bottom: "h-2/3",
      left: "w-96",
      right: "w-96",
    },
  };

  // 位置类名
  const placementClasses = {
    top: clsx(
      "top-0 left-0 right-0 rounded-b-2xl",
      typeof size === "string" && sizeClasses[size as keyof typeof sizeClasses]
        ? sizeClasses[size as keyof typeof sizeClasses].top
        : ""
    ),
    bottom: clsx(
      "bottom-0 left-0 right-0 rounded-t-2xl",
      typeof size === "string" && sizeClasses[size as keyof typeof sizeClasses]
        ? sizeClasses[size as keyof typeof sizeClasses].bottom
        : ""
    ),
    left: clsx(
      "top-0 left-0 bottom-0 rounded-r-2xl",
      typeof size === "string" && sizeClasses[size as keyof typeof sizeClasses]
        ? sizeClasses[size as keyof typeof sizeClasses].left
        : ""
    ),
    right: clsx(
      "top-0 right-0 bottom-0 rounded-l-2xl",
      typeof size === "string" && sizeClasses[size as keyof typeof sizeClasses]
        ? sizeClasses[size as keyof typeof sizeClasses].right
        : ""
    ),
  };

  // 动画类名
  const animationClasses = {
    top: open ? "translate-y-0" : "-translate-y-full",
    bottom: open ? "translate-y-0" : "translate-y-full",
    left: open ? "translate-x-0" : "-translate-x-full",
    right: open ? "translate-x-0" : "translate-x-full",
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

  // 阻止 body 滚动 - 使用更可靠的方式
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [open]);

  // 处理遮罩点击
  const handleMaskClick = () => {
    if (maskClosable) {
      onClose();
    }
  };

  // 不显示时返回 null
  if (!open) {
    return null;
  }

  const drawerContent = (
    <>
      {/* 遮罩层 */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 backdrop-blur-sm",
          "transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        style={{ zIndex }}
        onClick={handleMaskClick}
        aria-hidden="true"
      />

      {/* Drawer 内容 */}
      <div
        ref={drawerRef}
        className={clsx(
          "fixed bg-white dark:bg-gray-800 shadow-2xl flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          placementClasses[placement],
          animationClasses[placement],
          className
        )}
        style={{
          zIndex: zIndex + 1,
          height:
            !["small", "medium", "large"].includes(size) &&
            (placement === "top" || placement === "bottom")
              ? size
              : undefined,
          width:
            !["small", "medium", "large"].includes(size) &&
            (placement === "left" || placement === "right")
              ? size
              : undefined,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
      >
        {/* 头部 */}
        {(title || closable) && (
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            {title && (
              <h3
                id="drawer-title"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                {title}
              </h3>
            )}
            {closable && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-auto"
                aria-label="关闭"
              >
                <X size={18} className="text-gray-400 dark:text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* 内容区 */}
        <div className="overflow-y-auto flex-1 min-h-0">{children}</div>

        {/* 底部操作区 */}
        {footer && (
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
};

Drawer.displayName = "Drawer";
