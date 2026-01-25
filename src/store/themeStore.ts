/**
 * 主题状态管理
 * 使用 Zustand 管理全局主题状态（亮色/暗色/跟随系统模式）
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";
export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  /** 主题模式：亮色、暗色、跟随系统 */
  mode: ThemeMode;
  /** 当前实际应用的主题 */
  theme: Theme;
  /** 设置主题模式 */
  setMode: (mode: ThemeMode) => void;
  /** 设置主题（兼容旧API） */
  setTheme: (theme: Theme) => void;
  /** 切换主题（仅在 light/dark 间切换） */
  toggleTheme: () => void;
  /** 是否为暗黑模式 */
  isDark: boolean;
}

/**
 * 获取系统主题偏好
 */
const getSystemTheme = (): Theme => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

/**
 * 根据模式计算实际主题
 */
const resolveTheme = (mode: ThemeMode): Theme => {
  if (mode === "system") {
    return getSystemTheme();
  }
  return mode;
};

/**
 * 应用主题到 DOM
 */
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
};

/**
 * 主题 Store
 * 支持持久化存储，页面刷新后保持用户选择
 * 支持跟随系统主题
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      theme: resolveTheme("system"),
      isDark: resolveTheme("system") === "dark",

      setMode: (mode: ThemeMode) => {
        const theme = resolveTheme(mode);
        applyTheme(theme);
        set({ mode, theme, isDark: theme === "dark" });
      },

      setTheme: (theme: Theme) => {
        // 兼容旧 API，直接设置主题时切换到手动模式
        applyTheme(theme);
        set({ mode: theme, theme, isDark: theme === "dark" });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme: Theme = currentTheme === "light" ? "dark" : "light";
        applyTheme(newTheme);
        set({ mode: newTheme, theme: newTheme, isDark: newTheme === "dark" });
      },
    }),
    {
      name: "theme-storage",
      // 仅持久化 mode 字段
      partialize: (state) => ({ mode: state.mode }),
      // 恢复时重新应用主题
      onRehydrateStorage: () => (state) => {
        if (state) {
          const theme = resolveTheme(state.mode);
          applyTheme(theme);
          state.theme = theme;
          state.isDark = theme === "dark";
        }
      },
    },
  ),
);

/**
 * 初始化主题
 * 在应用启动时调用，确保主题正确应用到 DOM
 * 同时设置系统主题变化监听
 */
export const initTheme = () => {
  const state = useThemeStore.getState();
  const theme = resolveTheme(state.mode);
  applyTheme(theme);

  // 监听系统主题变化
  if (typeof window !== "undefined" && window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const currentState = useThemeStore.getState();
      // 仅当模式为 system 时才响应系统主题变化
      if (currentState.mode === "system") {
        const newTheme = getSystemTheme();
        applyTheme(newTheme);
        useThemeStore.setState({
          theme: newTheme,
          isDark: newTheme === "dark",
        });
      }
    };

    // 添加监听器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleChange);
    }
  }
};
