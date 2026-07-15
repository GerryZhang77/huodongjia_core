/**
 * Card 组件类型定义 (2024 新版设计系统)
 */

import { ReactNode, HTMLAttributes } from "react";

export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 子元素 */
  children: ReactNode;

  /** 卡片标题 */
  title?: ReactNode;

  /** 额外的标题区域内容 */
  extra?: ReactNode;

  /** 内边距大小 */
  padding?: "none" | "small" | "medium" | "large";

  /** 是否显示边框 */
  bordered?: boolean;

  /**
   * 阴影大小
   * - none: 无阴影
   * - sm: 小阴影
   * - default: 默认卡片阴影 (推荐)
   * - md: 中等阴影
   * - lg: 大阴影
   */
  shadow?: "none" | "sm" | "default" | "md" | "lg";

  /** 是否可悬停（显示悬停效果: 阴影增强 + 蓝色光晕 + 上移） */
  hoverable?: boolean;

  /**
   * 圆角大小
   * @default 'xl' (16px)
   */
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";

  /** 自定义类名 */
  className?: string;

  /** 内容区域自定义类名 */
  bodyClassName?: string;

  /** 点击事件（当需要卡片可点击时） */
  onClick?: () => void;
}

export interface CardHeaderProps {
  title?: ReactNode;
  extra?: ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: ReactNode;
  padding?: CardProps["padding"];
  className?: string;
}
