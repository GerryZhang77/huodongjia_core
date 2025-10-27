/**
 * Grid 组件类型定义
 */

import { ReactNode, HTMLAttributes } from "react";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** 子元素 */
  children: ReactNode;

  /** 列数（响应式） */
  cols?: {
    /** 默认列数 */
    default?: 1 | 2 | 3 | 4 | 5 | 6;
    /** sm 断点 (640px+) */
    sm?: 1 | 2 | 3 | 4 | 5 | 6;
    /** md 断点 (768px+) */
    md?: 1 | 2 | 3 | 4 | 5 | 6;
    /** lg 断点 (1024px+) */
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
    /** xl 断点 (1280px+) */
    xl?: 1 | 2 | 3 | 4 | 5 | 6;
  };

  /** 列数（简化版，所有断点相同） */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;

  /** 元素间距 */
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12;

  /** 自定义类名 */
  className?: string;
}
