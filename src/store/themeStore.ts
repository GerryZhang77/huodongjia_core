/**
 * 主题状态管理
 * 使用 Zustand 管理全局主题状态。
 * 暗黑模式暂未完整适配，运行时强制使用日间模式。
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
 * 根据模式计算实际主题
 */
const resolveTheme = (mode: ThemeMode): Theme => {
  void mode;
  return "light";
};

/**
 * 应用主题到 DOM
 */
const applyTheme = (theme: Theme) => {
  void theme;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add("light");
  root.setAttribute("data-theme", "light");
  root.style.colorScheme = "light";
};

/**
 * 同步读取 localStorage 中保存的 mode，避免 persist rehydration 异步导致的时序问题
 */
const getInitialMode = (): ThemeMode => {
  return "light";
};

const initialMode = getInitialMode();
const initialTheme = resolveTheme(initialMode);
applyTheme(initialTheme);

/**
 * 主题 Store
 * 支持持久化存储，页面刷新后保持用户选择
 * 支持跟随系统主题
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: initialMode,
      theme: initialTheme,
      isDark: initialTheme === "dark",

      setMode: (mode: ThemeMode) => {
        const theme = resolveTheme(mode);
        applyTheme(theme);
        set({ mode: "light", theme, isDark: false });
      },

      setTheme: (theme: Theme) => {
        // 兼容旧 API，直接设置主题时切换到手动模式
        applyTheme(theme);
        set({ mode: "light", theme: "light", isDark: false });
      },

      toggleTheme: () => {
        void get;
        applyTheme("light");
        set({ mode: "light", theme: "light", isDark: false });
      },
    }),
    {
      name: "theme-storage",
      // 仅持久化 mode 字段
      partialize: () => ({ mode: "light" as ThemeMode }),
      // 恢复时重新应用主题
      onRehydrateStorage: () => (state) => {
        if (state) {
          const theme = resolveTheme(state.mode);
          applyTheme(theme);
          state.mode = "light";
          state.theme = theme;
          state.isDark = false;
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
  useThemeStore.setState({ mode: "light", theme: "light", isDark: false });
};
