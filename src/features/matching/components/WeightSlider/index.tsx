/**
 * WeightSlider - 权重滑块组件
 * 用于匹配规则权重调整的可复用滑块组件
 */

import React from "react";

export interface WeightSliderProps {
  /** 当前权重值 (0-100) */
  value: number;
  /** 权重变化回调 */
  onChange: (value: number) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 是否显示刻度 */
  showTicks?: boolean;
  /** 自定义刻度值 */
  ticks?: number[];
  /** 标签文本 */
  label?: string;
  /** 是否显示当前值 */
  showValue?: boolean;
}

/**
 * 权重滑块组件
 */
export const WeightSlider: React.FC<WeightSliderProps> = ({
  value,
  onChange,
  disabled = false,
  min = 0,
  max = 100,
  step = 5,
  showTicks = true,
  ticks,
  label,
  showValue = true,
}) => {
  // 计算进度百分比（考虑 min/max 范围）
  const progressPercent = ((value - min) / (max - min)) * 100;

  // 默认刻度
  const defaultTicks = [
    min,
    (min + max) / 4,
    (min + max) / 2,
    ((min + max) * 3) / 4,
    max,
  ];
  const displayTicks = ticks || defaultTicks;

  return (
    <div className="w-full">
      {/* 标签和数值 */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showValue && (
            <span className="text-lg font-bold text-primary-500">{value}%</span>
          )}
        </div>
      )}

      {/* 滑块 */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-primary-400
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-primary-400
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:transition-transform
          [&::-moz-range-thumb]:hover:scale-110
          disabled:opacity-50 disabled:cursor-not-allowed
          disabled:[&::-webkit-slider-thumb]:cursor-not-allowed
          disabled:[&::-moz-range-thumb]:cursor-not-allowed"
        style={{
          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progressPercent}%, #E5E7EB ${progressPercent}%, #E5E7EB 100%)`,
        }}
      />

      {/* 刻度 */}
      {showTicks && (
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          {displayTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeightSlider;
