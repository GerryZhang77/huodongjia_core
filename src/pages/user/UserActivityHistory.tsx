/**
 * 用户端活动记录页面
 * 展示用户参与/报名的所有活动
 */

import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { ActivityCard } from "@/components/business/ActivityCard";
import {
  mockUserActivities,
  UserActivity,
  UserActivityStatus,
} from "@/mocks/data/user-activities";

// Tab 配置
const tabs = [
  { key: "all", label: "全部", count: 0 },
  { key: "recruiting", label: "报名中", count: 0 },
  { key: "approved", label: "已通过", count: 0 },
  { key: "completed", label: "已结束", count: 0 },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const UserActivityHistory: FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  // 统计各状态数量
  const counts = mockUserActivities.reduce(
    (acc, activity) => {
      acc.all++;
      if (activity.userStatus === "recruiting") acc.recruiting++;
      if (activity.userStatus === "approved") acc.approved++;
      if (activity.userStatus === "completed") acc.completed++;
      return acc;
    },
    { all: 0, recruiting: 0, approved: 0, completed: 0 }
  );

  // 更新 tabs 的 count
  const tabsWithCount = tabs.map((tab) => ({
    ...tab,
    count: counts[tab.key],
  }));

  // 筛选活动
  const filteredActivities =
    activeTab === "all"
      ? mockUserActivities
      : mockUserActivities.filter(
          (activity) => activity.userStatus === activeTab
        );

  // 跳转到活动详情
  const handleActivityClick = (id: string) => {
    navigate(`/u/activities/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 响应式容器 */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto bg-white min-h-screen shadow-sm md:shadow-lg">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 md:px-6 pt-12 md:pt-6 pb-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mr-3"
              >
                <ArrowLeft size={18} className="text-gray-600" />
              </button>
              <h1 className="text-lg font-bold text-gray-900">我的活动记录</h1>
            </div>
          </div>
        </header>

        {/* Tab 切换 */}
        <div className="px-4 md:px-6 py-2 bg-white border-b border-slate-100">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {tabsWithCount.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-primary-500 border-primary-500"
                    : "text-slate-400 border-transparent"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* 活动列表 */}
        <div className="px-4 md:px-6 py-4">
          {filteredActivities.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                {activeTab === "all"
                  ? "还没有参与任何活动"
                  : `没有${
                      tabsWithCount.find((t) => t.key === activeTab)?.label
                    }的活动`}
              </p>
              <button
                onClick={() => navigate("/u/discover")}
                className="mt-4 px-6 py-2 bg-primary-500 text-white text-sm font-medium rounded-full hover:bg-primary-600 transition-colors"
              >
                去发现
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onClick={handleActivityClick}
                  showUserStatus
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivityHistory;
