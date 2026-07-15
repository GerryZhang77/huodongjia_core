/**
 * DiscoveryFilterBar - 发现用户筛选/排序工具栏
 *
 * 轻量化筛选，以水平滚动 Chip 形式展示：
 * - 排序方式切换
 * - 城市/行业/兴趣快速筛选
 * - 仅看收藏
 * - 匹配度过滤
 */

import React, { useState, useCallback } from "react";
import { Popup } from "antd-mobile";
import {
  SlidersHorizontal,
  Heart,
  X,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import type {
  DiscoveryFilterCriteria,
  DiscoveryFilterOptions,
  DiscoverySortBy,
} from "@/features/merchant/user-pool/types";
import { DISCOVERY_SORT_LABELS } from "@/features/merchant/user-pool/types";

// ========================================
// 类型定义
// ========================================

export interface DiscoveryFilterBarProps {
  criteria: DiscoveryFilterCriteria;
  options: DiscoveryFilterOptions;
  onChange: (criteria: DiscoveryFilterCriteria) => void;
}

// ========================================
// 辅助：筛选项 Chip
// ========================================

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onClick }) => (
  <button
    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
      active
        ? "bg-primary-400 text-white"
        : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

// ========================================
// 辅助：展开筛选面板中的多选组
// ========================================

interface FilterGroupProps {
  title: string;
  options: Array<{ value: string; label: string; count: number }>;
  selected: string[];
  onToggle: (value: string) => void;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  options,
  selected,
  onToggle,
}) => {
  if (options.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="text-xs font-medium text-gray-500 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              selected.includes(opt.value)
                ? "bg-primary-400 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => onToggle(opt.value)}
          >
            {opt.label}
            <span className="ml-1 opacity-60">{opt.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ========================================
// 主组件
// ========================================

const DiscoveryFilterBar: React.FC<DiscoveryFilterBarProps> = ({
  criteria,
  options,
  onChange,
}) => {
  const [panelVisible, setPanelVisible] = useState(false);

  // 排序
  const handleSortChange = useCallback(
    (sortBy: DiscoverySortBy) => {
      onChange({ ...criteria, sortBy });
    },
    [criteria, onChange],
  );

  // 收藏切换
  const handleToggleFavorite = useCallback(() => {
    onChange({ ...criteria, favoritedOnly: !criteria.favoritedOnly });
  }, [criteria, onChange]);

  // 多选切换
  const toggleArrayFilter = useCallback(
    (field: keyof DiscoveryFilterCriteria, value: string) => {
      const current = criteria[field] as string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onChange({ ...criteria, [field]: next });
    },
    [criteria, onChange],
  );

  // 重置
  const handleReset = useCallback(() => {
    onChange({
      ...criteria,
      city: [],
      industry: [],
      ageGroup: [],
      interests: [],
      activityPreferences: [],
      minMatchScore: 0,
      favoritedOnly: false,
    });
  }, [criteria, onChange]);

  // 活跃筛选数
  const activeCount =
    criteria.city.length +
    criteria.industry.length +
    criteria.ageGroup.length +
    criteria.interests.length +
    criteria.activityPreferences.length +
    (criteria.minMatchScore > 0 ? 1 : 0) +
    (criteria.favoritedOnly ? 1 : 0);

  return (
    <>
      {/* 横向滚动工具栏 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {/* 排序下拉 */}
        <div className="flex-shrink-0 relative">
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors"
            onClick={() => {
              // 循环切换排序
              const keys: DiscoverySortBy[] = [
                "matchScore",
                "lastActive",
                "participationCount",
              ];
              const idx = keys.indexOf(criteria.sortBy);
              handleSortChange(keys[(idx + 1) % keys.length]);
            }}
          >
            <ChevronDown size={12} />
            {DISCOVERY_SORT_LABELS[criteria.sortBy]}
          </button>
        </div>

        {/* 收藏筛选 */}
        <FilterChip
          label="已收藏"
          active={criteria.favoritedOnly}
          onClick={handleToggleFavorite}
        />

        {/* 快速城市筛选（前3个热门城市） */}
        {options.city.slice(0, 3).map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={criteria.city.includes(opt.value)}
            onClick={() => toggleArrayFilter("city", opt.value)}
          />
        ))}

        {/* 快速行业筛选（前3个热门行业） */}
        {options.industry.slice(0, 3).map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={criteria.industry.includes(opt.value)}
            onClick={() => toggleArrayFilter("industry", opt.value)}
          />
        ))}

        {/* 更多筛选按钮 */}
        <button
          className={`flex flex-shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors [&>svg]:shrink-0 ${
            activeCount > 0
              ? "bg-primary-50 text-primary-600 border border-primary-200"
              : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
          onClick={() => setPanelVisible(true)}
        >
          <SlidersHorizontal size={12} />
          更多
          {activeCount > 0 && (
            <span className="flex h-[16px] min-w-[16px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary-400 text-[10px] font-bold tabular-nums text-white">
              {activeCount}
            </span>
          )}
        </button>

        {/* 清除 */}
        {activeCount > 0 && (
          <button
            className="flex flex-shrink-0 flex-nowrap items-center gap-0.5 whitespace-nowrap px-2 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600 [&>svg]:shrink-0"
            onClick={handleReset}
          >
            <X size={12} />
            清除
          </button>
        )}
      </div>

      {/* 展开筛选面板 (底部弹出) */}
      <Popup
        visible={panelVisible}
        onMaskClick={() => setPanelVisible(false)}
        position="bottom"
        bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {/* 头部 */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">筛选条件</h3>
            <div className="flex items-center gap-3">
              <button
            className="flex flex-nowrap items-center gap-1 whitespace-nowrap text-xs text-gray-400 hover:text-gray-600 [&>svg]:shrink-0"
                onClick={handleReset}
              >
                <RotateCcw size={12} />
                重置
              </button>
              <button onClick={() => setPanelVisible(false)}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* 筛选组 */}
          <div className="px-4 py-4">
            {/* 匹配度门槛 */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                最低匹配度
              </h4>
              <div className="flex items-center gap-2">
                {[0, 50, 70, 85].map((val) => (
                  <button
                    key={val}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      criteria.minMatchScore === val
                        ? "bg-primary-400 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() =>
                      onChange({ ...criteria, minMatchScore: val })
                    }
                  >
                    {val === 0 ? "不限" : `${val}+`}
                  </button>
                ))}
              </div>
            </div>

            <FilterGroup
              title="城市"
              options={options.city}
              selected={criteria.city}
              onToggle={(v) => toggleArrayFilter("city", v)}
            />

            <FilterGroup
              title="行业"
              options={options.industry}
              selected={criteria.industry}
              onToggle={(v) => toggleArrayFilter("industry", v)}
            />

            <FilterGroup
              title="年龄段"
              options={options.ageGroup}
              selected={criteria.ageGroup}
              onToggle={(v) => toggleArrayFilter("ageGroup", v)}
            />

            <FilterGroup
              title="兴趣标签"
              options={options.interests}
              selected={criteria.interests}
              onToggle={(v) => toggleArrayFilter("interests", v)}
            />

            <FilterGroup
              title="活动偏好"
              options={options.activityPreferences}
              selected={criteria.activityPreferences}
              onToggle={(v) => toggleArrayFilter("activityPreferences", v)}
            />

            {/* 收藏 */}
            <div className="mb-4">
              <button
            className={`flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors [&>svg]:shrink-0 ${
                  criteria.favoritedOnly
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-gray-50 text-gray-600 border border-gray-200"
                }`}
                onClick={handleToggleFavorite}
              >
                <Heart
                  size={14}
                  className={criteria.favoritedOnly ? "fill-red-500" : ""}
                />
                仅看已收藏
              </button>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3">
            <button
              className="w-full py-2.5 bg-gradient-to-br from-primary-400 to-primary-500 text-white text-sm font-medium rounded-[22px] shadow-sm"
              onClick={() => setPanelVisible(false)}
            >
              确定
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default DiscoveryFilterBar;
