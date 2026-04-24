/**
 * 用户端匹配结果页面
 * 路由: /u/activities/:id/match-result
 *
 * 展示当前用户的 top5 最佳匹配列表。
 * 说明：后端不再区分"分组"与"最佳匹配"—— 每个用户的"小组"就是其 top5 匹配。
 */

import { FC, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ChevronRight,
  Smartphone,
  Trophy,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Tag } from "@/components/ui";
import { UserHoverCard } from "@/components/business/UserHoverCard";
import { NFCTouchModal } from "@/components/business/NFCTouchModal";
import { useActivityDetail } from "@/features/user";
import { useBestMatches } from "@/features/user/hooks/useBestMatches";
import { generateDefaultAvatar } from "@/utils/avatar";
import dayjs from "dayjs";

interface TopMatchUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  occupation?: string;
  company?: string;
  industry?: string;
  city?: string;
  gender?: "male" | "female" | "other";
  age?: number;
  bio?: string;
  tags?: string[];
  matchScore: number;
  rank: number;
  commonTags: string[];
}

const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format("M月D日");
};

const normalizeGender = (g?: string): "male" | "female" | "other" | undefined => {
  if (!g) return undefined;
  if (g === "male" || g === "男") return "male";
  if (g === "female" || g === "女") return "female";
  return "other";
};

const UserMatchResult: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showNFCModal, setShowNFCModal] = useState(false);

  const { data: activityData, isLoading } = useActivityDetail(id);

  const {
    data: bestMatchesData,
    loading: matchLoading,
    error: matchError,
  } = useBestMatches(id);

  const activity = useMemo(() => activityData?.data, [activityData]);

  const topMatches: TopMatchUser[] = useMemo(() => {
    if (!bestMatchesData || bestMatchesData.length === 0) return [];
    return bestMatchesData.map((user) => {
      const userRecord = user as typeof user & { bio?: string };
      return {
        id: user.user_id,
        name: user.name,
        avatar: user.avatar || generateDefaultAvatar(user.user_id),
        role: user.occupation || "参与者",
        occupation: user.occupation,
        company: user.company,
        industry: user.industry,
        city: user.city,
        gender: normalizeGender(user.gender),
        age: user.age,
        bio: userRecord.bio,
        tags: user.tags || [],
        matchScore: user.matchScore,
        rank: user.rank,
        commonTags: user.tags?.slice(0, 2) || [],
      };
    });
  }, [bestMatchesData]);

  const supportsNFC = Boolean(
    (activity as { enableNfc?: boolean } | undefined)?.enableNfc,
  );

  const handleNavigateToProfile = (userId: string) => {
    if (!userId) return;
    // 把已知的姓名作为 fallback 透传到详情页，避免详情页回退到"用户 xxxxxxxx"
    const match = topMatches.find((u) => u.id === userId);
    const qs = new URLSearchParams();
    if (id) qs.set("activityId", id);
    if (activity?.title) qs.set("activityName", activity.title);
    if (match?.name && match.name !== "未知用户") {
      qs.set("fallbackName", match.name);
    }
    navigate(`/u/profile/${userId}?${qs.toString()}`);
  };

  // 加载中
  if (isLoading || matchLoading) {
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
          <AlertCircle size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">活动不存在</p>
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
        {/* 头部 */}
        <header className="bg-gradient-to-br from-accent-400 to-accent-500 pt-6 pb-6 px-4 md:px-6">
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">匹配结果</h1>
            <p className="text-sm text-white/80 mt-1">
              {activity.title}
              {activity.eventStartTime && ` · ${formatDate(activity.eventStartTime)}`}
            </p>
          </div>
        </header>

        {/* 主内容 */}
        <div className="px-4 md:px-6 py-4">
          {matchError ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <AlertCircle size={36} className="mx-auto mb-3 text-orange-400" />
              <p className="text-sm text-gray-600 mb-2">{matchError}</p>
              <p className="text-xs text-gray-400">
                若活动方尚未完成匹配，请稍后再试
              </p>
            </div>
          ) : topMatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-accent-50 flex items-center justify-center">
                <Trophy size={24} className="text-accent-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                匹配结果暂未出炉
              </h3>
              <p className="text-sm text-gray-500">
                活动方正在为您寻找最合适的伙伴，请稍候
              </p>
            </div>
          ) : (
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

                    {/* 头像 + HoverCard */}
                    <UserHoverCard
                      user={{
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar,
                        role: user.role,
                        occupation: user.occupation,
                        company: user.company,
                        industry: user.industry,
                        city: user.city,
                        gender: user.gender,
                        age: user.age,
                        bio: user.bio,
                        tags: user.tags,
                      }}
                      matchScore={user.matchScore}
                      onViewProfile={handleNavigateToProfile}
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

                      {(user.company || user.industry || user.city) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                          {[user.company, user.industry, user.city]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}

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

                    {/* 匹配分数 - 暂时隐藏 */}
                    {/* <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-accent-500">
                        {user.matchScore}
                      </p>
                      <p className="text-[10px] text-gray-400">匹配分</p>
                    </div> */}
                  </div>

                  {/* 查看详情 */}
                  <button
                    onClick={() => handleNavigateToProfile(user.id)}
                    className="w-full mt-3 py-2 text-xs text-accent-500 bg-accent-50 dark:bg-accent-900/20 rounded-lg flex items-center justify-center gap-1 hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-colors"
                  >
                    查看个人主页
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="fixed bottom-14 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 z-30 safe-area-bottom">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={() => navigate(`/u/activities/${id}`)}
              className="flex-1 h-12 rounded-[22px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              查看活动详情
            </button>
            {supportsNFC && (
              <button
                onClick={() => setShowNFCModal(true)}
                className="h-12 px-4 rounded-[22px] bg-gradient-to-r from-primary-400 to-primary-500 text-white font-semibold text-sm shadow-lg shadow-primary-400/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Smartphone size={18} />
                NFC 碰一碰
              </button>
            )}
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

export default UserMatchResult;
