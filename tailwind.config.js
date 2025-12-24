/**
 * TailwindCSS v4 配置文件
 *
 * 重要说明：
 * - TailwindCSS v4 使用 CSS @theme 块作为主要主题配置方式
 * - 颜色、字体、间距等主题变量已在 src/index.css 的 @theme 中定义
 * - 此文件仅用于配置 content 路径和 plugins
 *
 * @see src/index.css - @theme 主题配置
 * @see docs-private/design-system/ - 设计系统文档
 */

/** @type {import('tailwindcss').Config} */
export default {
  // 深色模式配置
  darkMode: "class",

  // 内容扫描路径 - 告诉 Tailwind 扫描哪些文件
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  // 主题扩展 - v4 中大部分配置移到了 @theme
  // 这里只保留无法在 @theme 中定义的内容
  theme: {
    // Container 配置
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },
    // 扩展主题
    extend: {
      // 🆕 颜色定义 - 确保渐变类可以生成
      colors: {
        primary: {
          400: "#3b82f6",
          500: "#2563eb",
          600: "#1d4ed8",
        },
        secondary: {
          400: "#f97316",
          500: "#ea580c",
          600: "#c2410c",
        },
        accent: {
          400: "#a855f7",
          500: "#9333ea",
          600: "#7e22ce",
        },
        success: {
          400: "#22c55e",
          500: "#16a34a",
          600: "#15803d",
        },
        danger: {
          400: "#ef4444",
          500: "#dc2626",
          600: "#b91c1c",
        },
        gray: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          900: "#0f172a",
        },
      },
      // 彩色阴影 - 与设计稿保持一致
      boxShadow: {
        primary: "0 2px 8px rgba(59, 130, 246, 0.3)",
        "primary-hover": "0 4px 12px rgba(59, 130, 246, 0.4)",
        secondary: "0 2px 8px rgba(249, 115, 22, 0.3)",
        "secondary-hover": "0 4px 12px rgba(249, 115, 22, 0.4)",
        accent: "0 2px 8px rgba(168, 85, 247, 0.3)",
        "accent-hover": "0 4px 12px rgba(168, 85, 247, 0.4)",
        success: "0 2px 8px rgba(34, 197, 94, 0.3)",
        "success-hover": "0 4px 12px rgba(34, 197, 94, 0.4)",
        danger: "0 2px 8px rgba(239, 68, 68, 0.3)",
        "danger-hover": "0 4px 12px rgba(239, 68, 68, 0.4)",
      },
    },
  },

  // 插件
  plugins: [],
};
