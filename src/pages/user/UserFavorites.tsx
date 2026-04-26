/**
 * 用户端收藏页面
 * 展示用户收藏的活动列表
 */

import { FC, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Calendar, MapPin } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { UserLayout } from "@/components/layout/UserLayout";
import { useFavorites, useRemoveFavorite } from "@/features/user";
import type { UserActivity } from "@/services/userApi";
import dayjs from "dayjs";

// 格式化日期
const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format("M月D日 HH:mm");
};

const UserFavorites: FC = () => {
  const navigate = useNavigate();

  // 使用 hooks 获取收藏数据
  const { data: favoritesData, isLoading: _isLoading } = useFavorites();
  const removeFavoriteMutation = useRemoveFavorite();

  const favorites = useMemo(() => {
    return favoritesData?.data?.activities || [];
  }, [favoritesData]);

  const handleRemove = (id: string) => {
    removeFavoriteMutation.mutate(id, {
      onSuccess: () => Toast.show({ icon: "success", content: "已取消收藏" }),
      onError: (err) =>
        Toast.show({
          icon: "fail",
          content: err instanceof Error ? err.message : "操作失败",
        }),
    });
  };

  const handleActivityClick = (id: string) => {
    navigate(`/u/activities/${id}`);
  };

  return (
    <UserLayout
      showTabBar={true}
      showTopBar={true}
      showBreadcrumb={true}
      breadcrumbItems={[
        { label: "首页", path: "/u/home" },
        { label: "我的收藏" },
      ]}
    >
      <div className="md:py-6 lg:py-8">
        {/* 收藏数量 */}
        <div className="px-4 md:px-6 py-3 bg-slate-50 dark:bg-gray-800">
          <p className="text-xs text-slate-400 dark:text-gray-500">
            共 {favorites.length} 个收藏
          </p>
        </div>

        {/* 收藏列表 */}
        <div className="px-4 md:px-6 py-4">
          {favorites.length === 0 ? (
            <div className="py-16 text-center">
              <Heart
                size={40}
                className="text-slate-200 dark:text-gray-600 mx-auto mb-3"
              />
              <p className="text-slate-400 dark:text-gray-500 text-sm">
                还没有收藏活动
              </p>
              <button
                onClick={() => navigate("/u/discover")}
                className="mt-4 px-6 py-2 bg-primary-500 text-white text-sm font-medium rounded-full"
              >
                去发现
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((activity) => (
                <FavoriteCard
                  key={activity.id}
                  activity={activity}
                  onRemove={handleRemove}
                  onClick={handleActivityClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

// 收藏卡片组件
interface FavoriteCardProps {
  activity: UserActivity;
  onRemove: (id: string) => void;
  onClick: (id: string) => void;
}

const FavoriteCard: FC<FavoriteCardProps> = ({
  activity,
  onRemove,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(activity.id)}
      className="group bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 overflow-hidden flex cursor-pointer hover:shadow-md hover:border-slate-200 dark:hover:border-gray-600 transition-all duration-200"
    >
      {/* 封面 */}
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={activity.coverImage}
          alt={activity.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 内容 */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
            {activity.title}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-500 dark:text-gray-400">
            <Calendar size={12} className="flex-shrink-0" />
            <span>{formatDate(activity.eventStartTime)}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 dark:text-gray-400">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="line-clamp-1">{activity.location}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-primary-500">免费</span>
          <span className="text-[10px] text-slate-400 dark:text-gray-500">
            {activity.currentParticipants}/{activity.maxParticipants}人
          </span>
        </div>
      </div>

      {/* 取消收藏按钮（始终可见，单击直接取消） */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(activity.id);
        }}
        title="取消收藏"
        aria-label="取消收藏"
        className="w-12 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <Heart size={20} className="fill-red-500" />
      </button>
    </div>
  );
};

export default UserFavorites;
