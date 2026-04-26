/**
 * 商家自定义标签的颜色样式映射
 *
 * 后端持久化的 color 字段是 "primary" / "success" 等 key，
 * 前端把它们映射成 Tailwind class 组合，确保 CustomTagManager 和 UserCard
 * 在同一份配置上一致呈现。
 */

export interface TagColorOption {
  key: string;
  label: string;
  /** 标签卡背景色 */
  bgClass: string;
  /** 文字颜色 */
  textClass: string;
  /** 边框色（用于在浅背景上做轻微区隔） */
  borderClass: string;
  /** 颜色选择器中的实心圆点 */
  dotClass: string;
}

export const TAG_COLOR_OPTIONS: TagColorOption[] = [
  {
    key: "primary",
    label: "蓝色",
    bgClass: "bg-primary-100",
    textClass: "text-primary-600",
    borderClass: "border-primary-200",
    dotClass: "bg-primary-400",
  },
  {
    key: "secondary",
    label: "橙色",
    bgClass: "bg-orange-100",
    textClass: "text-orange-600",
    borderClass: "border-orange-200",
    dotClass: "bg-orange-400",
  },
  {
    key: "accent",
    label: "紫色",
    bgClass: "bg-purple-100",
    textClass: "text-purple-600",
    borderClass: "border-purple-200",
    dotClass: "bg-purple-400",
  },
  {
    key: "success",
    label: "绿色",
    bgClass: "bg-green-100",
    textClass: "text-green-600",
    borderClass: "border-green-200",
    dotClass: "bg-green-400",
  },
  {
    key: "warning",
    label: "黄色",
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-700",
    borderClass: "border-yellow-200",
    dotClass: "bg-yellow-400",
  },
  {
    key: "error",
    label: "红色",
    bgClass: "bg-red-100",
    textClass: "text-red-600",
    borderClass: "border-red-200",
    dotClass: "bg-red-400",
  },
];

const FALLBACK = TAG_COLOR_OPTIONS[0];

export function getTagColorOption(key: string | undefined): TagColorOption {
  if (!key) return FALLBACK;
  return TAG_COLOR_OPTIONS.find((c) => c.key === key) || FALLBACK;
}

/**
 * 返回展示一个商家自定义标签所需的 Tailwind 类
 * 包含背景、文本、细边框
 */
export function getCustomTagClassName(colorKey: string | undefined): string {
  const opt = getTagColorOption(colorKey);
  return `${opt.bgClass} ${opt.textClass} border ${opt.borderClass}`;
}
