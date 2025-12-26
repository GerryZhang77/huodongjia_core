/**
 * Drawer 组件类型定义
 */

import { ReactNode } from "react";

/**
 * Drawer 位置
 */
export type DrawerPlacement = "top" | "right" | "bottom" | "left";

/**
 * Drawer Props
 */
export interface DrawerProps {
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 子元素 */
  children: ReactNode;
  /** 标题 */
  title?: ReactNode;
  /** 位置 */
  placement?: DrawerPlacement;
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 宽度/高度 */
  size?: "small" | "medium" | "large" | string;
  /** 底部操作区域 */
  footer?: ReactNode;
  /** z-index */
  zIndex?: number;
}
