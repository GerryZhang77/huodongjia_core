/**
 * Tag 组件类型定义 (2024 新版设计系统)
 *
 * 设计规范: docs-private/design-system/04-组件设计规范.md
 * 设计稿: ui_design_drafts/UISystem/05-tags.svg
 */

import type { ReactNode } from "react";

/**
 * Tag 颜色
 * - primary: 天空蓝
 * - secondary: 活力橙
 * - accent: 梦幻紫
 * - success: 成功绿
 * - warning: 警告黄
 * - error: 错误红
 * - gray: 中性灰
 */
export type TagColor =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "gray";

/**
 * Tag 变体
 * - filled: 填充背景
 * - soft: 淡色背景 (推荐)
 * - outline: 轮廓线
 */
export type TagVariant = "filled" | "soft" | "outline";

/**
 * Tag 尺寸
 * - large: 28px 高度
 * - medium: 24px 高度 (默认)
 * - small: 20px 高度
 */
export type TagSize = "large" | "medium" | "small";

/**
 * Tag 组件 Props
 */
export interface TagProps {
  /**
   * 标签文本或子元素
   */
  children: ReactNode;

  /**
   * 颜色
   * @default 'primary'
   */
  color?: TagColor;

  /**
   * 变体样式
   * @default 'soft'
   */
  variant?: TagVariant;

  /**
   * 尺寸
   * @default 'medium'
   */
  size?: TagSize;

  /**
   * 左侧图标
   */
  icon?: ReactNode;

  /**
   * 是否可关闭
   * @default false
   */
  closable?: boolean;

  /**
   * 关闭回调
   */
  onClose?: () => void;

  /**
   * 点击回调 (当需要可点击时)
   */
  onClick?: () => void;

  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * TagGroup 组件 Props (标签组)
 */
export interface TagGroupProps {
  /**
   * 子元素 (Tag 组件列表)
   */
  children: ReactNode;

  /**
   * 间距
   * @default 'small'
   */
  gap?: "small" | "medium" | "large";

  /**
   * 自定义类名
   */
  className?: string;
}
