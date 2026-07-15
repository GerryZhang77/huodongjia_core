/**
 * 用户端发现/活动列表页面
 * 根据设计稿 06-activity-list.svg 实现
 */

import { FC, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, MapPin, Calendar } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { useRecommendedActivities } from "@/features/user";
import { usePrefetchActivityDetail } from "@/hooks/usePrefetchActivity";
import type { UserActivity } from "@/services/userApi";
import dayjs from "dayjs";

// 筛选标签
const filterTags = [
  { id: "all", label: "全部", active: true },
  { id: "nearby", label: "附近", icon: MapPin },
  { id: "weekend", label: "本周", icon: Calendar },
  { id: "free", label: "免费" },
  { id: "outdoor", label: "户外" },
  { id: "social", label: "社交" },
];

// 排序选项
const sortOptions = [
  { value: "latest", label: "最新发布" },
  { value: "hot", label: "热门推荐" },
  { value: "price_asc", label: "价格最低" },
  { value: "time_asc", label: "开始时间" },
];

// 格式化日期
const formatDate = (dateStr: string): string => {
  const d = dayjs(dateStr);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${d.format("M月D日")} ${weekdays[d.day()]} ${d.format("HH:mm")}`;
};

// 活动卡片背景色
const cardColors = [
  "from-primary-400 to-primary-500",
  "from-secondary-400 to-secondary-500",
  "from-accent-400 to-accent-500",
  "from-success-500 to-green-600",
];

const UserDiscover: FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // 使用 hooks 获取活动数据
  const { data: activitiesData, isLoading } = useRecommendedActivities();

  const allActivities = useMemo(() => {
    return activitiesData?.data?.activities || [];
  }, [activitiesData]);

  // 过滤活动
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

    // 标签过滤
    if (activeFilter !== "all") {
      switch (activeFilter) {
        case "free":
          // 暂时无价格字段，跳过此过滤
          break;
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
        case "weekend":
          result = result.filter((a) => {
            const d = dayjs(a.eventStartTime);
            const weekEnd = dayjs().endOf("week");
            return d.isBefore(weekEnd);
          });
          break;
        default:
          break;
      }
    }

    // 排序
    switch (sortBy) {
      case "latest":
        // 使用活动开始时间排序（最新的活动优先）
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
      case "price_asc":
        // 当前活动都是免费的，按人数排序
        result.sort((a, b) => a.currentParticipants - b.currentParticipants);
        break;
      case "time_asc":
        result.sort(
          (a, b) =>
            new Date(a.eventStartTime).getTime() -
            new Date(b.eventStartTime).getTime(),
        );
        break;
    }

    return result;
  }, [allActivities, searchText, activeFilter, sortBy]);

  const handleActivityClick = useCallback(
    (id: string) => {
      navigate(`/u/activities/${id}`);
    },
    [navigate]
  );

  const prefetchActivity = usePrefetchActivityDetail();

  return (
    <UserLayout
      showTabBar={true}
      showTopBar={true}
      showBreadcrumb={false}
      bgColor="bg-slate-50 dark:bg-gray-900"
    >
      {/* 页面内容 */}
      <div className="min-h-screen">
        {/* 搜索区域 */}
        <div className="px-4 md:px-6 py-4 bg-white dark:bg-gray-800 sticky top-16 md:top-14 z-30">
          <div className="flex gap-3">
            {/* 搜索框 */}
            <div className="flex-1 h-11 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center px-4 gap-2">
              <Search
                size={18}
                className="text-slate-400 dark:text-gray-500 flex-shrink-0"
              />
              <input
                type="text"
                placeholder="搜索活动..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none"
              />
            </div>
            {/* 筛选按钮 */}
            <button className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-primary-900/30 flex items-center justify-center">
              <SlidersHorizontal size={18} className="text-primary-500" />
            </button>
          </div>
        </div>

        {/* 筛选标签 */}
        <div className="px-4 md:px-6 pb-3 bg-white dark:bg-gray-800 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 min-w-max">
            {filterTags.map((tag) => {
              const Icon = tag.icon;
              return (
                <button
                  key={tag.id}
                  onClick={() => setActiveFilter(tag.id)}
                  className={`h-8 px-4 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    activeFilter === tag.id
                      ? "bg-primary-500 text-white"
                      : "bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {Icon && <Icon size={14} />}
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 结果计数和排序 */}
        <div className="px-4 md:px-6 py-3 flex items-center justify-between bg-slate-50 dark:bg-gray-900">
          <span className="text-xs text-slate-400 dark:text-gray-500">
            共 {filteredActivities.length} 个活动
          </span>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1"
            >
              {sortOptions.find((s) => s.value === sortBy)?.label}
              <span className="text-[10px]">▼</span>
            </button>
            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 top-6 w-28 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
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
                          : "text-slate-600 dark:text-gray-400"
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

        {/* 活动列表 */}
        <div className="px-4 md:px-6 py-4 space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-400 dark:text-gray-500 text-sm">
                没有找到相关活动
              </p>
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                colorIndex={index % cardColors.length}
                onClick={handleActivityClick}
                onMouseEnter={prefetchActivity}
              />
            ))
          )}
        </div>
      </div>
    </UserLayout>
  );
};

// 活动卡片组件
interface ActivityCardProps {
  activity: UserActivity;
  colorIndex: number;
  onClick: (id: string) => void;
  onMouseEnter?: (id: string) => void;
}

const ActivityCard: FC<ActivityCardProps> = ({
  activity,
  colorIndex,
  onClick,
  onMouseEnter,
}) => {
  const isHot = activity.currentParticipants / activity.maxParticipants > 0.8;
  const isUpcoming =
    dayjs(activity.eventStartTime).diff(dayjs(), "day") <= 3 &&
    dayjs(activity.eventStartTime).isAfter(dayjs());

  return (
    <div
      onClick={() => onClick(activity.id)}
      onMouseEnter={() => onMouseEnter?.(activity.id)}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-slate-200/60 dark:shadow-none overflow-hidden flex cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* 左侧彩色区域 */}
      <div
        className={`w-28 flex-shrink-0 bg-gradient-to-br ${cardColors[colorIndex]} relative flex items-center justify-center`}
      >
        {/* 封面图或emoji */}
        {activity.coverImage ? (
          <img
            src={activity.coverImage}
            alt={activity.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : (
          <span className="text-4xl">
            {activity.tags.includes("户外") || activity.tags.includes("运动")
              ? String.fromCodePoint(0x1f3d4)
              : activity.tags.includes("社交") || activity.tags.includes("交友")
                ? String.fromCodePoint(0x1f389)
                : activity.tags.includes("读书") ||
                    activity.tags.includes("学习")
                  ? String.fromCodePoint(0x1f4da)
                  : String.fromCodePoint(0x1f3c3)}
          </span>
        )}

        {/* 角标 */}
        {(isHot || isUpcoming) && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm">
            <span
              className={`text-[10px] font-semibold ${
                isHot ? "text-secondary-500" : "text-secondary-500"
              }`}
            >
              {isHot ? "热门" : "即将开始"}
            </span>
          </div>
        )}
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 p-3 flex flex-col justify-between min-h-[120px]">
        {/* 标题 */}
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
          {activity.title}
        </h3>

        {/* 地点和时间 */}
        <div className="space-y-1 mt-1.5">
          <p className="text-[11px] text-slate-500 dark:text-gray-400 flex items-center gap-1">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="line-clamp-1">{activity.location}</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 flex items-center gap-1">
            <Calendar size={12} className="flex-shrink-0" />
            <span>{formatDate(activity.eventStartTime)}</span>
          </p>
        </div>

        {/* 标签 */}
        <div className="flex gap-1.5 mt-2">
          {activity.tags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
                  className={`max-w-full truncate whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                i === 0
                  ? "bg-blue-50 dark:bg-primary-900/30 text-primary-500"
                  : "bg-purple-50 dark:bg-accent-900/30 text-accent-500"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 价格和人数 */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary-500">免费</span>
            <span className="text-[10px] text-slate-400 dark:text-gray-500">
              {activity.currentParticipants}/{activity.maxParticipants}人
            </span>
          </div>
          <button
            className="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-primary-900/30 text-primary-500 text-[11px] font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onClick(activity.id);
            }}
          >
            报名
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDiscover;
