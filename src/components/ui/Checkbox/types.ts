/**
 * Checkbox 组件类型定义
 */

import { ReactNode } from "react";

export type CheckboxSize = "small" | "medium" | "large";

export interface CheckboxProps {
  /** 是否选中 */
  checked?: boolean;
  /** 选中状态变化回调 */
  onChange?: (checked: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 尺寸 */
  size?: CheckboxSize;
  /** 自定义类名 */
  className?: string;
  /** 标签内容 */
  children?: ReactNode;
  /** 元素 ID */
  id?: string;
}
