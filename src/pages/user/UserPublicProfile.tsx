/**
 * 用户公开个人页面 - 查看他人资料
 * 路由: /u/profile/:userId
 *
 * 功能：
 * - 展示他人名片信息
 * - 匹配分析（如有活动上下文）
 * - 共同标签/互补标签
 * - 打招呼/交换联系方式
 */

import { FC, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  MessageCircle,
  UserPlus,
  Share2,
  Sparkles,
  Building2,
  Heart,
  AlertCircle,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button, Tag } from "@/components/ui";

// Mock 用户数据
const mockUsers: Record<
  string,
  {
    id: string;
    name: string;
    avatar: string;
    role: string;
    occupation: string;
    company: string;
    city: string;
    bio: string;
    tags: string[];
    stats: {
      activitiesJoined: number;
      matchedFriends: number;
    };
  }
> = {
  m1: {
    id: "m1",
    name: "小明",
    avatar: "https://i.pravatar.cc/200?img=1",
    role: "产品经理",
    occupation: "高级产品经理",
    company: "字节跳动",
    city: "北京",
    bio: "5年产品经验，专注于 B 端 SaaS 产品。热爱跑步和阅读，希望认识更多志同道合的朋友。",
    tags: ["产品设计", "用户体验", "数据分析", "马拉松", "读书会"],
    stats: {
      activitiesJoined: 8,
      matchedFriends: 23,
    },
  },
  m2: {
    id: "m2",
    name: "小红",
    avatar: "https://i.pravatar.cc/200?img=2",
    role: "创业者",
    occupation: "联合创始人",
    company: "某AI创业公司",
    city: "上海",
    bio: "连续创业者，正在做一个 AI + 教育的项目。之前在大厂做过 5 年研发，技术出身。",
    tags: ["人工智能", "创业投资", "技术管理", "咖啡", "旅行"],
    stats: {
      activitiesJoined: 12,
      matchedFriends: 45,
    },
  },
  m3: {
    id: "m3",
    name: "大伟",
    avatar: "https://i.pravatar.cc/200?img=3",
    role: "设计师",
    occupation: "UI/UX 设计总监",
    company: "腾讯",
    city: "深圳",
    bio: "10年设计经验，从视觉设计到产品设计。热爱摄影和户外运动，周末经常组织摄影活动。",
    tags: ["UI设计", "品牌设计", "摄影", "户外徒步", "美食探店"],
    stats: {
      activitiesJoined: 15,
      matchedFriends: 56,
    },
  },
  m4: {
    id: "m4",
    name: "婷婷",
    avatar: "https://i.pravatar.cc/200?img=4",
    role: "运营专家",
    occupation: "增长负责人",
    company: "美团",
    city: "北京",
    bio: "专注于用户增长和活动运营，帮助多个项目从0到1。业余时间喜欢瑜伽和烘焙。",
    tags: ["用户增长", "活动运营", "数据分析", "瑜伽", "烘焙"],
    stats: {
      activitiesJoined: 20,
      matchedFriends: 78,
    },
  },
};

// Mock 匹配分析数据
const mockMatchAnalysis = {
  overallScore: 85,
  dimensions: [
    {
      name: "兴趣相似度",
      score: 88,
      icon: Heart,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      name: "行业互补性",
      score: 82,
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      name: "同城优先",
      score: 100,
      icon: MapPin,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
  ],
  commonTags: ["人工智能", "创业投资"],
  complementaryTags: ["技术管理", "产品设计"],
  suggestedTopics: [
    "你们都对 AI 感兴趣，可以聊聊 AI 在各自领域的应用",
    "都在北京，可以约个周末咖啡",
  ],
};

const UserPublicProfile: FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activityId = searchParams.get("activityId"); // 活动上下文

  const [isFollowing, setIsFollowing] = useState(false);

  // 获取用户数据
  const user = userId ? mockUsers[userId] : undefined;
  const matchAnalysis = activityId ? mockMatchAnalysis : undefined;

  // 头像显示
  const getAvatarContent = () => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <span className="text-3xl font-bold text-primary-600">
        {user?.name.charAt(0)}
      </span>
    );
  };

  // 用户不存在
  if (!user) {
    return (
      <UserLayout showTabBar={false} showTopBar={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
          <AlertCircle
            size={48}
            className="text-gray-300 dark:text-gray-600 mb-4"
          />
          <p className="text-gray-500 dark:text-gray-400 text-base mb-6">
            用户不存在
          </p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            返回上一页
          </Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout showTabBar={false} showTopBar={true} bgColor="bg-gray-50">
      <div className="min-h-screen pb-24">
        {/* 顶部渐变背景 */}
        <div className="bg-gradient-to-br from-primary-400 to-primary-500 pt-12 pb-24 px-4 relative">
          {/* 返回按钮 */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>

          {/* 分享按钮 */}
          <button className="absolute right-4 top-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <Share2 size={20} className="text-white" />
          </button>
        </div>

        {/* 主内容区域 */}
        <div className="px-4 -mt-12 relative z-10">
          {/* 用户信息卡片 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-visible">
            {/* 头像区域 - 使用负margin让头像突出 */}
            <div className="px-4 -mt-12">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-xl">
                <div className="w-full h-full rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                  {getAvatarContent()}
                </div>
              </div>
            </div>

            {/* 基本信息 */}
            <div className="relative px-4 pt-3 pb-4">
              {/* 关注按钮 - 右上角 */}
              <div className="absolute right-4 -top-14">
                <Button
                  variant={isFollowing ? "outline" : "primary"}
                  size="small"
                  icon={isFollowing ? undefined : <UserPlus size={14} />}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? "已关注" : "关注"}
                </Button>
              </div>

              {/* 用户信息 */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {user.name}
                  </h1>
                  <span className="px-2 py-0.5 bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 text-xs font-medium rounded">
                    {user.role}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {user.occupation}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 size={14} />
                    {user.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {user.city}
                  </span>
                </div>

                {/* 简介 */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {user.bio}
                </p>

                {/* 统计数据 */}
                <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {user.stats.activitiesJoined}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      参与活动
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {user.stats.matchedFriends}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      匹配好友
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 标签 */}
            <div className="px-4 pb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                兴趣标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.tags.map((tag, index) => (
                  <Tag key={index} color="primary" variant="soft" size="small">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          {/* 匹配分析 (仅在有活动上下文时显示) */}
          {matchAnalysis && (
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Sparkles size={18} className="text-accent-500" />
                    匹配分析
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-accent-500">
                      {matchAnalysis.overallScore}
                    </span>
                    <span className="text-sm text-gray-500">分</span>
                  </div>
                </div>
              </div>

              {/* 维度分析 */}
              <div className="p-4 space-y-3">
                {matchAnalysis.dimensions.map((dimension, index) => {
                  const Icon = dimension.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg ${dimension.bgColor} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon size={16} className={dimension.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {dimension.name}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {dimension.score}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-500"
                            style={{ width: `${dimension.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 共同标签 */}
              {matchAnalysis.commonTags.length > 0 && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    共同兴趣
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchAnalysis.commonTags.map((tag, index) => (
                      <Tag
                        key={index}
                        color="accent"
                        variant="soft"
                        size="small"
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* 推荐话题 */}
              {matchAnalysis.suggestedTopics.length > 0 && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    推荐话题
                  </p>
                  <div className="space-y-2">
                    {matchAnalysis.suggestedTopics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <MessageCircle
                          size={14}
                          className="text-primary-500 mt-0.5 flex-shrink-0"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {topic}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 z-20">
          <div className="flex gap-3 max-w-lg mx-auto">
            <Button
              variant="outline"
              size="large"
              className="flex-1"
              icon={<MessageCircle size={18} />}
            >
              打招呼
            </Button>
            <Button
              variant="primary"
              size="large"
              className="flex-1"
              icon={<UserPlus size={18} />}
            >
              交换联系方式
            </Button>
          </div>
          <div className="h-safe-area-bottom" />
        </div>
      </div>
    </UserLayout>
  );
};

export default UserPublicProfile;
