/**
 * ActivityFilterDrawer - 活动筛选抽屉组件
 *
 * 提供活动列表的高级筛选功能，包括：
 * - 活动类型筛选（多选）
 * - 时间范围选择
 * - 价格范围选择
 * - 标签筛选（多选）
 *
 * @example
 * ```tsx
 * <ActivityFilterDrawer
 *   open={showFilter}
 *   onClose={() => setShowFilter(false)}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 * />
 * ```
 */

import { FC } from "react";
import { Drawer } from "@/components/ui";
import { Button } from "@/components/ui";
import { clsx } from "clsx";
import { RotateCcw } from "lucide-react";
import type { ActivityFilterDrawerProps, ActivityFilters } from "./types";
import {
  defaultFilters,
  categoryOptions,
  timeRangeOptions,
  priceRangeOptions,
  tagOptions,
} from "./types";

export const ActivityFilterDrawer: FC<ActivityFilterDrawerProps> = ({
  open,
  onClose,
  filters,
  onFiltersChange,
  onReset,
  onConfirm,
}) => {
  // 更新筛选条件
  const updateFilters = (updates: Partial<ActivityFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  // 切换类型选择
  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  // 切换标签选择
  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  // 重置筛选
  const handleReset = () => {
    onFiltersChange(defaultFilters);
    onReset?.();
  };

  // 确认筛选
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  // 计算已选择的筛选数量
  const getFilterCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.timeRange !== "all") count += 1;
    if (filters.priceRange !== "all") count += 1;
    if (filters.tags.length > 0) count += filters.tags.length;
    return count;
  };

  const filterCount = getFilterCount();

  // 渲染选项按钮
  const renderOptionButton = (
    label: string,
    isSelected: boolean,
    onClick: () => void
  ) => (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
        isSelected
          ? "bg-primary-500 text-white shadow-sm"
          : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
      )}
    >
      {label}
    </button>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>筛选</span>
          {filterCount > 0 && (
          <span className="whitespace-nowrap rounded-full bg-primary-500 px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
              {filterCount}
            </span>
          )}
        </div>
      }
      placement="bottom"
      size="large"
      footer={
        <div className="flex gap-3 p-4">
          <Button
            variant="outline"
            size="large"
            className="flex-1"
            onClick={handleReset}
            icon={<RotateCcw size={16} />}
          >
            重置
          </Button>
          <Button
            variant="primary"
            size="large"
            className="flex-1"
            onClick={handleConfirm}
          >
            确定 {filterCount > 0 && `(${filterCount})`}
          </Button>
        </div>
      }
    >
      <div className="px-4 py-2 space-y-6 overflow-y-auto max-h-[60vh]">
        {/* 活动类型 */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            活动类型
          </h4>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((option) =>
              renderOptionButton(
                option.label,
                filters.categories.includes(option.value),
                () => toggleCategory(option.value)
              )
            )}
          </div>
        </section>

        {/* 时间范围 */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            时间范围
          </h4>
          <div className="flex flex-wrap gap-2">
            {timeRangeOptions.map((option) =>
              renderOptionButton(
                option.label,
                filters.timeRange === option.value,
                () =>
                  updateFilters({
                    timeRange: option.value as ActivityFilters["timeRange"],
                  })
              )
            )}
          </div>
        </section>

        {/* 价格范围 */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            价格范围
          </h4>
          <div className="flex flex-wrap gap-2">
            {priceRangeOptions.map((option) =>
              renderOptionButton(
                option.label,
                filters.priceRange === option.value,
                () =>
                  updateFilters({
                    priceRange: option.value as ActivityFilters["priceRange"],
                  })
              )
            )}
          </div>
        </section>

        {/* 热门标签 */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            热门标签
          </h4>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((tag) =>
              renderOptionButton(tag, filters.tags.includes(tag), () =>
                toggleTag(tag)
              )
            )}
          </div>
        </section>
      </div>
    </Drawer>
  );
};

export default ActivityFilterDrawer;
