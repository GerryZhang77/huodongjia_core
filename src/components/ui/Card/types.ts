/**
 * Card 组件类型定义
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

  /** 是否显示阴影 */
  shadow?: "none" | "sm" | "md" | "lg";

  /** 是否可悬停（显示悬停效果） */
  hoverable?: boolean;

  /** 圆角大小 */
  radius?: "none" | "sm" | "md" | "lg" | "xl";

  /** 自定义类名 */
  className?: string;

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
