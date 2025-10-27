/**
 * FilterSection 组件
 *
 * 可折叠的筛选区块组件
 * 支持单选和多选模式
 */

import React, { useState } from "react";
import { Collapse, Tag } from "antd-mobile";
import { DownOutline } from "antd-mobile-icons";
import "./FilterSection.module.css";

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterSectionProps {
  // 区块标题
  title: string;

  // 筛选选项列表
  options: FilterOption[];

  // 当前选中的值
  selectedValues: string[];

  // 值变化回调
  onChange: (values: string[]) => void;

  // 是否多选（默认 true）
  multiple?: boolean;

  // 是否默认展开（默认 false）
  defaultExpanded?: boolean;

  // 是否显示计数（默认 true）
  showCount?: boolean;

  // 最大显示数量（默认全部显示）
  maxDisplay?: number;

  // 自定义类名
  className?: string;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  multiple = true,
  defaultExpanded = false,
  showCount = true,
  maxDisplay,
  className = "",
}) => {
  const [showAll, setShowAll] = useState(false);

  // 处理选项点击
  const handleOptionClick = (value: string) => {
    if (multiple) {
      // 多选模式
      if (selectedValues.includes(value)) {
        // 取消选中
        onChange(selectedValues.filter((v) => v !== value));
      } else {
        // 选中
        onChange([...selectedValues, value]);
      }
    } else {
      // 单选模式
      if (selectedValues.includes(value)) {
        // 取消选中
        onChange([]);
      } else {
        // 选中（替换）
        onChange([value]);
      }
    }
  };

  // 清空选择
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // 确定显示的选项
  const displayOptions =
    maxDisplay && !showAll ? options.slice(0, maxDisplay) : options;

  const hasMore = maxDisplay && options.length > maxDisplay;
  const selectedCount = selectedValues.length;

  if (options.length === 0) {
    return null;
  }

  return (
    <div className={`filter-section ${className}`}>
      <Collapse defaultActiveKey={defaultExpanded ? ["content"] : []}>
        <Collapse.Panel
          key="content"
          title={
            <div className="flex items-center justify-between w-full">
              <span className="text-base font-medium text-gray-900">
                {title}
              </span>
              {selectedCount > 0 && (
                <span className="text-sm text-primary-500 mr-2">
                  已选 {selectedCount} 项
                </span>
              )}
            </div>
          }
          arrow={<DownOutline />}
        >
          <div className="filter-section-content">
            {/* 选项列表 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {displayOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);

                return (
                  <Tag
                    key={option.value}
                    color={isSelected ? "primary" : "default"}
                    fill={isSelected ? "solid" : "outline"}
                    onClick={() => handleOptionClick(option.value)}
                    className="cursor-pointer transition-all"
                  >
                    <span className="flex items-center gap-1">
                      <span>{option.label}</span>
                      {showCount && (
                        <span className="text-xs opacity-70">
                          ({option.count})
                        </span>
                      )}
                    </span>
                  </Tag>
                );
              })}
            </div>

            {/* 展开/收起按钮 */}
            {hasMore && (
              <button
                className="text-sm text-primary-500 hover:text-primary-600"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "收起" : `展开全部 (${options.length})`}
              </button>
            )}

            {/* 清空按钮 */}
            {selectedCount > 0 && (
              <button
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                onClick={handleClear}
              >
                清空选择
              </button>
            )}
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default FilterSection;
