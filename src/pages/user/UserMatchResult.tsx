/**
 * 用户端匹配结果页面 - 增强版
 * 路由: /u/activities/:id/match-result
 *
 * 功能：
 * 1. 展示我的最终分组结果
 * 2. 展示 TopK 最佳匹配用户
 * 3. 展示多维度匹配结果
 * 4. NFC 碰一碰入口（如活动支持）
 * 5. 用户头像悬浮卡片
 */

import { FC, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Target,
  Users,
  Cake,
  // MessageCircle, // TODO: 暂时隐藏小组交流功能
  AlertCircle,
  Sparkles,
  Heart,
  Building2,
  MapPin,
  Trophy,
  ChevronRight,
  Smartphone,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Tag } from "@/components/ui";
import { UserHoverCard } from "@/components/business/UserHoverCard";
import { NFCTouchModal } from "@/components/business/NFCTouchModal";
import { useActivityDetail } from "@/features/user";
import dayjs from "dayjs";

// ============================================
// 类型定义
// ============================================

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  occupation?: string;
  city?: string;
  tags?: string[];
  isCurrentUser?: boolean;
  bgColor: string;
}

interface MatchReason {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

interface MatchGroup {
  groupName: string;
  matchScore: number;
  members: GroupMember[];
  reasons: MatchReason[];
}

interface TopMatchUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  occupation?: string;
  city?: string;
  tags?: string[];
  matchScore: number;
  rank: number;
  matchReasons: string[];
  commonTags: string[];
}

interface DimensionResult {
  dimensionId: string;
  dimensionName: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  bgColor: string;
  myScore: number;
  myRank: number;
  totalParticipants: number;
  topUsers: {
    id: string;
    name: string;
    avatar: string;
    score: number;
  }[];
}

interface EnhancedMatchResult {
  // 我的分组
  myGroup: MatchGroup;
  // TopK 最佳匹配用户
  topMatches: TopMatchUser[];
  // 多维度匹配结果
  dimensionResults: DimensionResult[];
  // 其他分组概览
  otherGroups: {
    name: string;
    members: number;
    score: number;
  }[];
  // 活动是否支持 NFC
  supportsNFC: boolean;
}

// ============================================
// Mock 数据
// ============================================

const mockMatchResult: EnhancedMatchResult = {
  myGroup: {
    groupName: "A",
    matchScore: 92,
    members: [
      {
        id: "m1",
        name: "小明",
        avatar: "https://i.pravatar.cc/100?img=1",
        role: "产品经理",
        occupation: "高级产品经理",
        city: "北京",
        tags: ["产品设计", "用户体验", "马拉松"],
        isCurrentUser: true,
        bgColor: "bg-blue-100",
      },
      {
        id: "m2",
        name: "小红",
        avatar: "https://i.pravatar.cc/100?img=2",
        role: "创业者",
        occupation: "联合创始人",
        city: "上海",
        tags: ["人工智能", "创业投资", "咖啡"],
        bgColor: "bg-orange-100",
      },
      {
        id: "m3",
        name: "大伟",
        avatar: "https://i.pravatar.cc/100?img=3",
        role: "设计师",
        occupation: "UI/UX 设计总监",
        city: "深圳",
        tags: ["UI设计", "摄影", "户外徒步"],
        bgColor: "bg-purple-100",
      },
      {
        id: "m4",
        name: "婷婷",
        avatar: "https://i.pravatar.cc/100?img=4",
        role: "运营",
        occupation: "增长负责人",
        city: "北京",
        tags: ["用户增长", "活动运营", "瑜伽"],
        bgColor: "bg-green-100",
      },
    ],
    reasons: [
      {
        id: "r1",
        icon: Target,
        title: "兴趣相似",
        description: "都喜欢户外、摄影和美食",
        bgColor: "bg-purple-50",
        iconColor: "text-purple-500",
      },
      {
        id: "r2",
        icon: Users,
        title: "行业互补",
        description: "来自产品、设计、开发、运营",
        bgColor: "bg-blue-50",
        iconColor: "text-blue-500",
      },
      {
        id: "r3",
        icon: Cake,
        title: "年龄相近",
        description: "25-30岁，更多共同话题",
        bgColor: "bg-orange-50",
        iconColor: "text-orange-500",
      },
    ],
  },
  topMatches: [
    {
      id: "m2",
      name: "小红",
      avatar: "https://i.pravatar.cc/100?img=2",
      role: "创业者",
      occupation: "联合创始人",
      city: "上海",
      tags: ["人工智能", "创业投资", "技术管理"],
      matchScore: 95,
      rank: 1,
      matchReasons: ["兴趣高度重合", "行业互补性强"],
      commonTags: ["人工智能", "创业投资"],
    },
    {
      id: "m5",
      name: "阿杰",
      avatar: "https://i.pravatar.cc/100?img=5",
      role: "投资人",
      occupation: "投资总监",
      city: "北京",
      tags: ["创业投资", "科技行业", "高尔夫"],
      matchScore: 91,
      rank: 2,
      matchReasons: ["资源互补", "同城优先"],
      commonTags: ["创业投资"],
    },
    {
      id: "m6",
      name: "小美",
      avatar: "https://i.pravatar.cc/100?img=6",
      role: "产品经理",
      occupation: "产品专家",
      city: "北京",
      tags: ["产品设计", "数据分析", "读书会"],
      matchScore: 88,
      rank: 3,
      matchReasons: ["职业相近", "兴趣相似"],
      commonTags: ["产品设计", "读书会"],
    },
    {
      id: "m7",
      name: "老王",
      avatar: "https://i.pravatar.cc/100?img=7",
      role: "技术专家",
      occupation: "架构师",
      city: "杭州",
      tags: ["后端开发", "云计算", "马拉松"],
      matchScore: 85,
      rank: 4,
      matchReasons: ["技术背景互补"],
      commonTags: ["马拉松"],
    },
    {
      id: "m8",
      name: "小李",
      avatar: "https://i.pravatar.cc/100?img=8",
      role: "市场营销",
      occupation: "市场总监",
      city: "广州",
      tags: ["品牌营销", "内容运营", "旅行"],
      matchScore: 82,
      rank: 5,
      matchReasons: ["行业视角互补"],
      commonTags: [],
    },
    {
      id: "m9",
      name: "大刘",
      avatar: "https://i.pravatar.cc/100?img=9",
      role: "创业者",
      occupation: "CEO",
      city: "成都",
      tags: ["企业服务", "创业投资", "美食"],
      matchScore: 80,
      rank: 6,
      matchReasons: ["创业经验互补"],
      commonTags: ["创业投资"],
    },
    {
      id: "m10",
      name: "小周",
      avatar: "https://i.pravatar.cc/100?img=10",
      role: "设计师",
      occupation: "产品设计师",
      city: "北京",
      tags: ["UI设计", "用户研究", "摄影"],
      matchScore: 78,
      rank: 7,
      matchReasons: ["设计背景相近"],
      commonTags: ["摄影"],
    },
    {
      id: "m11",
      name: "阿芳",
      avatar: "https://i.pravatar.cc/100?img=11",
      role: "HR",
      occupation: "人力资源总监",
      city: "上海",
      tags: ["人才招聘", "组织发展", "瑜伽"],
      matchScore: 75,
      rank: 8,
      matchReasons: ["资源互补"],
      commonTags: [],
    },
    {
      id: "m12",
      name: "小陈",
      avatar: "https://i.pravatar.cc/100?img=12",
      role: "研发工程师",
      occupation: "全栈工程师",
      city: "深圳",
      tags: ["全栈开发", "开源项目", "游戏"],
      matchScore: 72,
      rank: 9,
      matchReasons: ["技术交流"],
      commonTags: [],
    },
    {
      id: "m13",
      name: "老张",
      avatar: "https://i.pravatar.cc/100?img=13",
      role: "财务专家",
      occupation: "CFO",
      city: "北京",
      tags: ["财务管理", "投融资", "高尔夫"],
      matchScore: 70,
      rank: 10,
      matchReasons: ["财务视角互补"],
      commonTags: [],
    },
  ],
  dimensionResults: [
    {
      dimensionId: "interest",
      dimensionName: "兴趣相似度",
      icon: Heart,
      iconColor: "text-pink-500",
      bgColor: "bg-pink-50",
      myScore: 88,
      myRank: 3,
      totalParticipants: 50,
      topUsers: [
        {
          id: "m2",
          name: "小红",
          avatar: "https://i.pravatar.cc/100?img=2",
          score: 95,
        },
        {
          id: "m6",
          name: "小美",
          avatar: "https://i.pravatar.cc/100?img=6",
          score: 92,
        },
        {
          id: "m1",
          name: "我",
          avatar: "https://i.pravatar.cc/100?img=1",
          score: 88,
        },
      ],
    },
    {
      dimensionId: "industry",
      dimensionName: "行业互补性",
      icon: Building2,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      myScore: 82,
      myRank: 8,
      totalParticipants: 50,
      topUsers: [
        {
          id: "m5",
          name: "阿杰",
          avatar: "https://i.pravatar.cc/100?img=5",
          score: 96,
        },
        {
          id: "m2",
          name: "小红",
          avatar: "https://i.pravatar.cc/100?img=2",
          score: 94,
        },
        {
          id: "m9",
          name: "大刘",
          avatar: "https://i.pravatar.cc/100?img=9",
          score: 91,
        },
      ],
    },
    {
      dimensionId: "location",
      dimensionName: "同城优先",
      icon: MapPin,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      myScore: 100,
      myRank: 1,
      totalParticipants: 50,
      topUsers: [
        {
          id: "m1",
          name: "我",
          avatar: "https://i.pravatar.cc/100?img=1",
          score: 100,
        },
        {
          id: "m4",
          name: "婷婷",
          avatar: "https://i.pravatar.cc/100?img=4",
          score: 100,
        },
        {
          id: "m5",
          name: "阿杰",
          avatar: "https://i.pravatar.cc/100?img=5",
          score: 100,
        },
      ],
    },
  ],
  otherGroups: [
    { name: "B", members: 4, score: 88 },
    { name: "C", members: 4, score: 85 },
    { name: "D", members: 4, score: 82 },
  ],
  supportsNFC: true,
};

// ============================================
// Tab 定义
// ============================================

type TabType = "group" | "topMatches" | "dimensions";

const tabs: {
  key: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { key: "group", label: "我的分组", icon: Users },
  { key: "topMatches", label: "最佳匹配", icon: Trophy },
  { key: "dimensions", label: "多维度", icon: Sparkles },
];

// ============================================
// 格式化日期
// ============================================

const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format("M月D日");
};

// ============================================
// 主组件
// ============================================

const UserMatchResult: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("group");
  const [showNFCModal, setShowNFCModal] = useState(false);

  // 使用 hooks 获取活动详情
  const { data: activityData, isLoading } = useActivityDetail(id);

  const activity = useMemo(() => {
    return activityData?.data;
  }, [activityData]);

  const result = mockMatchResult;

  // 加载中状态
  if (isLoading) {
    return (
      <UserLayout showTabBar={true} showTopBar={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-500">加载中...</div>
        </div>
      </UserLayout>
    );
  }

  // 活动不存在
  if (!activity) {
    return (
      <UserLayout showTabBar={true} showTopBar={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
          <AlertCircle
            size={40}
            className="text-gray-300 dark:text-gray-600 mb-3"
          />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            活动不存在
          </p>
          <button
            onClick={() => navigate("/u/home")}
            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg"
          >
            返回首页
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout
      showTabBar={true}
      showTopBar={true}
      showBreadcrumb={true}
      breadcrumbItems={[
        { label: "首页", path: "/u/home" },
        { label: activity.title, path: `/u/activities/${id}` },
        { label: "匹配结果" },
      ]}
      bgColor="bg-gray-50"
    >
      <div className="min-h-screen pb-36">
        {/* 紫色渐变头部 */}
        <header className="bg-gradient-to-br from-accent-400 to-accent-500 pt-6 pb-6 px-4 md:px-6">
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">匹配结果</h1>
            <p className="text-sm text-white/80 mt-1">
              {activity.title} · {formatDate(activity.eventStartTime)}
            </p>
          </div>
        </header>

        {/* Tab 切换 */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative ${
                    isActive
                      ? "text-accent-500"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-accent-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="px-4 md:px-6 py-4">
          {/* Tab 1: 我的分组 */}
          {activeTab === "group" && (
            <MyGroupTab
              group={result.myGroup}
              otherGroups={result.otherGroups}
              onNavigateToProfile={(userId) =>
                navigate(`/u/profile/${userId}?activityId=${id}`)
              }
            />
          )}

          {/* Tab 2: 最佳匹配 */}
          {activeTab === "topMatches" && (
            <TopMatchesTab
              topMatches={result.topMatches}
              onNavigateToProfile={(userId) =>
                navigate(`/u/profile/${userId}?activityId=${id}`)
              }
            />
          )}

          {/* Tab 3: 多维度结果 */}
          {activeTab === "dimensions" && (
            <DimensionsTab dimensionResults={result.dimensionResults} />
          )}
        </div>

        {/* 底部操作栏 - 在 TabBar 上方 */}
        <div className="fixed bottom-14 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 z-30 safe-area-bottom">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={() => navigate(`/u/activities/${id}`)}
              className="flex-1 h-12 rounded-[22px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              查看活动详情
            </button>
            {result.supportsNFC && (
              <button
                onClick={() => setShowNFCModal(true)}
                className="h-12 px-4 rounded-[22px] bg-gradient-to-r from-primary-400 to-primary-500 text-white font-semibold text-sm shadow-lg shadow-primary-400/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Smartphone size={18} />
                NFC 碰一碰
              </button>
            )}
            {/* TODO: 联系组员功能暂时隐藏，后续版本开启 */}
            {/* <button className="flex-1 h-12 rounded-[22px] bg-gradient-to-r from-accent-400 to-accent-500 text-white font-semibold text-sm shadow-lg shadow-accent-400/30 hover:shadow-xl active:scale-[0.98] transition-all">
              联系组员
            </button> */}
          </div>
        </div>

        {/* NFC 弹窗 */}
        <NFCTouchModal
          open={showNFCModal}
          onClose={() => setShowNFCModal(false)}
          activityId={id}
        />
      </div>
    </UserLayout>
  );
};

// ============================================
// Tab 1: 我的分组
// ============================================

interface MyGroupTabProps {
  group: MatchGroup;
  otherGroups?: { name: string; members: number; score: number }[]; // TODO: 暂时隐藏活动其他分组功能，设为可选
  onNavigateToProfile: (userId: string) => void;
}

const MyGroupTab: FC<MyGroupTabProps> = ({
  group,
  // otherGroups, // TODO: 暂时隐藏活动其他分组功能
  onNavigateToProfile,
}) => {
  return (
    <div className="space-y-4">
      {/* 主卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-accent-500/10 overflow-hidden">
        {/* 分组徽章 */}
        <div className="flex justify-center pt-4">
          <div className="px-6 py-2 bg-accent-400 rounded-full shadow-lg">
            <span className="text-white font-bold">{group.groupName} 组</span>
          </div>
        </div>

        {/* 匹配度得分 */}
        <div className="text-center py-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            小组匹配度
          </p>
          <p className="text-5xl font-bold text-accent-500">
            {group.matchScore}%
          </p>
          <div className="mx-auto mt-3 w-48 h-2 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${group.matchScore}%` }}
            />
          </div>
        </div>

        {/* 成员头像 - 使用 HoverCard */}
        <div className="px-4 pb-4">
          <div className="flex justify-center gap-4 flex-wrap">
            {group.members.map((member) => (
              <UserHoverCard
                key={member.id}
                user={{
                  id: member.id,
                  name: member.name,
                  avatar: member.avatar,
                  role: member.role,
                  occupation: member.occupation,
                  city: member.city,
                  tags: member.tags,
                }}
                matchScore={member.isCurrentUser ? undefined : 85}
                onViewProfile={
                  member.isCurrentUser ? undefined : onNavigateToProfile
                }
                disabled={member.isCurrentUser}
              >
                <div className="text-center cursor-pointer">
                  <div
                    className={`w-14 h-14 rounded-full ${member.bgColor} flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-md hover:scale-105 transition-transform`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-2">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {member.isCurrentUser ? "你" : member.role}
                  </p>
                </div>
              </UserHoverCard>
            ))}
          </div>
        </div>
      </div>

      {/* 匹配理由 */}
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
          为什么我们被分在一组？
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {group.reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.id}
                className={`flex items-center gap-3 p-4 ${
                  index !== group.reasons.length - 1
                    ? "border-b border-gray-100 dark:border-gray-700"
                    : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${reason.bgColor} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={18} className={reason.iconColor} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {reason.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {reason.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TODO: 小组交流功能暂时隐藏，后续版本开启 */}
      {/* <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
          小组交流
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent-400 flex items-center justify-center flex-shrink-0">
            <MessageCircle size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {group.groupName}组群聊
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {group.members.length}人 · 已建立微信群
            </p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-accent-400 to-accent-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-accent-400/30">
            进入群聊
          </button>
        </div>
      </div> */}

      {/* 温馨提示 */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
        <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">
          温馨提示
        </p>
        <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
          <li>• 活动当天请于8:50前到达集合点</li>
          <li>• 请穿着舒适运动鞋，携带防晒用品</li>
        </ul>
      </div>

      {/* TODO: 活动其他分组功能暂时隐藏，后续版本开启 */}
      {/* <div className="hidden lg:block">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
          活动其他分组
        </h3>
        <div className="flex gap-3">
          {otherGroups.map((g) => (
            <div
              key={g.name}
              className="flex-1 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl text-center"
            >
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {g.name} 组
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {g.members}人 · {g.score}%
              </p>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

// ============================================
// Tab 2: 最佳匹配
// ============================================

interface TopMatchesTabProps {
  topMatches: TopMatchUser[];
  onNavigateToProfile: (userId: string) => void;
}

const TopMatchesTab: FC<TopMatchesTabProps> = ({
  topMatches,
  onNavigateToProfile,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          与你匹配度最高的用户
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          共 {topMatches.length} 人
        </span>
      </div>

      {topMatches.map((user, index) => (
        <div
          key={user.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            {/* 排名 */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                index === 0
                  ? "bg-yellow-400 text-yellow-900"
                  : index === 1
                    ? "bg-gray-300 text-gray-700"
                    : index === 2
                      ? "bg-orange-300 text-orange-800"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {user.rank}
            </div>

            {/* 头像 - 使用 HoverCard */}
            <UserHoverCard
              user={{
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                role: user.role,
                occupation: user.occupation,
                city: user.city,
                tags: user.tags,
              }}
              matchScore={user.matchScore}
              onViewProfile={onNavigateToProfile}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </UserHoverCard>

            {/* 用户信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user.name}
                </span>
                <span className="px-1.5 py-0.5 bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 text-[10px] font-medium rounded">
                  {user.role}
                </span>
              </div>

              {/* 匹配理由 */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {user.matchReasons.join(" · ")}
              </p>

              {/* 共同标签 */}
              {user.commonTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {user.commonTags.map((tag, idx) => (
                    <Tag key={idx} color="primary" variant="soft" size="small">
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </div>

            {/* 匹配分数 */}
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-bold text-accent-500">
                {user.matchScore}
              </p>
              <p className="text-[10px] text-gray-400">匹配分</p>
            </div>
          </div>

          {/* 查看详情 */}
          <button
            onClick={() => onNavigateToProfile(user.id)}
            className="w-full mt-3 py-2 text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            查看详情
            <ChevronRight size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

// ============================================
// Tab 3: 多维度结果
// ============================================

interface DimensionsTabProps {
  dimensionResults: DimensionResult[];
}

const DimensionsTab: FC<DimensionsTabProps> = ({ dimensionResults }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        查看你在不同匹配维度下的得分和排名
      </p>

      {dimensionResults.map((dimension) => {
        const Icon = dimension.icon;
        return (
          <div
            key={dimension.dimensionId}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
          >
            {/* 维度头部 */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
              <div
                className={`w-10 h-10 rounded-xl ${dimension.bgColor} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={20} className={dimension.iconColor} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {dimension.dimensionName}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  排名 {dimension.myRank}/{dimension.totalParticipants}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent-500">
                  {dimension.myScore}
                </p>
                <p className="text-[10px] text-gray-400">我的得分</p>
              </div>
            </div>

            {/* 进度条 */}
            <div className="px-4 pt-3 pb-2">
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${dimension.myScore}%` }}
                />
              </div>
            </div>

            {/* Top 用户 */}
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                该维度 Top 3
              </p>
              <div className="flex gap-2">
                {dimension.topUsers.map((user, idx) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg flex-1 ${
                      user.name === "我"
                        ? "bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800"
                        : "bg-gray-50 dark:bg-gray-700/50"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        idx === 0
                          ? "text-yellow-500"
                          : idx === 1
                            ? "text-gray-400"
                            : "text-orange-400"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {user.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserMatchResult;
