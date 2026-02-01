/**
 * MatchingProgressOverlay - 匹配进度遮罩组件
 * 显示匹配进度，支持最小化到后台执行
 */

import React from "react";
import { Loader2, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui";

export interface MatchingProgressOverlayProps {
  visible: boolean;
  progress: number; // 0-100
  message?: string;
  onMinimize: () => void;
  onCancel?: () => void;
  canCancel?: boolean;
}

/**
 * 匹配进度遮罩
 * 全屏显示匹配进度，支持最小化到后台
 */
export const MatchingProgressOverlay: React.FC<
  MatchingProgressOverlayProps
> = ({
  visible,
  progress,
  message = "正在匹配中...",
  onMinimize,
  onCancel,
  canCancel = false,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6 shadow-xl max-w-sm mx-4 w-full">
        {/* 进度动画 */}
        <div className="relative w-24 h-24">
          {/* 背景圆环 */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
            />
            {/* 进度圆环 */}
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient
                id="progressGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
          </svg>
          {/* 中心进度数字 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* 进度信息 */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            智能匹配中
          </h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>

        {/* 线性进度条 */}
        <div className="w-full">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            size="large"
            onClick={onMinimize}
            className="flex-1"
          >
            <span className="flex items-center gap-2">
              <Minimize2 size={18} />
              后台执行
            </span>
          </Button>
          {canCancel && onCancel && (
            <Button
              variant="ghost"
              size="large"
              onClick={onCancel}
              className="flex-1 text-gray-500"
            >
              <span className="flex items-center gap-2">
                <X size={18} />
                取消
              </span>
            </Button>
          )}
        </div>

        {/* 提示 */}
        <p className="text-xs text-gray-400 text-center">
          匹配过程可能需要几分钟，点击"后台执行"可继续其他操作
        </p>
      </div>
    </div>
  );
};

/**
 * MatchingProgressBanner - 匹配进度横幅组件
 * 最小化后在页面顶部显示的进度条
 */
export interface MatchingProgressBannerProps {
  visible: boolean;
  progress: number;
  message?: string;
  onExpand: () => void;
}

export const MatchingProgressBanner: React.FC<MatchingProgressBannerProps> = ({
  visible,
  progress,
  message = "匹配中...",
  onExpand,
}) => {
  if (!visible) return null;

  return (
    <div
      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 flex items-center justify-between cursor-pointer hover:from-primary-600 hover:to-primary-700 transition-all"
      onClick={onExpand}
    >
      <div className="flex items-center gap-3">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-32 h-1.5 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-semibold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default MatchingProgressOverlay;
