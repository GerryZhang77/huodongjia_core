/**
 * 主题选择器组件
 * 支持浅色、深色、跟随系统三种模式
 */

import React from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useThemeStore, ThemeMode } from "@/store/themeStore";

interface ThemeOption {
  mode: ThemeMode;
  icon: React.ElementType;
  label: string;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    mode: "light",
    icon: Sun,
    label: "浅色",
    description: "始终使用浅色主题",
  },
  {
    mode: "dark",
    icon: Moon,
    label: "深色",
    description: "始终使用深色主题",
  },
  {
    mode: "system",
    icon: Monitor,
    label: "跟随系统",
    description: "自动匹配系统主题设置",
  },
];

interface ThemeSelectorProps {
  /** 样式变体：卡片或简洁 */
  variant?: "card" | "compact";
  /** 自定义类名 */
  className?: string;
}

/**
 * 主题选择器
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  variant = "card",
  className = "",
}) => {
  const { mode, setMode } = useThemeStore();

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = mode === option.mode;

          return (
            <button
              key={option.mode}
              onClick={() => setMode(option.mode)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full 
                transition-all duration-200
                ${
                  isActive
                    ? "bg-primary-400 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }
              `}
              title={option.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const isActive = mode === option.mode;

        return (
          <button
            key={option.mode}
            onClick={() => setMode(option.mode)}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl
              transition-all duration-200 border
              ${
                isActive
                  ? "bg-primary-50 dark:bg-primary-900/30 border-primary-400 dark:border-primary-500"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }
            `}
          >
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${
                  isActive
                    ? "bg-primary-400 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }
              `}
            >
              <Icon size={20} />
            </div>

            <div className="flex-1 text-left">
              <p
                className={`text-sm font-medium ${
                  isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {option.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {option.description}
              </p>
            </div>

            {isActive && (
              <div className="w-5 h-5 rounded-full bg-primary-400 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;
