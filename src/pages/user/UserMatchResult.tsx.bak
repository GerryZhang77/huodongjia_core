/**
 * 用户端匹配结果页面
 * 根据设计稿 07-match-result.svg 和 05-desktop-match-result.svg 实现
 */

import { FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Users,
  Cake,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { getActivityById } from "@/mocks/data/user-activities";
import dayjs from "dayjs";

// Mock 匹配结果数据
const mockMatchResult = {
  groupName: "A",
  matchScore: 92,
  members: [
    {
      id: "m1",
      name: "小明",
      avatar: "https://i.pravatar.cc/100?img=1",
      role: "产品经理",
      isCurrentUser: true,
      bgColor: "bg-blue-100",
    },
    {
      id: "m2",
      name: "小红",
      avatar: "https://i.pravatar.cc/100?img=2",
      role: "产品",
      bgColor: "bg-orange-100",
    },
    {
      id: "m3",
      name: "大伟",
      avatar: "https://i.pravatar.cc/100?img=3",
      role: "设计",
      bgColor: "bg-purple-100",
    },
    {
      id: "m4",
      name: "婷婷",
      avatar: "https://i.pravatar.cc/100?img=4",
      role: "运营",
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
  otherGroups: [
    { name: "B", members: 4, score: 88 },
    { name: "C", members: 4, score: 85 },
    { name: "D", members: 4, score: 82 },
  ],
};

// 格式化日期
const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format("M月D日");
};

const UserMatchResult: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const activity = id ? getActivityById(id) : undefined;
  const result = mockMatchResult;

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
      {/* 页面内容 */}
      <div className="min-h-screen">
        {/* 紫色渐变头部 */}
        <header className="bg-gradient-to-br from-accent-400 to-accent-500 pt-6 pb-24 px-4 md:px-6 relative">
          {/* 标题 */}
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">我的分组</h1>
            <p className="text-sm text-white/80 mt-1">
              {activity.title} · {formatDate(activity.eventStartTime)}
            </p>
          </div>
        </header>

        {/* 主卡片区域 */}
        <div className="px-4 md:px-6 -mt-20 relative z-10">
          {/* 主卡片 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-accent-500/15 overflow-hidden">
            {/* 分组徽章 */}
            <div className="flex justify-center -mt-4">
              <div className="px-6 py-2 bg-accent-400 rounded-full shadow-lg">
                <span className="text-white font-bold">
                  {result.groupName} 组
                </span>
              </div>
            </div>

            {/* 匹配度得分 */}
            <div className="text-center py-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                小组匹配度
              </p>
              <p className="text-5xl font-bold text-accent-500">
                {result.matchScore}%
              </p>
              {/* 进度条 */}
              <div className="mx-auto mt-4 w-56 h-2 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${result.matchScore}%` }}
                />
              </div>
            </div>

            {/* 成员头像 */}
            <div className="px-6 pb-6">
              <div className="flex justify-center gap-4 flex-wrap">
                {result.members.map((member) => (
                  <div key={member.id} className="text-center">
                    <div
                      className={`w-14 h-14 rounded-full ${member.bgColor} flex items-center justify-center overflow-hidden`}
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
                ))}
              </div>
            </div>
          </div>

          {/* 匹配理由 */}
          <div className="mt-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
              为什么我们被分在一组？
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              {result.reasons.map((reason, index) => {
                const Icon = reason.icon;
                return (
                  <div
                    key={reason.id}
                    className={`flex items-center gap-3 p-4 ${
                      index !== result.reasons.length - 1
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

          {/* 小组交流 */}
          <div className="mt-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
              小组交流
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-400 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {result.groupName}组群聊
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {result.members.length}人 · 已建立微信群
                </p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-accent-400 to-accent-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-accent-400/30">
                进入群聊
              </button>
            </div>
          </div>

          {/* 温馨提示 */}
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
            <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">
              温馨提示
            </p>
            <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
              <li>• 活动当天请于8:50前到达集合点</li>
              <li>• 请穿着舒适运动鞋，携带防晒用品</li>
            </ul>
          </div>

          {/* 其他分组（桌面端显示）*/}
          <div className="mt-6 hidden lg:block">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
              活动其他分组
            </h3>
            <div className="flex gap-3">
              {result.otherGroups.map((group) => (
                <div
                  key={group.name}
                  className="flex-1 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl text-center"
                >
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {group.name} 组
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {group.members}人 · {group.score}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="sticky bottom-0 left-0 right-0 mt-8 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 md:px-6">
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/u/activities/${id}`)}
              className="flex-1 h-12 rounded-[22px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              查看活动详情
            </button>
            <button className="flex-1 h-12 rounded-[22px] bg-gradient-to-r from-accent-400 to-accent-500 text-white font-semibold text-sm shadow-lg shadow-accent-400/30 hover:shadow-xl hover:shadow-accent-400/40 active:scale-[0.98] transition-all">
              联系组员
            </button>
          </div>
          <div className="h-safe-area-bottom" />
        </div>
      </div>
    </UserLayout>
  );
};

export default UserMatchResult;
