/**
 * UserPoolFilterDrawer - 用户池筛选面板
 *
 * 底部抽屉式筛选面板，支持多维度筛选：
 * - 性别、年龄段、行业、城市
 * - 活跃度、参与次数
 * - 自定义标签、自动标签
 *
 * 逻辑：同一维度 OR，不同维度 AND
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { X, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import type {
  UserPoolFilterCriteria,
  UserPoolFilterOptions,
} from "@/features/merchant/user-pool/types";
import { DEFAULT_USER_POOL_FILTER } from "@/features/merchant/user-pool/types";

// ========================================
// Props 类型定义
// ========================================

export interface UserPoolFilterDrawerProps {
  /** 是否显示 */
  visible: boolean;
  /** 筛选选项（从数据中提取） */
  filterOptions: UserPoolFilterOptions;
  /** 当前筛选条件 */
  filterCriteria: UserPoolFilterCriteria;
  /** 筛选条件变更回调 */
  onChange: (criteria: UserPoolFilterCriteria) => void;
  /** 关闭回调 */
  onClose: () => void;
}

// ========================================
// 子组件
// ========================================

const FilterChip: React.FC<{
  label: string;
  count?: number;
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
    {count !== undefined && (
      <span
        className={`text-xs ${selected ? "text-white/80" : "text-gray-400"}`}
      >
        {count}
      </span>
    )}
  </button>
);

const FilterSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  selectedCount?: number;
}> = ({ title, children, defaultExpanded = true, selectedCount }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        className="flex items-center justify-between w-full py-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm font-medium text-gray-900">
          {title}
          {selectedCount !== undefined && selectedCount > 0 && (
            <span className="ml-1.5 text-xs text-primary-400 font-normal">
              ({selectedCount}项已选)
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

const UserPoolFilterDrawer: React.FC<UserPoolFilterDrawerProps> = ({
  visible,
  filterOptions,
  filterCriteria,
  onChange,
  onClose,
}) => {
  // 本地状态（确认后才提交）
  const [localCriteria, setLocalCriteria] =
    useState<UserPoolFilterCriteria>(filterCriteria);

  // 同步外部变化
  useEffect(() => {
    if (visible) {
      setLocalCriteria(filterCriteria);
    }
  }, [visible, filterCriteria]);

  // 切换数组型筛选项
  const toggleArrayFilter = useCallback(
    (key: keyof UserPoolFilterCriteria, value: string) => {
      setLocalCriteria((prev) => {
        const arr = (prev[key] as string[]) || [];
        const next = arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value];
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  // 重置全部
  const handleReset = useCallback(() => {
    setLocalCriteria({ ...DEFAULT_USER_POOL_FILTER });
  }, []);

  // 确认
  const handleConfirm = useCallback(() => {
    onChange(localCriteria);
    onClose();
  }, [localCriteria, onChange, onClose]);

  // 计算总筛选数
  const totalActiveFilters = useMemo(() => {
    let count = 0;
    if (localCriteria.gender.length > 0) count += localCriteria.gender.length;
    if (localCriteria.ageGroup.length > 0)
      count += localCriteria.ageGroup.length;
    if (localCriteria.industry.length > 0)
      count += localCriteria.industry.length;
    if (localCriteria.city.length > 0) count += localCriteria.city.length;
    if (localCriteria.activityLevel.length > 0)
      count += localCriteria.activityLevel.length;
    if (localCriteria.customTags.length > 0)
      count += localCriteria.customTags.length;
    if (localCriteria.autoTags.length > 0)
      count += localCriteria.autoTags.length;
    return count;
  }, [localCriteria]);

  if (!visible) return null;

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
          className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap text-sm text-gray-500 hover:text-gray-700 [&>svg]:shrink-0"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            重置
          </button>
          <span className="text-base font-semibold text-gray-900">
            筛选用户
            {totalActiveFilters > 0 && (
              <span className="ml-1 text-xs text-primary-400 font-normal">
                ({totalActiveFilters})
              </span>
            )}
          </span>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto px-4">
          {/* 活跃度 */}
          {filterOptions.activityLevel.length > 0 && (
            <FilterSection
              title="活跃度"
              selectedCount={localCriteria.activityLevel.length}
            >
              {filterOptions.activityLevel.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  count={opt.count}
                  selected={localCriteria.activityLevel.includes(opt.value)}
                  onClick={() => toggleArrayFilter("activityLevel", opt.value)}
                />
              ))}
            </FilterSection>
          )}

          {/* 自定义标签 */}
          {filterOptions.customTags.length > 0 && (
            <FilterSection
              title="自定义标签"
              selectedCount={localCriteria.customTags.length}
            >
              {filterOptions.customTags.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  count={opt.count}
                  selected={localCriteria.customTags.includes(opt.value)}
                  onClick={() => toggleArrayFilter("customTags", opt.value)}
                />
              ))}
            </FilterSection>
          )}

          {/* 性别 */}
          {filterOptions.gender.length > 0 && (
            <FilterSection
              title="性别"
              selectedCount={localCriteria.gender.length}
            >
              {filterOptions.gender.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  count={opt.count}
                  selected={localCriteria.gender.includes(opt.value)}
                  onClick={() => toggleArrayFilter("gender", opt.value)}
                />
              ))}
            </FilterSection>
          )}

          {/* 年龄段 */}
          {filterOptions.ageGroup.length > 0 && (
            <FilterSection
              title="年龄段"
              selectedCount={localCriteria.ageGroup.length}
              defaultExpanded={false}
            >
              {filterOptions.ageGroup.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  count={opt.count}
                  selected={localCriteria.ageGroup.includes(opt.value)}
                  onClick={() => toggleArrayFilter("ageGroup", opt.value)}
                />
              ))}
            </FilterSection>
          )}

          {/* 行业 */}
          {filterOptions.industry.length > 0 && (
            <FilterSection
              title="行业"
              selectedCount={localCriteria.industry.length}
              defaultExpanded={false}
            >
              {filterOptions.industry.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  count={opt.count}
                  selected={localCriteria.industry.includes(opt.value)}
                  onClick={() => toggleArrayFilter("industry", opt.value)}
                />
              ))}
            </FilterSection>
          )}

          {/* 城市 */}
          {filterOptions.city.length > 0 && (
            <FilterSection
              title="城市"
              selectedCount={localCriteria.city.length}
              defaultExpanded={false}
            >
              {filterOptions.city.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  count={opt.count}
                  selected={localCriteria.city.includes(opt.value)}
                  onClick={() => toggleArrayFilter("city", opt.value)}
                />
              ))}
            </FilterSection>
          )}

          {/* 自动标签 */}
          {filterOptions.autoTags.length > 0 && (
            <FilterSection
              title="兴趣/技能标签"
              selectedCount={localCriteria.autoTags.length}
              defaultExpanded={false}
            >
              {filterOptions.autoTags.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  count={opt.count}
                  selected={localCriteria.autoTags.includes(opt.value)}
                  onClick={() => toggleArrayFilter("autoTags", opt.value)}
                />
              ))}
            </FilterSection>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="px-4 py-3 border-t border-gray-100 flex gap-3 safe-area-bottom">
          <button
            className="flex-1 py-2.5 rounded-[22px] border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="flex-1 py-2.5 rounded-[22px] bg-gradient-to-br from-primary-400 to-primary-500 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"
            onClick={handleConfirm}
          >
            确认筛选
            {totalActiveFilters > 0 && ` (${totalActiveFilters})`}
          </button>
        </div>
      </div>
    </>
  );
};

export default UserPoolFilterDrawer;
