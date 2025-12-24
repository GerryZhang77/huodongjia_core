/**
 * Input 组件类型定义 (2024 新版设计系统)
 *
 * 设计规范: docs-private/design-system/04-组件设计规范.md
 * 设计稿: ui_design_drafts/UISystem/04-inputs.svg
 */

import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/**
 * Input 尺寸
 * - large: 44px 高度
 * - medium: 40px 高度 (默认)
 * - small: 32px 高度
 */
export type InputSize = "large" | "medium" | "small";

/**
 * Input 状态
 */
export type InputStatus = "default" | "error" | "success" | "warning";

/**
 * Input 基础 Props
 */
export interface InputBaseProps {
  /**
   * 输入框尺寸
   * @default 'medium'
   */
  size?: InputSize;

  /**
   * 状态
   * @default 'default'
   */
  status?: InputStatus;

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;

  /**
   * 左侧图标
   */
  prefix?: ReactNode;

  /**
   * 右侧图标
   */
  suffix?: ReactNode;

  /**
   * 标签文本
   */
  label?: string;

  /**
   * 帮助/错误信息
   */
  helperText?: string;

  /**
   * 是否必填 (显示星号)
   */
  required?: boolean;

  /**
   * 自定义类名 (外层容器)
   */
  className?: string;

  /**
   * 自定义类名 (输入框本身)
   */
  inputClassName?: string;
}

/**
 * Text Input Props
 */
export interface InputProps
  extends InputBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {}

/**
 * Textarea Props
 */
export interface TextareaProps
  extends Omit<InputBaseProps, "prefix" | "suffix">,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "prefix"> {
  /**
   * 行数
   * @default 3
   */
  rows?: number;

  /**
   * 是否可调整大小
   * @default 'vertical'
   */
  resize?: "none" | "vertical" | "horizontal" | "both";
}

/**
 * Search Input Props
 */
export interface SearchInputProps extends InputProps {
  /**
   * 搜索按钮点击回调
   */
  onSearch?: (value: string) => void;

  /**
   * 是否在输入时即时搜索
   * @default false
   */
  searchOnType?: boolean;

  /**
   * 加载中状态
   */
  loading?: boolean;
}
