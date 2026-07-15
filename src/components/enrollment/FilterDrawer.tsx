/**
 * FilterDrawer - 报名筛选面板
 *
 * 从底部滑出的抽屉式筛选面板，动态展示筛选维度
 * 不同活动的报名数据自动生成不同的筛选选项
 *
 * 筛选逻辑：
 * - 同一维度内多选：OR（满足任一即可）
 * - 不同维度之间：AND（必须同时满足）
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { X, RotateCcw, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { FilterCriteria, FilterOptions } from "@/types/enrollment";
import { DEFAULT_FILTER_CRITERIA } from "@/types/enrollment";

// ========================================
// 类型定义
// ========================================

export interface FilterDrawerProps {
  /** 是否显示 */
  visible: boolean;
  /** 筛选选项（从数据中提取） */
  filterOptions: FilterOptions;
  /** 当前筛选条件 */
  filterCriteria: FilterCriteria;
  /** 筛选条件变更回调 */
  onChange: (criteria: FilterCriteria) => void;
  /** 关闭回调 */
  onClose: () => void;
}

// ========================================
// 子组件
// ========================================

/**
 * 筛选 Chip 组件
 */
const FilterChip: React.FC<{
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}> = ({ label, count, selected, onClick }) => (
  <button
    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
      selected
        ? "bg-primary-400 text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
    onClick={onClick}
  >
    <span>{label}</span>
    <span className={`text-xs ${selected ? "text-white/80" : "text-gray-400"}`}>
      {count}
    </span>
  </button>
);

/**
 * 可折叠的筛选维度组
 */
const FilterSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  itemCount?: number;
}> = ({ title, children, defaultExpanded = true, itemCount }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        className="flex items-center justify-between w-full py-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm font-medium text-gray-900">
          {title}
          {itemCount !== undefined && itemCount > 0 && (
            <span className="ml-1.5 text-xs text-primary-400 font-normal">
              ({itemCount}项已选)
            </span>
          )}
        </span>
        {expanded ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {expanded && <div className="pb-3 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
};

// ========================================
// 主组件
// ========================================

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  visible,
  filterOptions,
  filterCriteria,
  onChange,
  onClose,
}) => {
  // 使用本地临时状态，确认后才提交
  const [localCriteria, setLocalCriteria] =
    useState<FilterCriteria>(filterCriteria);

  // 外部 criteria 变化时同步
  useEffect(() => {
    setLocalCriteria(filterCriteria);
  }, [filterCriteria]);

  // 计算有数据的维度（只显示有选项的维度）
  const availableSections = useMemo(() => {
    const sections: Array<{
      key: string;
      title: string;
      type: "standard" | "custom";
    }> = [];

    if (filterOptions.gender.length > 0) {
      sections.push({ key: "gender", title: "性别", type: "standard" });
    }
    if (filterOptions.city.length > 0) {
      sections.push({ key: "city", title: "城市", type: "standard" });
    }
    if (filterOptions.industry.length > 0) {
      sections.push({ key: "industry", title: "行业", type: "standard" });
    }
    if (filterOptions.ageGroup.length > 0) {
      sections.push({ key: "ageGroup", title: "年龄段", type: "standard" });
    }
    if (filterOptions.tags.length > 0) {
      sections.push({ key: "tags", title: "标签", type: "standard" });
    }

    // 动态自定义字段
    Object.keys(filterOptions.customFields).forEach((fieldName) => {
      if (filterOptions.customFields[fieldName].length > 0) {
        sections.push({
          key: `custom_${fieldName}`,
          title: fieldName,
          type: "custom",
        });
      }
    });

    return sections;
  }, [filterOptions]);

  // 切换标准字段的选中状态
  const toggleStandardFilter = useCallback(
    (
      field: "gender" | "city" | "industry" | "ageGroup" | "tags",
      value: string,
    ) => {
      setLocalCriteria((prev) => {
        const currentValues = prev[field] as string[];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        return { ...prev, [field]: newValues };
      });
    },
    [],
  );

  // 切换自定义字段的选中状态
  const toggleCustomFilter = useCallback((fieldName: string, value: string) => {
    setLocalCriteria((prev) => {
      const currentValues = prev.customFields[fieldName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        customFields: {
          ...prev.customFields,
          [fieldName]: newValues,
        },
      };
    });
  }, []);

  // 重置筛选
  const handleReset = useCallback(() => {
    setLocalCriteria({
      ...DEFAULT_FILTER_CRITERIA,
      // 保留关键词搜索，因为那是搜索框控制的
      keyword: localCriteria.keyword,
    });
  }, [localCriteria.keyword]);

  // 确认筛选
  const handleConfirm = useCallback(() => {
    onChange(localCriteria);
    onClose();
  }, [localCriteria, onChange, onClose]);

  // 计算当前选中的筛选条件数量
  const activeCount = useMemo(() => {
    let count = 0;
    if (localCriteria.gender.length > 0) count++;
    if (localCriteria.city.length > 0) count++;
    if (localCriteria.industry.length > 0) count++;
    if (localCriteria.ageGroup.length > 0) count++;
    if (localCriteria.tags.length > 0) count++;
    Object.values(localCriteria.customFields).forEach((values) => {
      if (values.length > 0) count++;
    });
    return count;
  }, [localCriteria]);

  // 渲染标准维度的 Chips
  const renderStandardChips = (
    field: "gender" | "city" | "industry" | "ageGroup" | "tags",
  ) => {
    const options = filterOptions[field];
    const selectedValues = localCriteria[field] as string[];
    return options.map((opt) => (
      <FilterChip
        key={opt.value}
        label={opt.label}
        count={opt.count}
        selected={selectedValues.includes(opt.value)}
        onClick={() => toggleStandardFilter(field, opt.value)}
      />
    ));
  };

  // 渲染自定义字段的 Chips
  const renderCustomChips = (fieldName: string) => {
    const options = filterOptions.customFields[fieldName] || [];
    const selectedValues = localCriteria.customFields[fieldName] || [];
    return options.map((opt) => (
      <FilterChip
        key={opt.value}
        label={opt.label}
        count={opt.count}
        selected={selectedValues.includes(opt.value)}
        onClick={() => toggleCustomFilter(fieldName, opt.value)}
      />
    ));
  };

  // 获取某个维度的已选数量
  const getSelectedCount = (sectionKey: string): number => {
    if (sectionKey.startsWith("custom_")) {
      const fieldName = sectionKey.replace("custom_", "");
      return (localCriteria.customFields[fieldName] || []).length;
    }
    const field = sectionKey as keyof FilterCriteria;
    const val = localCriteria[field];
    return Array.isArray(val) ? val.length : 0;
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* 抽屉面板 */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-slide-up">
        {/* 拖拽指示条 */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            筛选条件
            {activeCount > 0 && (
              <span className="ml-2 text-xs font-normal text-primary-400">
                {activeCount} 个筛选项
              </span>
            )}
          </h3>
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            onClick={onClose}
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* 筛选内容 */}
        <div className="flex-1 overflow-y-auto px-4">
          {availableSections.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-sm">
                当前数据没有可用的筛选维度
              </p>
            </div>
          ) : (
            availableSections.map((section) => (
              <FilterSection
                key={section.key}
                title={section.title}
                itemCount={getSelectedCount(section.key)}
                defaultExpanded={availableSections.length <= 5}
              >
                {section.type === "standard"
                  ? renderStandardChips(
                      section.key as
                        | "gender"
                        | "city"
                        | "industry"
                        | "ageGroup"
                        | "tags",
                    )
                  : renderCustomChips(section.key.replace("custom_", ""))}
              </FilterSection>
            ))
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-white">
          <button
          className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-200 px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 [&>svg]:shrink-0"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            重置
          </button>
          <button
          className="flex flex-1 flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-primary-400 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500 [&>svg]:shrink-0"
            onClick={handleConfirm}
          >
            <Check size={14} />
            确认筛选
            {activeCount > 0 && (
          <span className="ml-1 whitespace-nowrap rounded-full bg-white/20 px-1.5 py-0.5 text-xs tabular-nums">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;
