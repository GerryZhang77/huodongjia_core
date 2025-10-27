/**
 * Button 组件类型定义
 *
 * 设计规范: docs-private/design-system/04-组件设计规范.md
 * 设计稿: ui_design_drafts/primary-button.svg
 */

import type { ReactNode } from "react";

/**
 * Button 尺寸
 * - large: 48px 高度，用于页面主操作
 * - medium: 40px 高度，标准操作（默认）⭐
 * - small: 32px 高度，次要操作
 */
export type ButtonSize = "large" | "medium" | "small";

/**
 * Button 变体
 * - primary: 主要按钮，品牌色背景
 * - secondary: 次要按钮，白色背景 + 品牌色边框
 * - text: 文本按钮，透明背景
 */
export type ButtonVariant = "primary" | "secondary" | "text";

/**
 * Button 组件 Props
 */
export interface ButtonProps {
  /**
   * 按钮文本或子元素
   */
  children: ReactNode;

  /**
   * 按钮尺寸
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * 按钮变体
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;

  /**
   * 是否加载中
   * @default false
   */
  loading?: boolean;

  /**
   * 是否块级按钮（占满父容器宽度）
   * @default false
   */
  block?: boolean;

  /**
   * 左侧图标
   */
  icon?: ReactNode;

  /**
   * 自定义类名
   */
  className?: string;

  /**
   * 点击事件
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * HTML button type
   * @default 'button'
   */
  type?: "button" | "submit" | "reset";

  /**
   * ARIA 标签（无障碍）
   */
  "aria-label"?: string;
}
