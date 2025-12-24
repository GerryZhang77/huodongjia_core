/**
 * Button 组件类型定义 (2024 新版设计系统)
 *
 * 设计规范: docs-private/design-system/04-组件设计规范.md
 * 设计稿: ui_design_drafts/UISystem/03-buttons.svg
 */

import type { ReactNode } from "react";

/**
 * Button 尺寸
 * - large: 52px 高度，用于页面主操作 (26px 圆角)
 * - medium: 44px 高度，标准操作（默认）⭐ (22px 圆角)
 * - small: 36px 高度，次要操作 (18px 圆角)
 */
export type ButtonSize = "large" | "medium" | "small";

/**
 * Button 变体
 * - primary: 主要按钮，天空蓝渐变背景 + 蓝色阴影
 * - secondary: 次要按钮，活力橙渐变背景 + 橙色阴影
 * - accent: 强调按钮，梦幻紫渐变背景 + 紫色阴影
 * - success: 成功按钮，成功绿渐变背景 + 绿色阴影
 * - outline: 轮廓按钮，白色背景 + 品牌色边框
 * - ghost: 幽灵按钮，透明背景
 * - text: 文本按钮，无背景无边框
 * - light: 淡色按钮，淡色背景 + 品牌色文字
 * - danger: 危险按钮，红色渐变背景 + 红色阴影
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "outline"
  | "ghost"
  | "text"
  | "light"
  | "danger";

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
   * 右侧图标
   */
  iconRight?: ReactNode;

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
