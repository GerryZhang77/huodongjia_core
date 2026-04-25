/**
 * 用户发现页面
 * 发现平台活跃用户，供商家筛选和推送活动邀请
 *
 * 功能说明:
 * - 提供平台用户的综合画像数据
 * - 支持多维度筛选 (活跃度、职业、出勤率等)
 * - 可向筛选后的用户推送活动邀请
 */

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Send,
  Users,
  TrendingUp,
  Star,
  CheckCircle,
  UserCheck,
  Activity,
  Award,
  Calendar,
} from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { MerchantLayout } from "@/components/layout";

// ============ 类型定义 ============

/** 人才画像数据 */
interface TalentProfile {
  id: string;
  name: string;
  avatar?: string;
  /** 职业 */
  occupation: string;
  /** 行业 */
  industry: string;
  /** 所在城市 */
  city: string;
  /** 年龄段 */
  ageGroup: string;
  /** 活跃度评分 (1-5) */
  activityScore: number;
  /** 报名次数 */
  enrollmentCount: number;
  /** 出勤率 (0-100) */
  attendanceRate: number;
  /** 兴趣标签 */
  interests: string[];
  /** 最近活跃时间 */
  lastActiveAt: string;
  /** 是否为优质用户 */
  isPremium: boolean;
}

/** 筛选条件 */
interface FilterCriteria {
  keyword: string;
  industries: string[];
  cities: string[];
  ageGroups: string[];
  activityScoreMin: number;
  attendanceRateMin: number;
}

// ============ Mock 数据 ============

const mockTalents: TalentProfile[] = [
  {
    id: "t1",
    name: "张明",
    occupation: "产品经理",
    industry: "互联网",
    city: "北京",
    ageGroup: "25-30",
    activityScore: 5,
    enrollmentCount: 28,
    attendanceRate: 95,
    interests: ["商业社交", "创业", "投资"],
    lastActiveAt: "2026-01-24T10:30:00",
    isPremium: true,
  },
  {
    id: "t2",
    name: "李婷",
    occupation: "市场总监",
    industry: "金融",
    city: "上海",
    ageGroup: "30-35",
    activityScore: 4,
    enrollmentCount: 15,
    attendanceRate: 88,
    interests: ["品牌营销", "行业交流"],
    lastActiveAt: "2026-01-23T15:00:00",
    isPremium: true,
  },
  {
    id: "t3",
    name: "王磊",
    occupation: "技术总监",
    industry: "互联网",
    city: "深圳",
    ageGroup: "30-35",
    activityScore: 4,
    enrollmentCount: 12,
    attendanceRate: 92,
    interests: ["技术分享", "创业"],
    lastActiveAt: "2026-01-22T09:00:00",
    isPremium: false,
  },
  {
    id: "t4",
    name: "陈静",
    occupation: "设计师",
    industry: "设计/创意",
    city: "杭州",
    ageGroup: "25-30",
    activityScore: 3,
    enrollmentCount: 8,
    attendanceRate: 75,
    interests: ["设计交流", "艺术展览"],
    lastActiveAt: "2026-01-20T14:00:00",
    isPremium: false,
  },
  {
    id: "t5",
    name: "赵伟",
    occupation: "投资经理",
    industry: "金融",
    city: "北京",
    ageGroup: "35-40",
    activityScore: 5,
    enrollmentCount: 35,
    attendanceRate: 98,
    interests: ["投资", "商业社交", "高尔夫"],
    lastActiveAt: "2026-01-24T18:00:00",
    isPremium: true,
  },
  {
    id: "t6",
    name: "刘洋",
    occupation: "律师",
    industry: "法律",
    city: "广州",
    ageGroup: "30-35",
    activityScore: 3,
    enrollmentCount: 6,
    attendanceRate: 83,
    interests: ["法律讲座", "商业社交"],
    lastActiveAt: "2026-01-21T11:00:00",
    isPremium: false,
  },
];

// 筛选选项
const industryOptions = [
  "互联网",
  "金融",
  "设计/创意",
  "法律",
  "教育",
  "医疗",
  "其他",
];
const cityOptions = ["北京", "上海", "深圳", "杭州", "广州", "成都", "其他"];
// 预留年龄组选项供后续筛选使用
// const ageGroupOptions = ["18-25", "25-30", "30-35", "35-40", "40+"];

// ============ 组件 ============

/** 统计卡片 */
const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className={`${color} rounded-xl p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
);

/** 人才卡片 */
const TalentCard: React.FC<{
  talent: TalentProfile;
  selected: boolean;
  onSelect: () => void;
}> = ({ talent, selected, onSelect }) => {
  const getActivityScoreLabel = (score: number) => {
    if (score >= 5) return { text: "非常活跃", color: "text-success-600" };
    if (score >= 4) return { text: "活跃", color: "text-primary-600" };
    if (score >= 3) return { text: "一般", color: "text-warning-600" };
    return { text: "较低", color: "text-gray-500" };
  };

  const scoreInfo = getActivityScoreLabel(talent.activityScore);

  return (
    <div
      className={`bg-white rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer ${
        selected
          ? "border-primary-400 shadow-md shadow-primary-100"
          : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* 头像 + 选择框 */}
        <div className="relative">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
              talent.isPremium
                ? "bg-gradient-to-br from-accent-400 to-accent-600"
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            }`}
          >
            {talent.name.charAt(0)}
          </div>
          {talent.isPremium && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning-400 rounded-full flex items-center justify-center">
              <Star size={12} className="text-white" fill="white" />
            </div>
          )}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900">
              {talent.name}
            </h4>
            {selected && (
              <CheckCircle
                size={16}
                className="text-primary-500"
                fill="white"
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2">
            {talent.occupation} · {talent.industry}
          </p>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1 mb-2">
            {talent.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>

          {/* 数据指标 */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Activity size={12} className={scoreInfo.color} />
              <span className={scoreInfo.color}>{scoreInfo.text}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar size={12} />
              <span>{talent.enrollmentCount}次报名</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <UserCheck size={12} />
              <span>{talent.attendanceRate}%出勤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** 用户发现页面主组件 */
const TalentPoolPage: React.FC = () => {
  // 状态
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({
    keyword: "",
    industries: [],
    cities: [],
    ageGroups: [],
    activityScoreMin: 0,
    attendanceRateMin: 0,
  });

  // 筛选后的人才列表
  const filteredTalents = useMemo(() => {
    return mockTalents.filter((talent) => {
      // 关键词搜索
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        if (
          !talent.name.toLowerCase().includes(keyword) &&
          !talent.occupation.toLowerCase().includes(keyword) &&
          !talent.industry.toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }

      // 行业筛选
      if (
        filters.industries.length > 0 &&
        !filters.industries.includes(talent.industry)
      ) {
        return false;
      }

      // 城市筛选
      if (filters.cities.length > 0 && !filters.cities.includes(talent.city)) {
        return false;
      }

      // 活跃度筛选
      if (
        filters.activityScoreMin > 0 &&
        talent.activityScore < filters.activityScoreMin
      ) {
        return false;
      }

      // 出勤率筛选
      if (
        filters.attendanceRateMin > 0 &&
        talent.attendanceRate < filters.attendanceRateMin
      ) {
        return false;
      }

      return true;
    });
  }, [searchKeyword, filters]);

  // 统计数据
  const stats = useMemo(() => {
    const premiumCount = mockTalents.filter((t) => t.isPremium).length;
    const avgAttendance = Math.round(
      mockTalents.reduce((sum, t) => sum + t.attendanceRate, 0) /
        mockTalents.length,
    );
    return {
      total: mockTalents.length,
      premium: premiumCount,
      avgAttendance,
    };
  }, []);

  // 选择操作
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredTalents.map((t) => t.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // 发送邀请
  const handleSendInvitation = () => {
    if (selectedIds.length === 0) {
      Toast.show({ content: "请先选择要邀请的用户" });
      return;
    }
    // TODO: 弹出活动选择框
    Toast.show({
      content: `已选择 ${selectedIds.length} 人，功能开发中...`,
      icon: "success",
    });
  };

  return (
    <MerchantLayout title="用户发现">
      <div className="space-y-4 pb-6">
        {/* 功能说明 */}
        <div className="bg-gradient-to-r from-accent-50 to-purple-50 rounded-xl p-4 border border-accent-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Award size={20} className="text-accent-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                用户发现
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                平台汇集了各行业优质人才资源，您可以根据活跃度、职业、出勤率等多维度筛选目标用户，并向他们发送活动邀请，提高活动参与质量。
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            title="总人才数"
            value={stats.total}
            icon={<Users size={18} className="text-primary-500" />}
            color="bg-primary-50"
          />
          <StatCard
            title="优质用户"
            value={stats.premium}
            icon={<Star size={18} className="text-warning-500" />}
            color="bg-warning-50"
          />
          <StatCard
            title="平均出勤率"
            value={`${stats.avgAttendance}%`}
            icon={<TrendingUp size={18} className="text-success-500" />}
            color="bg-success-50"
          />
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="搜索姓名、职业、行业..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <button
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors ${
              showFilter
                ? "bg-primary-50 border-primary-200 text-primary-600"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setShowFilter(!showFilter)}
          >
            <Filter size={16} />
            筛选
          </button>
        </div>

        {/* 筛选面板 */}
        {showFilter && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                行业
              </label>
              <div className="flex flex-wrap gap-2">
                {industryOptions.map((industry) => (
                  <button
                    key={industry}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      filters.industries.includes(industry)
                        ? "bg-primary-400 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        industries: prev.industries.includes(industry)
                          ? prev.industries.filter((i) => i !== industry)
                          : [...prev.industries, industry],
                      }));
                    }}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                城市
              </label>
              <div className="flex flex-wrap gap-2">
                {cityOptions.map((city) => (
                  <button
                    key={city}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      filters.cities.includes(city)
                        ? "bg-primary-400 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        cities: prev.cities.includes(city)
                          ? prev.cities.filter((c) => c !== city)
                          : [...prev.cities, city],
                      }));
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  最低活跃度
                </label>
                <select
                  className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  value={filters.activityScoreMin}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      activityScoreMin: Number(e.target.value),
                    }))
                  }
                >
                  <option value={0}>不限</option>
                  <option value={3}>一般及以上</option>
                  <option value={4}>活跃及以上</option>
                  <option value={5}>非常活跃</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  最低出勤率
                </label>
                <select
                  className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  value={filters.attendanceRateMin}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      attendanceRateMin: Number(e.target.value),
                    }))
                  }
                >
                  <option value={0}>不限</option>
                  <option value={60}>60%以上</option>
                  <option value={80}>80%以上</option>
                  <option value={90}>90%以上</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="text-sm text-primary-500 hover:text-primary-600"
              onClick={selectAll}
            >
              全选
            </button>
            <span className="text-gray-300">|</span>
            <button
              className="text-sm text-gray-500 hover:text-gray-600"
              onClick={clearSelection}
            >
              取消选择
            </button>
            {selectedIds.length > 0 && (
              <span className="text-sm text-gray-400">
                已选 {selectedIds.length} 人
              </span>
            )}
          </div>
          <button
            className={`h-9 px-4 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all ${
              selectedIds.length > 0
                ? "bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-md shadow-primary-200 hover:shadow-lg"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            onClick={handleSendInvitation}
            disabled={selectedIds.length === 0}
          >
            <Send size={14} />
            发送活动邀请
          </button>
        </div>

        {/* 人才列表 */}
        <div className="space-y-3">
          {filteredTalents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Users size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">未找到匹配的人才</p>
              <p className="text-xs text-gray-300 mt-1">尝试调整筛选条件</p>
            </div>
          ) : (
            filteredTalents.map((talent) => (
              <TalentCard
                key={talent.id}
                talent={talent}
                selected={selectedIds.includes(talent.id)}
                onSelect={() => toggleSelect(talent.id)}
              />
            ))
          )}
        </div>
      </div>
    </MerchantLayout>
  );
};

export default TalentPoolPage;
