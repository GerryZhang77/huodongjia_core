/**
 * 主题状态管理
 * 使用 Zustand 管理全局主题状态（亮色/暗色模式）
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeState {
  /** 当前主题 */
  theme: Theme;
  /** 设置主题 */
  setTheme: (theme: Theme) => void;
  /** 切换主题 */
  toggleTheme: () => void;
  /** 是否为暗黑模式 */
  isDark: boolean;
}

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
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      isDark: false,

      setTheme: (theme: Theme) => {
        applyTheme(theme);
        set({ theme, isDark: theme === "dark" });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme: Theme = currentTheme === "light" ? "dark" : "light";
        applyTheme(newTheme);
        set({ theme: newTheme, isDark: newTheme === "dark" });
      },
    }),
    {
      name: "theme-storage",
      // 仅持久化 theme 字段
      partialize: (state) => ({ theme: state.theme }),
      // 恢复时重新应用主题
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          state.isDark = state.theme === "dark";
        }
      },
    }
  )
);

/**
 * 初始化主题
 * 在应用启动时调用，确保主题正确应用到 DOM
 */
export const initTheme = () => {
  const state = useThemeStore.getState();
  applyTheme(state.theme);
};
