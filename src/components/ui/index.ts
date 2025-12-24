/**
 * 基础 UI 组件统一导出 (2024 新版设计系统)
 *
 * 使用示例:
 * ```tsx
 * import { Button, Card, Input, Tag } from '@/components/ui';
 * ```
 */

/**
 * UI 组件统一导出
 */

// 基础组件
export { Button } from "./Button";
export type { ButtonProps, ButtonSize, ButtonVariant } from "./Button/types";

// 布局组件
export { Card } from "./Card";
export type { CardProps } from "./Card/types";

export { Container } from "./Container";
export type { ContainerProps } from "./Container/types";

export { Stack } from "./Stack";
export type { StackProps } from "./Stack/types";

export { Grid } from "./Grid";
export type { GridProps } from "./Grid/types";

// 表单组件
export { Input, Textarea, SearchInput } from "./Input";
export type {
  InputProps,
  TextareaProps,
  SearchInputProps,
  InputSize,
  InputStatus,
} from "./Input/types";

// 数据展示组件
export { Tag, TagGroup } from "./Tag";
export type {
  TagProps,
  TagGroupProps,
  TagColor,
  TagVariant,
  TagSize,
} from "./Tag/types";
