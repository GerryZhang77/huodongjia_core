/**
 * Container 组件类型定义
 */

import { ReactNode, HTMLAttributes } from "react";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** 子元素 */
  children: ReactNode;

  /** 容器最大宽度 */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";

  /** 是否居中 */
  center?: boolean;

  /** 水平内边距 */
  padding?: "none" | "sm" | "md" | "lg";

  /** 垂直内边距 */
  paddingY?: "none" | "sm" | "md" | "lg";

  /** 自定义类名 */
  className?: string;
}
