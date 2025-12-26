/**
 * Dialog 组件类型定义
 */

import { ReactNode } from "react";

/**
 * Dialog 类型
 */
export type DialogType = "info" | "success" | "warning" | "error" | "confirm";

/**
 * Dialog Props
 */
export interface DialogProps {
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 类型 */
  type?: DialogType;
  /** 标题 */
  title?: ReactNode;
  /** 内容 */
  content?: ReactNode;
  /** 图标 */
  icon?: ReactNode;
  /** 确认按钮文本 */
  okText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认回调 */
  onOk?: () => void | Promise<void>;
  /** 取消回调 */
  onCancel?: () => void;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 确认按钮加载状态 */
  okLoading?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * Dialog 命令式调用配置
 */
export interface DialogConfig extends Omit<DialogProps, "open" | "onClose"> {
  /** 关闭回调 */
  onClose?: () => void;
}
