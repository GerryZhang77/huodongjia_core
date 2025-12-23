/**
 * 用户端首页
 * 现代化响应式设计 - 卡片式布局，更舒适的间距和视觉层次
 */

import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Sparkles, Calendar } from "lucide-react";
import { SearchBar, Button } from "antd-mobile";
import { UserLayout } from "@/components/layout/UserLayout";
import { UserActivityCard } from "@/components/business/UserActivityCard";
import {
  mockUserActivities,
  UserActivity,
  UserActivityStatus,
} from "@/mocks/data/user-activities";
import { getUnreadCount } from "@/mocks/data/user-notifications";
import { useAuthStore } from "@/features/auth/stores";

// 状态筛选配置
const statusFilters: {
  key: UserActivityStatus | "all";
  label: string;
  emoji?: string;
}[] = [
  { key: "all", label: "全部" },
  { key: "recruiting", label: "报名中", emoji: "🔥" },
  { key: "approved", label: "已通过", emoji: "✅" },
  { key: "completed", label: "已结束", emoji: "📋" },
];

const UserHome: FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [activeFilter, setActiveFilter] = useState<UserActivityStatus | "all">(
    "all"
  );
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const unreadCount = getUnreadCount();

  // 筛选活动
  const filteredActivities = mockUserActivities.filter((activity) => {
    const matchesFilter =
      activeFilter === "all" || activity.userStatus === activeFilter;
    const matchesSearch =
      !searchValue ||
      activity.title.toLowerCase().includes(searchValue.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleActivityClick = (activity: UserActivity) => {
    navigate(`/u/activities/${activity.id}`);
  };

  return (
    <UserLayout bgColor="bg-gray-50/80">
      {/* 顶部导航区域 - 毛玻璃效果 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        {/* 主标题栏 */}
        <div className="px-5 pt-4 pb-3 sm:px-6">
          <div className="flex items-center justify-between">
            {/* 左侧：Logo + 标题 */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500 via-primary-400 to-accent-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                {/* 装饰光点 */}
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  我的活动
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user?.name ? `Hi, ${user.name} 👋` : "发现精彩活动"}
                </p>
              </div>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100/80 active:bg-gray-200/80 transition-all duration-200"
              >
                <Search size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => navigate("/u/notifications")}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100/80 active:bg-gray-200/80 transition-all duration-200"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-full shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 搜索栏 - 动画展开 */}
        {showSearch && (
          <div className="px-5 pb-3 sm:px-6 animate-in slide-in-from-top duration-200">
            <SearchBar
              placeholder="搜索活动名称..."
              value={searchValue}
              onChange={setSearchValue}
              onClear={() => setSearchValue("")}
              style={{
                "--border-radius": "12px",
                "--background": "#f3f4f6",
                "--height": "40px",
              }}
            />
          </div>
        )}

        {/* 筛选标签栏 */}
        <div className="px-5 pb-4 sm:px-6">
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide -mx-1 px-1 py-1">
            {statusFilters.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                    transition-all duration-250 ease-out
                    ${
                      isActive
                        ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-[1.02]"
                        : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 active:scale-95"
                    }
                  `}
                >
                  <span className="flex items-center gap-1.5">
                    {filter.emoji && (
                      <span className="text-sm">{filter.emoji}</span>
                    )}
                    {filter.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 活动列表区域 */}
      <section className="px-5 py-5 sm:px-6 sm:py-6">
        {/* 结果统计 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              共{" "}
              <span className="font-semibold text-gray-800">
                {filteredActivities.length}
              </span>{" "}
              个活动
            </span>
          </div>
        </div>

        {/* 活动卡片列表 */}
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <UserActivityCard
                  activity={activity}
                  onClick={handleActivityClick}
                />
              </div>
            ))}
          </div>
        ) : (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <div className="w-28 h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <Search size={36} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              暂无相关活动
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center px-4">
              {searchValue ? "试试其他搜索关键词" : "试试其他筛选条件吧"}
            </p>
            <Button
              color="primary"
              fill="solid"
              size="middle"
              onClick={() => {
                setActiveFilter("all");
                setSearchValue("");
              }}
              style={{
                borderRadius: "9999px",
                paddingLeft: "24px",
                paddingRight: "24px",
              }}
            >
              查看全部活动
            </Button>
          </div>
        )}
      </section>

      {/* 底部提示 */}
      {filteredActivities.length > 0 && (
        <div className="text-center pb-8 pt-2">
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
            <span>已显示全部活动</span>
            <Sparkles size={14} className="text-amber-400" />
          </span>
        </div>
      )}
    </UserLayout>
  );
};

export default UserHome;
