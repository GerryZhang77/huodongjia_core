/**
 * Modal 组件类型定义
 */

import { ReactNode } from "react";

/**
 * Modal 基础 Props
 */
export interface ModalProps {
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 子元素 */
  children: ReactNode;
  /** 标题 */
  title?: ReactNode;
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 内容区域类名 */
  contentClassName?: string;
  /** 宽度 */
  width?: "small" | "medium" | "large" | "full" | string;
  /** 是否居中显示 */
  centered?: boolean;
  /** 底部操作区域 */
  footer?: ReactNode;
  /** 是否显示默认底部 */
  showFooter?: boolean;
  /** 确认按钮文本 */
  okText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认按钮回调 */
  onOk?: () => void | Promise<void>;
  /** 取消按钮回调 */
  onCancel?: () => void;
  /** 确认按钮加载状态 */
  okLoading?: boolean;
  /** 确认按钮类型 */
  okButtonProps?: {
    variant?: "primary" | "secondary" | "accent" | "danger";
    disabled?: boolean;
  };
  /** 动画时长 */
  duration?: number;
  /** z-index */
  zIndex?: number;
}
