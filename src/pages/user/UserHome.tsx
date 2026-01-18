/**
 * 用户端首页 - 活动广场
 * 展示热门活动轮播和活动列表，支持搜索、筛选和视图切换
 */

import { FC, useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  Flame,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import {
  HotActivityCarousel,
  ActivityCard,
  ActivityListItem,
} from "@/components/business";
import { ActivityFilterDrawer } from "@/components/business/ActivityFilterDrawer";
import { CitySelector } from "@/components/ui/CitySelector";
import { Tag } from "@/components/ui";
import { useUserActivities, useRecommendedActivities } from "@/features/user";
import dayjs from "dayjs";
import {
  type ActivityFilters,
  defaultFilters,
  timeRangeOptions,
  priceRangeOptions,
} from "@/components/business/ActivityFilterDrawer/types";

// ============ 类型定义 ============

interface FilterTag {
  id: string;
  label: string;
  icon?: React.ElementType;
}

type ViewMode = "grid" | "list";

// ============ 常量配置 ============

// 筛选标签配置
const filterTags: FilterTag[] = [
  { id: "all", label: "全部" },
  { id: "nearby", label: "附近", icon: MapPin },
  { id: "weekend", label: "本周末", icon: Calendar },
  { id: "free", label: "免费" },
  { id: "outdoor", label: "户外" },
  { id: "social", label: "社交" },
];

// 排序选项
const sortOptions = [
  { value: "recommend", label: "推荐" },
  { value: "latest", label: "最新" },
  { value: "hot", label: "最热" },
  { value: "time", label: "开始时间" },
];

// 视图模式 localStorage key
const VIEW_MODE_KEY = "user_home_view_mode";

// ============ 主组件 ============

const UserHome: FC = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 状态
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCity, setSelectedCity] = useState("全国");
  const [sortBy, setSortBy] = useState("recommend");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // 高级筛选状态
  const [advancedFilters, setAdvancedFilters] =
    useState<ActivityFilters>(defaultFilters);

  // 视图模式 - 从 localStorage 读取默认值
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return (saved as ViewMode) || "list";
  });

  // 保存视图模式到 localStorage
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // 使用 hooks 获取活动数据
  const { data: activitiesData, isLoading: isLoadingActivities } =
    useUserActivities();
  const { data: recommendedData, isLoading: isLoadingRecommended } =
    useRecommendedActivities();

  // 获取活动列表
  const allActivities = useMemo(() => {
    return activitiesData?.data?.activities || [];
  }, [activitiesData]);

  // 热门活动（取参与率最高的前4个）
  const hotActivities = useMemo(() => {
    const recommended = recommendedData?.data?.activities || [];
    if (recommended.length > 0) {
      return recommended.slice(0, 4);
    }
    // 降级使用普通列表
    return [...allActivities]
      .filter((a) => a.activityStatus === "recruiting")
      .sort(
        (a, b) =>
          b.currentParticipants / b.maxParticipants -
          a.currentParticipants / a.maxParticipants,
      )
      .slice(0, 4);
  }, [recommendedData, allActivities]);

  // 过滤和排序活动列表
  const filteredActivities = useMemo(() => {
    let result = [...allActivities];

    // 搜索过滤
    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(keyword) ||
          a.location.toLowerCase().includes(keyword) ||
          a.tags.some((t) => t.toLowerCase().includes(keyword)),
      );
    }

    // 城市过滤
    if (selectedCity !== "全国") {
      result = result.filter((a) => a.location.includes(selectedCity));
    }

    // 标签过滤（快捷筛选）
    if (activeFilter !== "all") {
      switch (activeFilter) {
        case "outdoor":
          result = result.filter(
            (a) => a.tags.includes("户外") || a.tags.includes("运动"),
          );
          break;
        case "social":
          result = result.filter(
            (a) => a.tags.includes("社交") || a.tags.includes("交友"),
          );
          break;
        case "weekend": {
          // 本周末筛选
          const now = dayjs();
          const weekEnd = now.endOf("week");
          const saturday = weekEnd.subtract(1, "day").startOf("day");
          result = result.filter((a) => {
            const d = dayjs(a.eventStartTime);
            return d.isAfter(saturday) && d.isBefore(weekEnd.add(1, "day"));
          });
          break;
        }
        case "free":
          // 免费活动筛选 - 由于 UserActivity 类型没有 price 字段，暂时跳过此筛选
          break;
        case "nearby":
          // 附近筛选暂时显示当前城市的活动
          if (selectedCity !== "全国") {
            result = result.filter((a) => a.location.includes(selectedCity));
          }
          break;
        default:
          break;
      }
    }

    // 高级筛选 - 分类
    if (advancedFilters.categories && advancedFilters.categories.length > 0) {
      result = result.filter((a) =>
        advancedFilters.categories.some((cat) => a.tags.includes(cat)),
      );
    }

    // 高级筛选 - 时间范围
    if (advancedFilters.timeRange && advancedFilters.timeRange !== "all") {
      const now = dayjs();
      switch (advancedFilters.timeRange) {
        case "today":
          result = result.filter((a) =>
            dayjs(a.eventStartTime).isSame(now, "day"),
          );
          break;
        case "tomorrow":
          result = result.filter((a) =>
            dayjs(a.eventStartTime).isSame(now.add(1, "day"), "day"),
          );
          break;
        case "weekend": {
          const weekEnd = now.endOf("week");
          const saturday = weekEnd.subtract(1, "day").startOf("day");
          result = result.filter((a) => {
            const d = dayjs(a.eventStartTime);
            return d.isAfter(saturday) && d.isBefore(weekEnd.add(1, "day"));
          });
          break;
        }
        case "week":
          result = result.filter((a) =>
            dayjs(a.eventStartTime).isBefore(now.add(7, "day")),
          );
          break;
        case "month":
          result = result.filter((a) =>
            dayjs(a.eventStartTime).isBefore(now.add(30, "day")),
          );
          break;
      }
    }

    // 高级筛选 - 价格范围 (由于 UserActivity 没有 price 字段，暂时只处理 free 筛选)
    if (
      advancedFilters.priceRange &&
      advancedFilters.priceRange !== "all" &&
      advancedFilters.priceRange === "free"
    ) {
      // 免费活动筛选 - 暂时不支持，因为 UserActivity 没有 price 字段
    }

    // 高级筛选 - 标签
    if (advancedFilters.tags && advancedFilters.tags.length > 0) {
      result = result.filter((a) =>
        advancedFilters.tags!.some((tag) => a.tags.includes(tag)),
      );
    }

    // 排序
    switch (sortBy) {
      case "latest":
        result.sort(
          (a, b) =>
            new Date(b.eventStartTime).getTime() -
            new Date(a.eventStartTime).getTime(),
        );
        break;
      case "hot":
        result.sort(
          (a, b) =>
            b.currentParticipants / b.maxParticipants -
            a.currentParticipants / a.maxParticipants,
        );
        break;
      case "time":
        result.sort(
          (a, b) =>
            new Date(a.eventStartTime).getTime() -
            new Date(b.eventStartTime).getTime(),
        );
        break;
      default:
        // recommend - 默认排序
        break;
    }

    return result;
  }, [
    allActivities,
    searchText,
    activeFilter,
    selectedCity,
    sortBy,
    advancedFilters,
  ]);

  const handleActivityClick = (id: string) => {
    navigate(`/u/activities/${id}`);
  };

  const clearSearch = () => {
    setSearchText("");
    searchInputRef.current?.focus();
  };

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // 处理高级筛选条件变更（不关闭抽屉）
  const handleFilterChange = (filters: ActivityFilters) => {
    setAdvancedFilters(filters);
  };

  // 确认筛选并关闭抽屉
  const handleFilterConfirm = () => {
    setShowFilterDrawer(false);
  };

  const handleFilterReset = () => {
    setAdvancedFilters(defaultFilters);
  };

  // 移除单个分类筛选条件
  const removeCategory = (category: string) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  // 移除时间范围筛选
  const removeTimeRange = () => {
    setAdvancedFilters((prev) => ({
      ...prev,
      timeRange: "all",
    }));
  };

  // 移除价格范围筛选
  const removePriceRange = () => {
    setAdvancedFilters((prev) => ({
      ...prev,
      priceRange: "all",
    }));
  };

  // 移除单个标签筛选
  const removeTag = (tag: string) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // 获取时间范围标签文本
  const getTimeRangeLabel = (value: string) => {
    return timeRangeOptions.find((opt) => opt.value === value)?.label || value;
  };

  // 获取价格范围标签文本
  const getPriceRangeLabel = (value: string) => {
    return priceRangeOptions.find((opt) => opt.value === value)?.label || value;
  };

  // 计算是否有活跃的高级筛选
  const hasActiveFilters =
    (advancedFilters.categories && advancedFilters.categories.length > 0) ||
    (advancedFilters.timeRange && advancedFilters.timeRange !== "all") ||
    (advancedFilters.tags && advancedFilters.tags.length > 0) ||
    (advancedFilters.priceRange && advancedFilters.priceRange !== "all");

  return (
    <UserLayout
      showTabBar={true}
      showTopBar={false}
      bgColor="bg-slate-50 dark:bg-gray-900"
    >
      {/* 顶部搜索区域 - 固定 */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
        {/* 搜索框 */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            {/* 城市选择 */}
            <button
              onClick={() => setShowCitySelector(true)}
              className="flex items-center gap-0.5 text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0"
            >
              <MapPin size={16} className="text-primary-500" />
              <span>{selectedCity}</span>
              <ChevronDown
                size={14}
                className="text-gray-400 dark:text-gray-500"
              />
            </button>

            {/* 搜索框 */}
            <div className="flex-1 h-10 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center px-4 gap-2">
              <Search
                size={18}
                className="text-slate-400 dark:text-gray-500 flex-shrink-0"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="搜索活动、地点、标签..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none"
              />
              {searchText && (
                <button
                  onClick={clearSearch}
                  className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-gray-600"
                >
                  <X size={14} className="text-slate-400 dark:text-gray-500" />
                </button>
              )}
            </div>

            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilterDrawer(true)}
              className={`
                relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 
                transition-colors
                ${
                  hasActiveFilters
                    ? "bg-primary-500 hover:bg-primary-600"
                    : "bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50"
                }
              `}
            >
              <SlidersHorizontal
                size={18}
                className={hasActiveFilters ? "text-white" : "text-primary-500"}
              />
              {/* 活跃筛选指示器 */}
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">
                    {(advancedFilters.categories?.length || 0) +
                      (advancedFilters.tags?.length || 0) +
                      (advancedFilters.timeRange ? 1 : 0)}
                  </span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 已选筛选条件标签区 */}
        {hasActiveFilters && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* 分类标签 */}
              {advancedFilters.categories.map((cat) => (
                <Tag
                  key={`cat-${cat}`}
                  closable
                  color="primary"
                  size="small"
                  variant="soft"
                  onClose={() => removeCategory(cat)}
                >
                  {cat}
                </Tag>
              ))}

              {/* 时间范围标签 */}
              {advancedFilters.timeRange !== "all" && (
                <Tag
                  closable
                  color="secondary"
                  size="small"
                  variant="soft"
                  onClose={removeTimeRange}
                >
                  {getTimeRangeLabel(advancedFilters.timeRange)}
                </Tag>
              )}

              {/* 价格范围标签 */}
              {advancedFilters.priceRange !== "all" && (
                <Tag
                  closable
                  color="accent"
                  size="small"
                  variant="soft"
                  onClose={removePriceRange}
                >
                  {getPriceRangeLabel(advancedFilters.priceRange)}
                </Tag>
              )}

              {/* 热门标签 */}
              {advancedFilters.tags.map((tag) => (
                <Tag
                  key={`tag-${tag}`}
                  closable
                  color="gray"
                  size="small"
                  variant="soft"
                  onClose={() => removeTag(tag)}
                >
                  {tag}
                </Tag>
              ))}

              {/* 清除全部按钮 */}
              <button
                onClick={handleFilterReset}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors px-2"
              >
                清除全部
              </button>
            </div>
          </div>
        )}

        {/* 筛选标签 */}
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {filterTags.map((tag) => {
              const Icon = tag.icon;
              const isActive = activeFilter === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setActiveFilter(tag.id)}
                  className={`
                    h-8 px-4 rounded-full flex items-center gap-1.5 text-xs font-semibold
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm"
                        : "bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
                    }
                  `}
                >
                  {Icon && <Icon size={14} />}
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 页面内容 */}
      <div className="min-h-screen pb-20">
        {/* 热门活动轮播区 */}
        <section className="py-4">
          <div className="px-4 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-secondary-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                热门活动
              </h2>
            </div>
            <button
              onClick={() => navigate("/u/discover?sort=hot")}
              className="text-xs text-primary-500 font-medium flex items-center gap-0.5"
            >
              查看更多
              <ChevronRight size={14} />
            </button>
          </div>

          {/* 轮播组件 */}
          <div className="px-4">
            <HotActivityCarousel
              activities={hotActivities}
              onClick={handleActivityClick}
              autoplay={true}
              autoplayInterval={4000}
            />
          </div>
        </section>

        {/* 活动列表区 */}
        <section className="px-4">
          {/* 标题、视图切换和排序 */}
          <div className="flex items-center justify-between py-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              全部活动
            </h2>

            <div className="flex items-center gap-3">
              {/* 视图切换 */}
              <div className="flex items-center bg-slate-100 dark:bg-gray-700 rounded-lg p-0.5">
                <button
                  onClick={() => toggleViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 text-primary-500 shadow-sm"
                      : "text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-gray-300"
                  }`}
                  aria-label="网格视图"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => toggleViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 text-primary-500 shadow-sm"
                      : "text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-gray-300"
                  }`}
                  aria-label="列表视图"
                >
                  <List size={16} />
                </button>
              </div>

              {/* 排序 */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1"
                >
                  {sortOptions.find((s) => s.value === sortBy)?.label}
                  <ChevronDown
                    size={12}
                    className={`text-slate-400 dark:text-gray-500 transition-transform ${
                      showSortMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showSortMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSortMenu(false)}
                    />
                    <div className="absolute right-0 top-6 w-24 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortMenu(false);
                          }}
                          className={`w-full px-3 py-2.5 text-xs text-left hover:bg-slate-50 dark:hover:bg-gray-700 ${
                            sortBy === option.value
                              ? "text-primary-500 font-semibold"
                              : "text-slate-600 dark:text-gray-300"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 结果计数 */}
          <p className="text-xs text-slate-400 dark:text-gray-500 mb-3">
            共 {filteredActivities.length} 个活动
          </p>

          {/* 活动列表 - 根据视图模式渲染 */}
          {filteredActivities.length === 0 ? (
            <div className="py-16 text-center">
              <Search
                size={40}
                className="text-slate-200 dark:text-gray-600 mx-auto mb-3"
              />
              <p className="text-slate-400 dark:text-gray-500 text-sm">
                没有找到相关活动
              </p>
              <button
                onClick={() => {
                  setSearchText("");
                  setActiveFilter("all");
                  setSelectedCity("全国");
                  handleFilterReset();
                }}
                className="mt-4 px-6 py-2 bg-primary-500 text-white text-sm font-medium rounded-full hover:bg-primary-600 transition-colors"
              >
                重置筛选
              </button>
            </div>
          ) : viewMode === "grid" ? (
            // 网格视图
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onClick={handleActivityClick}
                  showUserStatus={false}
                />
              ))}
            </div>
          ) : (
            // 列表视图
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <ActivityListItem
                  key={activity.id}
                  activity={activity}
                  onClick={handleActivityClick}
                  size="default"
                  showUserStatus={false}
                />
              ))}
            </div>
          )}
        </section>

        {/* 底部间距 */}
        <div className="h-8" />
      </div>

      {/* 城市选择器 - 使用 antd-mobile 组件 */}
      <CitySelector
        open={showCitySelector}
        onClose={() => setShowCitySelector(false)}
        value={selectedCity}
        onChange={(city) => setSelectedCity(city)}
        title="选择城市"
      />

      {/* 高级筛选抽屉 */}
      <ActivityFilterDrawer
        open={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        filters={advancedFilters}
        onFiltersChange={handleFilterChange}
        onReset={handleFilterReset}
        onConfirm={handleFilterConfirm}
      />
    </UserLayout>
  );
};

export default UserHome;
