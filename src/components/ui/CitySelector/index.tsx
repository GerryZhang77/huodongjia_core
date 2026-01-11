/**
 * CitySelector - 城市选择器组件
 *
 * 基于 antd-mobile 的 IndexBar 实现，支持：
 * - 热门城市快速选择
 * - 按首字母分组的城市列表
 * - 搜索功能
 * - 与项目设计系统一致的样式
 *
 * @example
 * ```tsx
 * <CitySelector
 *   open={showCitySelector}
 *   onClose={() => setShowCitySelector(false)}
 *   value={selectedCity}
 *   onChange={(city) => setSelectedCity(city)}
 * />
 * ```
 */

import { FC, useState, useRef, useEffect } from "react";
import { Popup, IndexBar } from "antd-mobile";
import { clsx } from "clsx";
import { X, Search, MapPin, Flame } from "lucide-react";
import type { CitySelectorProps } from "./types";
import { hotCities, cityGroups, searchCities } from "./cityData";

export const CitySelector: FC<CitySelectorProps> = ({
  open,
  onClose,
  value = "全国",
  onChange,
  title = "选择城市",
  showHot = true,
  className,
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<
    { label: string; value: string }[]
  >([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 搜索处理
  useEffect(() => {
    if (searchText.trim()) {
      const results = searchCities(searchText);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchText]);

  // 打开时清空搜索
  useEffect(() => {
    if (open) {
      setSearchText("");
      setSearchResults([]);
    }
  }, [open]);

  // 选择城市
  const handleSelect = (city: string) => {
    onChange?.(city);
    onClose();
  };

  // 渲染城市按钮
  const renderCityButton = (
    city: { label: string; value: string },
    isSelected: boolean
  ) => (
    <button
      key={city.value}
      onClick={() => handleSelect(city.value)}
      className={clsx(
        "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
        isSelected
          ? "bg-primary-500 text-white shadow-sm"
          : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600 active:bg-slate-300 dark:active:bg-gray-500"
      )}
    >
      {city.label}
    </button>
  );

  return (
    <Popup
      visible={open}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        height: "80vh",
        maxHeight: "680px",
      }}
      className={clsx("city-selector-popup", className)}
    >
      <div className="flex flex-col h-full bg-white dark:bg-gray-800">
        {/* 头部 */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="关闭"
            >
              <X size={20} className="text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <div className="flex items-center h-10 bg-slate-100 dark:bg-gray-700 rounded-full px-4 gap-2">
              <Search
                size={18}
                className="text-slate-400 dark:text-gray-500 flex-shrink-0"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="搜索城市"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-gray-600"
                >
                  <X size={14} className="text-slate-400 dark:text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          {/* 搜索结果 */}
          {searchText.trim() ? (
            <div className="h-full overflow-y-auto px-4 py-3">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((city) => (
                    <button
                      key={city.value}
                      onClick={() => handleSelect(city.value)}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                        value === city.value
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                          : "hover:bg-slate-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <MapPin
                        size={16}
                        className={
                          value === city.value
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-slate-400 dark:text-gray-500"
                        }
                      />
                      <span className="text-sm font-medium">{city.label}</span>
                      {value === city.value && (
                        <span className="ml-auto text-xs text-primary-500 dark:text-primary-400">
                          当前
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-gray-500">
                  <Search size={40} className="mb-3 opacity-50" />
                  <p className="text-sm">未找到相关城市</p>
                </div>
              )}
            </div>
          ) : (
            /* 城市列表 */
            <div className="h-full overflow-hidden">
              <IndexBar className="city-index-bar h-full" sticky={false}>
                {/* 热门城市 */}
                {showHot && (
                  <IndexBar.Panel index="热门" title="" key="hot">
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Flame size={14} className="text-secondary-500" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          热门城市
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {hotCities.map((city) =>
                          renderCityButton(city, value === city.value)
                        )}
                      </div>
                    </div>
                  </IndexBar.Panel>
                )}

                {/* 按首字母分组的城市 */}
                {cityGroups.map((group) => (
                  <IndexBar.Panel
                    index={group.title}
                    title={
                      <div className="px-4 py-2 bg-slate-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 sticky top-0">
                        {group.title}
                      </div>
                    }
                    key={group.title}
                  >
                    <div className="px-4 py-2">
                      <div className="grid grid-cols-4 gap-2">
                        {group.items.map((city) =>
                          renderCityButton(city, value === city.value)
                        )}
                      </div>
                    </div>
                  </IndexBar.Panel>
                ))}
              </IndexBar>
            </div>
          )}
        </div>

        {/* 底部安全区域 */}
        <div className="h-safe-area-bottom" />
      </div>

      {/* 自定义样式 */}
      <style>{`
        .city-selector-popup .adm-popup-body {
          background: white;
        }
        .dark .city-selector-popup .adm-popup-body {
          background: #1f2937;
        }
        .city-index-bar .adm-index-bar-sidebar {
          right: 4px;
          padding: 4px 2px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border-radius: 12px;
        }
        .dark .city-index-bar .adm-index-bar-sidebar {
          background: rgba(31, 41, 55, 0.9);
        }
        .city-index-bar .adm-index-bar-sidebar-item {
          padding: 2px 6px;
          font-size: 10px;
          color: #64748b;
        }
        .dark .city-index-bar .adm-index-bar-sidebar-item {
          color: #9ca3af;
        }
        .city-index-bar .adm-index-bar-sidebar-item-active {
          color: #3b82f6;
          font-weight: 600;
        }
        .city-index-bar .adm-index-bar-anchor {
          padding: 0;
        }
        .city-index-bar .adm-index-bar-anchor-title {
          padding: 0;
          background: transparent;
        }
      `}</style>
    </Popup>
  );
};

export default CitySelector;
