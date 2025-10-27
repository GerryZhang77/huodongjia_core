/**
 * EnrollmentFilterDrawer 组件
 *
 * 报名筛选抽屉面板
 * 从底部弹出，集成所有筛选维度
 * 支持标准字段和自定义字段的动态渲染
 */

import React, { useState, useMemo } from "react";
import { Popup, Button, SearchBar } from "antd-mobile";
import type {
  FilterCriteria,
  FilterOptions,
  EnrollmentStatus,
  Gender,
} from "@/types/enrollment";
import { DEFAULT_FILTER_CRITERIA } from "@/types/enrollment";
import { FilterSection } from "./FilterSection";
import { getActiveFilterCount } from "@/utils/enrollmentFilters";

interface EnrollmentFilterDrawerProps {
  // 是否显示
  visible: boolean;

  // 关闭回调
  onClose: () => void;

  // 筛选选项
  filterOptions: FilterOptions;

  // 当前筛选条件
  criteria: FilterCriteria;

  // 筛选条件变化回调
  onCriteriaChange: (criteria: FilterCriteria) => void;

  // 筛选结果数量
  resultCount: number;

  // 总数量
  totalCount: number;
}

export const EnrollmentFilterDrawer: React.FC<EnrollmentFilterDrawerProps> = ({
  visible,
  onClose,
  filterOptions,
  criteria,
  onCriteriaChange,
  resultCount,
  totalCount,
}) => {
  // 临时筛选条件（未确认前）
  const [tempCriteria, setTempCriteria] = useState<FilterCriteria>(criteria);

  // 当外部条件变化时同步
  React.useEffect(() => {
    setTempCriteria(criteria);
  }, [criteria]);

  // 更新临时条件
  const updateTempCriteria = (updates: Partial<FilterCriteria>) => {
    setTempCriteria((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // 重置筛选
  const handleReset = () => {
    setTempCriteria(DEFAULT_FILTER_CRITERIA);
  };

  // 确认筛选
  const handleConfirm = () => {
    onCriteriaChange(tempCriteria);
    onClose();
  };

  // 取消筛选（恢复到原始条件）
  const handleCancel = () => {
    setTempCriteria(criteria);
    onClose();
  };

  // 活跃筛选数量
  const activeCount = useMemo(
    () => getActiveFilterCount(tempCriteria),
    [tempCriteria]
  );

  return (
    <Popup
      visible={visible}
      onMaskClick={handleCancel}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <div className="enrollment-filter-drawer">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">筛选条件</h3>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          <button
            className="text-sm text-primary-500 hover:text-primary-600"
            onClick={handleReset}
          >
            重置
          </button>
        </div>

        {/* 关键词搜索 */}
        <div className="p-4 border-b border-gray-200">
          <SearchBar
            placeholder="搜索姓名、邮箱、电话"
            value={tempCriteria.keyword || ""}
            onChange={(value) => updateTempCriteria({ keyword: value })}
            onClear={() => updateTempCriteria({ keyword: "" })}
          />
        </div>

        {/* 筛选区块列表 */}
        <div className="filter-sections">
          {/* 1. 状态筛选 */}
          {filterOptions.status.length > 0 && (
            <FilterSection
              title="报名状态"
              options={filterOptions.status}
              selectedValues={tempCriteria.status}
              onChange={(values) =>
                updateTempCriteria({ status: values as EnrollmentStatus[] })
              }
              multiple
              defaultExpanded={tempCriteria.status.length > 0}
            />
          )}

          {/* 2. 性别筛选 */}
          {filterOptions.gender.length > 0 && (
            <FilterSection
              title="性别"
              options={filterOptions.gender}
              selectedValues={tempCriteria.gender}
              onChange={(values) =>
                updateTempCriteria({ gender: values as Gender[] })
              }
              multiple
              defaultExpanded={tempCriteria.gender.length > 0}
            />
          )}

          {/* 3. 年龄段筛选 */}
          {filterOptions.ageGroup.length > 0 && (
            <FilterSection
              title="年龄段"
              options={filterOptions.ageGroup}
              selectedValues={tempCriteria.ageGroup}
              onChange={(values) => updateTempCriteria({ ageGroup: values })}
              multiple
              defaultExpanded={tempCriteria.ageGroup.length > 0}
            />
          )}

          {/* 4. 行业筛选 */}
          {filterOptions.industry.length > 0 && (
            <FilterSection
              title="行业"
              options={filterOptions.industry}
              selectedValues={tempCriteria.industry}
              onChange={(values) => updateTempCriteria({ industry: values })}
              multiple
              defaultExpanded={tempCriteria.industry.length > 0}
              maxDisplay={8}
            />
          )}

          {/* 5. 标签筛选 */}
          {filterOptions.tags.length > 0 && (
            <FilterSection
              title="标签"
              options={filterOptions.tags}
              selectedValues={tempCriteria.tags}
              onChange={(values) => updateTempCriteria({ tags: values })}
              multiple
              defaultExpanded={tempCriteria.tags.length > 0}
              maxDisplay={10}
            />
          )}

          {/* 6. 城市筛选 */}
          {filterOptions.city.length > 0 && (
            <FilterSection
              title="城市"
              options={filterOptions.city}
              selectedValues={tempCriteria.city}
              onChange={(values) => updateTempCriteria({ city: values })}
              multiple
              defaultExpanded={tempCriteria.city.length > 0}
              maxDisplay={8}
            />
          )}

          {/* 7. 自定义字段筛选（动态渲染） */}
          {Object.entries(filterOptions.customFields).map(
            ([fieldName, options]) => {
              if (options.length === 0) return null;

              return (
                <FilterSection
                  key={fieldName}
                  title={fieldName}
                  options={options}
                  selectedValues={tempCriteria.customFields[fieldName] || []}
                  onChange={(values) => {
                    const newCustomFields = {
                      ...tempCriteria.customFields,
                      [fieldName]: values,
                    };
                    // 清理空数组
                    if (values.length === 0) {
                      delete newCustomFields[fieldName];
                    }
                    updateTempCriteria({ customFields: newCustomFields });
                  }}
                  multiple
                  defaultExpanded={
                    (tempCriteria.customFields[fieldName] || []).length > 0
                  }
                  maxDisplay={8}
                />
              );
            }
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          <Button
            block
            fill="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            block
            color="primary"
            onClick={handleConfirm}
            className="flex-1"
          >
            确定 ({resultCount}/{totalCount})
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default EnrollmentFilterDrawer;
