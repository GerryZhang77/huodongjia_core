/**
 * 商家端数据分析页面
 * 展示活动相关的统计数据和图表
 */

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Tabs, Skeleton } from "antd-mobile";
import { MerchantLayout } from "@/components/layout";

// 统计卡片数据类型
interface StatCard {
  id: string;
  title: string;
  value: number | string;
  change: number; // 百分比变化
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
}

// 活动数据类型
interface ActivityData {
  id: string;
  title: string;
  date: string;
  participants: number;
  matchRate: number;
  satisfactionRate: number;
}

// 时间段类型
type TimeRange = "week" | "month" | "quarter" | "year";

// Mock 数据
const mockStatCards: StatCard[] = [
  {
    id: "activities",
    title: "累计活动",
    value: 24,
    change: 12.5,
    trend: "up",
    icon: Calendar,
    color: "primary",
  },
  {
    id: "participants",
    title: "服务人数",
    value: 1856,
    change: 8.3,
    trend: "up",
    icon: Users,
    color: "secondary",
  },
  {
    id: "matchRate",
    title: "平均匹配率",
    value: "87%",
    change: 2.1,
    trend: "up",
    icon: Activity,
    color: "accent",
  },
  {
    id: "satisfaction",
    title: "满意度",
    value: "4.8",
    change: -0.5,
    trend: "down",
    icon: TrendingUp,
    color: "success",
  },
];

const mockActivityData: ActivityData[] = [
  {
    id: "1",
    title: "2024 年终商务交流会",
    date: "2024-12-20",
    participants: 86,
    matchRate: 92,
    satisfactionRate: 4.9,
  },
  {
    id: "2",
    title: "创业者 networking 之夜",
    date: "2024-12-15",
    participants: 64,
    matchRate: 88,
    satisfactionRate: 4.7,
  },
  {
    id: "3",
    title: "科技行业精英对接会",
    date: "2024-12-10",
    participants: 120,
    matchRate: 85,
    satisfactionRate: 4.8,
  },
  {
    id: "4",
    title: "投资人与创业者见面会",
    date: "2024-12-05",
    participants: 45,
    matchRate: 91,
    satisfactionRate: 4.6,
  },
  {
    id: "5",
    title: "HR 圈层交流活动",
    date: "2024-11-28",
    participants: 78,
    matchRate: 83,
    satisfactionRate: 4.5,
  },
];

// 月度数据
const mockMonthlyData = [
  { month: "7月", activities: 2, participants: 156 },
  { month: "8月", activities: 3, participants: 245 },
  { month: "9月", activities: 4, participants: 312 },
  { month: "10月", activities: 3, participants: 278 },
  { month: "11月", activities: 5, participants: 421 },
  { month: "12月", activities: 4, participants: 356 },
];

// 行业分布
const mockIndustryData = [
  { name: "互联网/IT", value: 35, color: "#3B82F6" },
  { name: "金融/投资", value: 25, color: "#F97316" },
  { name: "教育/培训", value: 15, color: "#A855F7" },
  { name: "医疗/健康", value: 12, color: "#22C55E" },
  { name: "其他", value: 13, color: "#64748B" },
];

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [loading] = useState(false);

  // 根据时间范围过滤数据
  const filteredData = useMemo(() => {
    // 实际项目中根据 timeRange 过滤
    // 这里简化处理，后续可扩展
    console.log("Filter by time range:", timeRange);
    return mockActivityData;
  }, [timeRange]);

  // 统计卡片组件
  const StatCardItem: React.FC<{ data: StatCard }> = ({ data }) => {
    const Icon = data.icon;
    const colorClasses = {
      primary: "bg-primary-50 dark:bg-primary-900/30 text-primary-500",
      secondary: "bg-secondary-50 dark:bg-secondary-900/30 text-secondary-500",
      accent: "bg-accent-50 dark:bg-accent-900/30 text-accent-500",
      success: "bg-success-50 dark:bg-success-900/30 text-success-500",
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[data.color as keyof typeof colorClasses]}`}
          >
            <Icon size={20} />
          </div>
          <div
            className={`flex items-center text-xs font-medium ${
              data.trend === "up"
                ? "text-success-500"
                : data.trend === "down"
                  ? "text-error-500"
                  : "text-gray-500"
            }`}
          >
            {data.trend === "up" ? (
              <ArrowUpRight size={14} />
            ) : data.trend === "down" ? (
              <ArrowDownRight size={14} />
            ) : null}
            {Math.abs(data.change)}%
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {data.value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {data.title}
        </p>
      </div>
    );
  };

  // 简单柱状图组件
  const SimpleBarChart: React.FC = () => {
    const maxValue = Math.max(...mockMonthlyData.map((d) => d.participants));

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            参与人数趋势
          </h3>
          <BarChart3 size={18} className="text-gray-400" />
        </div>
        <div className="flex items-end justify-between h-32 gap-2">
          {mockMonthlyData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-primary-400 dark:bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-500 dark:hover:bg-primary-400"
                style={{
                  height: `${(item.participants / maxValue) * 100}%`,
                  minHeight: "8px",
                }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {item.month}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              参与人数
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 简单饼图组件
  const SimplePieChart: React.FC = () => {
    const total = mockIndustryData.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            行业分布
          </h3>
          <PieChart size={18} className="text-gray-400" />
        </div>

        {/* 简化的饼图表示 - 使用水平条形图 */}
        <div className="space-y-3">
          {mockIndustryData.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {item.name}
                </span>
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {item.value}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.value / total) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 活动排行组件
  const ActivityRanking: React.FC = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            近期活动表现
          </h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {filteredData.slice(0, 5).map((activity, index) => (
            <div
              key={activity.id}
              className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() =>
                navigate(`/dashboard/activity/${activity.id}/manage`)
              }
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0
                    ? "bg-yellow-100 text-yellow-600"
                    : index === 1
                      ? "bg-gray-100 text-gray-600"
                      : index === 2
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-50 text-gray-400"
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.date} · {activity.participants} 人参与
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary-500">
                  {activity.matchRate}%
                </p>
                <p className="text-xs text-gray-400">匹配率</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <MerchantLayout title="数据分析">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} animated className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton animated className="h-48 rounded-xl" />
          <Skeleton animated className="h-48 rounded-xl" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout title="数据分析">
      <div className="space-y-4 pb-6">
        {/* 时间范围选择 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <Tabs
            activeKey={timeRange}
            onChange={(key) => setTimeRange(key as TimeRange)}
            style={{
              "--title-font-size": "13px",
            }}
          >
            <Tabs.Tab title="近7天" key="week" />
            <Tabs.Tab title="近30天" key="month" />
            <Tabs.Tab title="近3月" key="quarter" />
            <Tabs.Tab title="近1年" key="year" />
          </Tabs>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3">
          {mockStatCards.map((card) => (
            <StatCardItem key={card.id} data={card} />
          ))}
        </div>

        {/* 图表区域 */}
        <SimpleBarChart />
        <SimplePieChart />

        {/* 活动排行 */}
        <ActivityRanking />

        {/* 数据说明 */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            数据每日凌晨更新 · 最近更新时间: 2024-12-25 00:00
          </p>
        </div>
      </div>
    </MerchantLayout>
  );
};

export default AnalyticsPage;
