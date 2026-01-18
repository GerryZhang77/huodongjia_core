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
      // ===== 品牌色彩系统 (2024 新设计) =====
      colors: {
        // 主色 - 天空蓝 Sky Blue
        // 传达活力、信任、专业，品牌核心色彩
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#3B82F6", // ⭐ 主色 Primary
          500: "#2563EB", // 悬停
          600: "#1D4ED8", // 按下
          700: "#1E40AF",
          800: "#1E3A8A",
          900: "#172554",
        },
        // 辅助色 - 活力橙 Vibrant Orange
        // 用于强调、引导、活动标签，增添活力与热情
        secondary: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#F97316", // ⭐ 主色 Secondary
          500: "#EA580C", // 悬停
          600: "#C2410C", // 按下
          700: "#9A3412",
          800: "#7C2D12",
          900: "#6C2711",
        },
        // 强调色 - 梦幻紫 Dream Purple
        // 用于特殊标记、高亮、智能匹配等特色功能
        accent: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#A855F7", // ⭐ 主色 Accent
          500: "#9333EA", // 悬停
          600: "#7E22CE", // 按下
          700: "#6B21A8",
          800: "#581C87",
          900: "#4C1D95",
        },
        // 功能色 - 成功
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#22C55E", // ⭐ 主色
          500: "#16A34A",
          600: "#15803D",
          700: "#166534",
          800: "#14532D",
          900: "#052E16",
        },
        // 功能色 - 信息 (与主色一致)
        info: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#3B82F6",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          800: "#1E3A8A",
          900: "#172554",
        },
        // 功能色 - 警告
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#F59E0B", // ⭐ 主色
          500: "#D97706",
          600: "#B45309",
          700: "#92400E",
          800: "#78350F",
          900: "#653208",
        },
        // 功能色 - 错误
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#EF4444", // ⭐ 主色
          500: "#DC2626",
          600: "#B91C1C",
          700: "#991B1B",
          800: "#7F1D1D",
          900: "#651A1A",
        },
        // 中性色 - 石板灰 Slate
        // 用于文字、边框、背景，提供层次与对比
        gray: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },

      // ===== 字体系统 =====
      fontFamily: {
        // 主字体 - Nunito (圆润友好、现代清新)
        sans: [
          "Nunito",
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Microsoft YaHei",
          "Noto Sans SC",
          "sans-serif",
        ],
        // 等宽字体（代码、数据）
        mono: ["SF Mono", "Monaco", "Consolas", "Courier New", "monospace"],
      },

      // 字号体系 (基于设计稿)
      fontSize: {
        xs: ["0.6875rem", { lineHeight: "1.45" }], // 11px - Overline
        sm: ["0.75rem", { lineHeight: "1.5" }], // 12px - Caption
        base: ["0.875rem", { lineHeight: "1.57" }], // 14px - Body
        lg: ["1rem", { lineHeight: "1.625" }], // 16px - Body Large / H3
        xl: ["1.25rem", { lineHeight: "1.4" }], // 20px - H2
        "2xl": ["1.5rem", { lineHeight: "1.33" }], // 24px - H1
        "3xl": ["2rem", { lineHeight: "1.25" }], // 32px - Display
        "4xl": ["2.5rem", { lineHeight: "1.2" }], // 40px - Large Display
      },

      // 字重
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },

      // 行高
      lineHeight: {
        tight: "1.25",
        snug: "1.33",
        normal: "1.5",
        relaxed: "1.625",
        loose: "2",
      },

      // 字间距
      letterSpacing: {
        tight: "-0.02em",
        normal: "0",
        wide: "0.02em",
        wider: "0.05em",
        widest: "0.1em",
      },

      // ===== 间距系统 (8px 网格) =====
      spacing: {
        0: "0",
        0.5: "0.125rem", // 2px
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
        content: "720px",
      },

      // ===== 圆角 (基于设计稿) =====
      borderRadius: {
        none: "0",
        sm: "0.25rem", // 4px - 小元素
        DEFAULT: "0.5rem", // 8px
        md: "0.625rem", // 10px - 输入框
        lg: "0.75rem", // 12px - 小卡片
        xl: "1rem", // 16px - 卡片
        "2xl": "1.375rem", // 22px - Pill 按钮
        "3xl": "1.625rem", // 26px - 大按钮
        full: "9999px",
      },

      // ===== 阴影系统 =====
      boxShadow: {
        // 基础阴影
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 4px 8px rgba(0, 0, 0, 0.06)",
        md: "0 4px 12px rgba(0, 0, 0, 0.08)",
        lg: "0 8px 16px rgba(0, 0, 0, 0.08)",
        xl: "0 12px 24px rgba(0, 0, 0, 0.1)",
        "2xl": "0 16px 32px rgba(0, 0, 0, 0.12)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        none: "none",
        // 卡片阴影
        card: "0 4px 12px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 16px rgba(59, 130, 246, 0.12)",
        // 彩色阴影 (按钮)
        primary: "0 2px 8px rgba(59, 130, 246, 0.3)",
        secondary: "0 2px 8px rgba(249, 115, 22, 0.3)",
        accent: "0 2px 8px rgba(168, 85, 247, 0.3)",
        success: "0 2px 8px rgba(34, 197, 94, 0.3)",
        // 输入框焦点阴影
        "input-focus": "0 0 0 4px rgba(59, 130, 246, 0.25)",
      },

      // ===== 断点 (响应式) =====
      screens: {
        xs: "375px", // 手机
        sm: "576px", // 手机横屏
        md: "768px", // 平板
        lg: "992px", // 小桌面
        xl: "1200px", // 桌面
        "2xl": "1440px", // 大桌面
      },

      // ===== 动画 =====
      transitionDuration: {
        fast: "150ms",
        base: "300ms",
        slow: "500ms",
      },

      transitionTimingFunction: {
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },

      // ===== 动画关键帧 =====
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.9)" },
          "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "ping-slow": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "75%, 100%": { opacity: "0", transform: "scale(1.3)" },
        },
      },

      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "ping-slow": "ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },

      // ===== 背景渐变 =====
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
        "gradient-accent": "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)",
        "gradient-success": "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
        "gradient-header": "linear-gradient(135deg, #EFF6FF 0%, #FFF7ED 100%)",
      },
    },
  },
  plugins: [],
};
