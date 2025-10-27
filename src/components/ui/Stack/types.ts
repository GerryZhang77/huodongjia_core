/**
 * Stack 组件类型定义
 */

import { ReactNode, HTMLAttributes } from "react";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** 子元素 */
  children: ReactNode;

  /** 堆叠方向 */
  direction?: "horizontal" | "vertical";

  /** 元素间距 */
  spacing?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12;

  /** 对齐方式 */
  align?: "start" | "center" | "end" | "stretch";

  /** 主轴对齐方式 */
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";

  /** 是否自动换行 */
  wrap?: boolean;

  /** 是否分隔线 */
  divider?: boolean;

  /** 自定义类名 */
  className?: string;
}
