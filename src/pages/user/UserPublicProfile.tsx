import { FC } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Sparkles, AlertCircle } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui";
import { getPublicProfile } from "@/services/userApi";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { PublicProfileCard } from "@/features/user/profile";

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
          <PublicProfileCard
            profile={profile}
            isSelf={isSelf}
            authenticated={!!currentUser}
            fallbackName={fallbackName}
            onEdit={() =>
              navigate(
                `/u/profile/edit?redirect=${encodeURIComponent(
                  `/u/profile/${userId}${window.location.search}`,
                )}`,
              )
            }
            onAddPhotos={() =>
              navigate(
                `/u/profile/edit?redirect=${encodeURIComponent(
                  `/u/profile/${userId}${window.location.search}`,
                )}`,
              )
            }
          />

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
