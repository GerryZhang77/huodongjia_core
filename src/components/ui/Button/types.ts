/**
 * Button 组件类型定义 - 纯 Tailwind v4
 */

import type { ReactNode } from "react";

/**
 * 按钮尺寸
 */
export type ButtonSize = "large" | "medium" | "small";

/**
 * 按钮变体
 */
export type ButtonVariant =
  | "primary" // 主按钮 - 天空蓝
  | "secondary" // 次要按钮 - 活力橙
  | "accent" // 强调按钮 - 梦幻紫
  | "success" // 成功按钮 - 成功绿
  | "danger" // 危险按钮 - 错误红
  | "outline" // 轮廓按钮
  | "light" // 浅色按钮
  | "ghost" // 幽灵按钮
  | "text"; // 文本按钮

/**
 * Button 组件 Props
 */
export interface ButtonProps {
  /** 按钮文本 */
  children: ReactNode;

  /** 尺寸 @default 'medium' */
  size?: ButtonSize;

  /** 变体 @default 'primary' */
  variant?: ButtonVariant;

  /** 是否禁用 @default false */
  disabled?: boolean;

  /** 是否加载中 @default false */
  loading?: boolean;

  /** 是否块级 @default false */
  block?: boolean;

  /** 左侧图标 */
  icon?: ReactNode;

  /** 右侧图标 */
  iconRight?: ReactNode;

  /** 自定义类名 */
  className?: string;

  /** 点击事件 */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** 按钮类型 @default 'button' */
  type?: "button" | "submit" | "reset";

  /**
   * ARIA 标签（无障碍）
   */
  "aria-label"?: string;
}
