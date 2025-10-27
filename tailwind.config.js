/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
      },
    },
    extend: {
      // 品牌色彩系统
      colors: {
        // 主色 - 晨曦蓝 (Dawn Blue)
        primary: {
          50: "#F0F7FF",
          100: "#E0EDFF",
          200: "#C2D9FF",
          300: "#96B8FF",
          400: "#6B96FF",
          500: "#4A78FF",
          600: "#3862E6",
          700: "#2B4DCC",
          800: "#1F39B3",
          900: "#142699",
        },
        // 辅助色 - 暖桃粉 (Warm Peach)
        secondary: {
          50: "#FFF5F7",
          100: "#FFE4EC",
          200: "#FFCAD8",
          300: "#FFB0C5",
          400: "#FF96B1",
          500: "#FF7C9E",
          600: "#E6637E",
          700: "#CC4A5E",
          800: "#B3313F",
          900: "#991821",
        },
        // 点缀色 - 薄荷绿 (Mint Green)
        accent: {
          50: "#F0FDF9",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        // 功能色 - 成功 (薄荷绿)
        success: {
          50: "#F0FDF9",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        // 功能色 - 信息 (晨曦蓝)
        info: {
          50: "#F0F7FF",
          100: "#E0EDFF",
          200: "#C2D9FF",
          300: "#96B8FF",
          400: "#6B96FF",
          500: "#4A78FF",
          600: "#3862E6",
          700: "#2B4DCC",
          800: "#1F39B3",
          900: "#142699",
        },
        // 功能色 - 警告
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // 功能色 - 错误
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        // 中性色
        gray: {
          50: "#FAFBFC",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },

      // 字体家族
      fontFamily: {
        // 默认字体栈（中西文混合，Inter 优先用于英文/数字）
        sans: [
          "Inter",
          "PingFang SC",
          "Microsoft YaHei",
          "Noto Sans SC",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        // 等宽字体（代码、数据）
        mono: ["SF Mono", "Consolas", "Monaco", "Courier New", "monospace"],
      },

      // 字号体系 (4px 递增)
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }], // 12px
        sm: ["0.875rem", { lineHeight: "1.5" }], // 14px
        base: ["1rem", { lineHeight: "1.6" }], // 16px
        lg: ["1.125rem", { lineHeight: "1.75" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.5" }], // 20px
        "2xl": ["1.5rem", { lineHeight: "1.4" }], // 24px
        "3xl": ["1.875rem", { lineHeight: "1.3" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "1.2" }], // 36px
      },

      // 字重
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },

      // 行高
      lineHeight: {
        tight: "1.25",
        normal: "1.5",
        relaxed: "1.75",
        loose: "2",
      },

      // 字间距
      letterSpacing: {
        tight: "-0.02em",
        normal: "0",
        wide: "0.02em",
        wider: "0.05em",
      },

      // 间距系统 (8px 网格)
      spacing: {
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
      },

      // 最大宽度
      maxWidth: {
        container: "1200px",
        narrow: "680px",
      },

      // 圆角
      borderRadius: {
        none: "0",
        sm: "0.25rem", // 4px
        DEFAULT: "0.5rem", // 8px
        md: "0.5rem", // 8px
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        full: "9999px",
      },

      // 阴影
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 2px 8px rgba(0, 0, 0, 0.08)",
        md: "0 4px 12px rgba(0, 0, 0, 0.1)",
        lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
        xl: "0 12px 32px rgba(0, 0, 0, 0.15)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        none: "none",
      },

      // 断点 (响应式)
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1440px",
      },

      // 动画时长
      transitionDuration: {
        fast: "150ms",
        base: "300ms",
        slow: "500ms",
      },

      // 缓动函数
      transitionTimingFunction: {
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        in: "cubic-bezier(0.4, 0, 1, 1)",
      },
    },
  },
  plugins: [],
};
