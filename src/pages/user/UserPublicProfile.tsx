import { FC } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, MapPin, Briefcase, Building2, Heart,
  Sparkles, AlertCircle, Images,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button, Tag } from "@/components/ui";
import { getPublicProfile } from "@/services/userApi";
import { FollowButton, MessageButton, useSocialStats } from "@/features/social";
import { useAuthStore } from "@/features/auth/stores/authStore";

const UserPublicProfile: FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activityId = searchParams.get("activityId");
  const activityName = searchParams.get("activityName");
  // 上游（如商家匹配页）传入的参与者昵称，当 users 表资料空时兜底
  const fallbackName = searchParams.get("fallbackName");

  const { data, isLoading } = useQuery({
    queryKey: ["publicProfile", userId],
    queryFn: () => getPublicProfile(userId!),
    enabled: !!userId,
  });

  const profile = data?.profile;
  const { user: currentUser } = useAuthStore();
  const isSelf = currentUser?.id === userId;
  const { data: stats } = useSocialStats(userId);
  const displayName =
    (profile?.name && profile.name.trim()) ||
    fallbackName ||
    "匿名用户";
  const hasAnyDetail = Boolean(
    profile?.occupation || profile?.company || profile?.bio ||
      (profile?.tags && profile.tags.length > 0),
  );

  // 返回：若有历史则回退，否则回到商家活动列表/用户首页
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (isLoading) {
    return (
      <UserLayout showTabBar={false} showTopBar={false}>
        <div className="flex items-center justify-center min-h-screen text-gray-400">加载中...</div>
      </UserLayout>
    );
  }

  if (!profile) {
    return (
      <UserLayout showTabBar={false} showTopBar={false}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
          <AlertCircle size={40} className="text-gray-300" />
          <p className="text-gray-500">用户不存在</p>
          <Button variant="primary" onClick={handleBack}>返回</Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout showTabBar={false} showTopBar={false} bgColor="bg-gray-50">
      <div className="min-h-screen pb-8">
        {/* 渐变头部 */}
        <div className="bg-gradient-to-br from-primary-400 to-accent-500 pt-12 pb-20 px-4 relative">
          <button
            onClick={handleBack}
            className="absolute left-4 top-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
        </div>

        <div className="px-4 -mt-12 relative z-10 space-y-4 max-w-lg mx-auto">
          {/* 主卡片 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-visible">
            <div className="px-4 -mt-10 flex items-end justify-between">
              <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-xl">
                <img
                  src={profile.avatar}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {!isSelf && userId && (
                <div className="pb-1 flex items-center gap-2">
                  <FollowButton userId={userId} />
                  <MessageButton userId={userId} />
                </div>
              )}
            </div>
            <div className="px-4 pt-3 pb-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {displayName}
              </h1>
              {/* 社交统计 */}
              {stats && (
                <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {stats.followingCount}
                    </span>{" "}
                    关注
                  </span>
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {stats.followersCount}
                    </span>{" "}
                    粉丝
                  </span>
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {stats.friendsCount}
                    </span>{" "}
                    好友
                  </span>
                </div>
              )}
              {hasAnyDetail ? (
                <>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {profile.occupation && <span className="flex items-center gap-1"><Briefcase size={13} />{profile.occupation}</span>}
                    {profile.company && <span className="flex items-center gap-1"><Building2 size={13} />{profile.company}</span>}
                    {profile.city && <span className="flex items-center gap-1"><MapPin size={13} />{profile.city}</span>}
                  </div>
                  {profile.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-3">{profile.bio}</p>
                  )}
                  {profile.tags && profile.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.tags.map((tag, i) => (
                        <Tag key={i} color="primary" variant="soft" size="small">{tag}</Tag>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  该用户尚未完善个人资料
                </p>
              )}
            </div>
          </div>

          {/* 照片墙 */}
          {profile.photos && profile.photos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Images size={14} />照片墙
              </h3>
              <div className="grid grid-cols-3 gap-1.5">
                {profile.photos.map((url, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 匹配分析（有活动上下文时显示占位） */}
          {activityId && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-accent-500" />匹配分析
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <Heart size={14} className="text-pink-400" />
                <span>基于活动「{activityName || activityId}」的匹配数据</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default UserPublicProfile;
