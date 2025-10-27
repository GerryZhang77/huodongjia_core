/**
 * 设计系统 - TypeScript 类型定义
 *
 * 用途:
 * 1. 提供类型安全的设计 token
 * 2. IDE 自动补全
 * 3. 程序化样式使用
 */

/* ===== 品牌色彩系统 ===== */

export const colors = {
  primary: {
    50: "#f0f7ff",
    100: "#e0edff",
    200: "#c2d9ff",
    300: "#96b8ff",
    400: "#6b96ff",
    500: "#4a78ff",
    600: "#3862e6",
    700: "#2b4dcc",
    800: "#1f39b3",
    900: "#142699",
  },
  secondary: {
    50: "#fff5f7",
    100: "#ffe4ec",
    200: "#ffcad8",
    300: "#ffb0c5",
    400: "#ff96b1",
    500: "#ff7c9e",
    600: "#e6637e",
    700: "#cc4a5e",
    800: "#b3313f",
    900: "#991821",
  },
  accent: {
    50: "#f0fdf9",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  success: {
    50: "#f0fdf9",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  info: {
    50: "#f0f7ff",
    100: "#e0edff",
    200: "#c2d9ff",
    300: "#96b8ff",
    400: "#6b96ff",
    500: "#4a78ff",
    600: "#3862e6",
    700: "#2b4dcc",
    800: "#1f39b3",
    900: "#142699",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  gray: {
    50: "#fafbfc",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  white: "#ffffff",
  black: "#000000",
} as const;

export type ColorPalette = typeof colors;
export type ColorShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;
export type ColorCategory = keyof Omit<ColorPalette, "white" | "black">;

/* ===== 语义化颜色 ===== */

export const semanticColors = {
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[700],
    tertiary: colors.gray[600],
    disabled: colors.gray[400],
    placeholder: colors.gray[400],
    link: colors.primary[500],
    linkHover: colors.primary[600],
    inverse: colors.white,
  },
  bg: {
    body: colors.gray[50],
    container: colors.white,
    elevated: colors.white,
    overlay: "rgba(0, 0, 0, 0.5)",
    disabled: colors.gray[200],
    hover: colors.gray[100],
    active: colors.gray[200],
  },
  border: {
    default: colors.gray[300],
    strong: colors.gray[400],
    subtle: colors.gray[200],
    focus: colors.primary[500],
  },
} as const;

export type SemanticColors = typeof semanticColors;

/* ===== 字体系统 ===== */

export const fontFamily = {
  sans: '"Inter", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  latin:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  chinese:
    '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif',
  mono: '"SF Mono", "Consolas", "Monaco", "Courier New", monospace',
} as const;

export const fontSize = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

export const letterSpacing = {
  tight: "-0.02em",
  normal: "0",
  wide: "0.02em",
  wider: "0.05em",
} as const;

export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
export type LineHeight = keyof typeof lineHeight;
export type LetterSpacing = keyof typeof letterSpacing;

/* ===== 间距系统 ===== */

export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
} as const;

export type Spacing = keyof typeof spacing;

/* 语义化间距 */
export const semanticSpacing = {
  pageX: spacing[4], // 16px
  pageY: spacing[6], // 24px
  cardPadding: spacing[4], // 16px
  cardGap: spacing[4], // 16px
  listItem: spacing[4], // 16px
} as const;

/* ===== 布局系统 ===== */

export const containerWidth = {
  full: "100%",
  max: "1200px",
  narrow: "680px",
} as const;

export const breakpoints = {
  xs: "375px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1440px",
} as const;

export type Breakpoint = keyof typeof breakpoints;

/* ===== 圆角 ===== */

export const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.5rem", // 24px
  full: "9999px",
} as const;

export type BorderRadius = keyof typeof borderRadius;

/* ===== 阴影 ===== */

export const boxShadow = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 2px 8px rgba(0, 0, 0, 0.08)",
  md: "0 4px 12px rgba(0, 0, 0, 0.1)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
  xl: "0 12px 32px rgba(0, 0, 0, 0.15)",
} as const;

export type BoxShadow = keyof typeof boxShadow;

/* ===== 动画 ===== */

export const transitionDuration = {
  fast: "150ms",
  base: "300ms",
  slow: "500ms",
} as const;

export const transitionTimingFunction = {
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  in: "cubic-bezier(0.4, 0, 1, 1)",
} as const;

export type TransitionDuration = keyof typeof transitionDuration;
export type TransitionTimingFunction = keyof typeof transitionTimingFunction;

/* ===== Z-index 层级 ===== */

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

export type ZIndex = keyof typeof zIndex;

/* ===== 导出所有设计 Token ===== */

export const designTokens = {
  colors,
  semanticColors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  spacing,
  semanticSpacing,
  containerWidth,
  breakpoints,
  borderRadius,
  boxShadow,
  transitionDuration,
  transitionTimingFunction,
  zIndex,
} as const;

export type DesignTokens = typeof designTokens;

/* ===== 工具类型 ===== */

/**
 * 获取颜色值
 * @example
 * getColor('primary', 500) // '#4a78ff'
 */
export function getColor(category: ColorCategory, shade: ColorShade): string {
  return colors[category][shade];
}

/**
 * 获取间距值
 * @example
 * getSpacing(4) // '1rem' (16px)
 */
export function getSpacing(size: Spacing): string {
  return spacing[size];
}

/**
 * 获取字体大小
 * @example
 * getFontSize('lg') // '1.125rem' (18px)
 */
export function getFontSize(size: FontSize): string {
  return fontSize[size];
}
