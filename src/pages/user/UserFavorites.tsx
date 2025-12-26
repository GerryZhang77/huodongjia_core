/**
 * 用户端收藏页面
 * 展示用户收藏的活动列表
 */

import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Calendar, MapPin, Trash2 } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { mockUserActivities, UserActivity } from "@/mocks/data/user-activities";
import dayjs from "dayjs";

// 格式化日期
const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format("M月D日 HH:mm");
};

// Mock 收藏数据 - 从 mockUserActivities 中随机选取一些
const mockFavorites = mockUserActivities.slice(0, 4);

const UserFavorites: FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<UserActivity[]>(mockFavorites);
  const [editMode, setEditMode] = useState(false);

  const handleRemove = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const handleActivityClick = (id: string) => {
    if (!editMode) {
      navigate(`/u/activities/${id}`);
    }
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
      topBarRightContent={
        <button
          onClick={() => setEditMode(!editMode)}
          className="text-sm text-primary-400 font-medium hover:text-primary-500 transition-colors"
        >
          {editMode ? "完成" : "编辑"}
        </button>
      }
    >
      <div className="md:py-6 lg:py-8">
        {/* 收藏数量 */}
        <div className="px-4 md:px-6 py-3 bg-slate-50">
          <p className="text-xs text-slate-400">共 {favorites.length} 个收藏</p>
        </div>

        {/* 收藏列表 */}
        <div className="px-4 md:px-6 py-4">
          {favorites.length === 0 ? (
            <div className="py-16 text-center">
              <Heart size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">还没有收藏活动</p>
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
                  editMode={editMode}
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
  editMode: boolean;
  onRemove: (id: string) => void;
  onClick: (id: string) => void;
}

const FavoriteCard: FC<FavoriteCardProps> = ({
  activity,
  editMode,
  onRemove,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(activity.id)}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex cursor-pointer hover:shadow-md hover:border-slate-200 transition-all duration-200"
    >
      {/* 封面 */}
      <div className="w-24 h-24 flex-shrink-0 relative">
        <img
          src={activity.coverImage}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
        {/* 收藏心形 */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
          <Heart size={14} className="text-red-500 fill-red-500" />
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
            {activity.title}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-500">
            <Calendar size={12} className="flex-shrink-0" />
            <span>{formatDate(activity.eventStartTime)}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="line-clamp-1">{activity.location}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-primary-500">免费</span>
          <span className="text-[10px] text-slate-400">
            {activity.currentParticipants}/{activity.maxParticipants}人
          </span>
        </div>
      </div>

      {/* 删除按钮（编辑模式） */}
      {editMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(activity.id);
          }}
          className="w-12 flex items-center justify-center bg-red-50 hover:bg-red-100 transition-colors"
        >
          <Trash2 size={18} className="text-red-500" />
        </button>
      )}
    </div>
  );
};

export default UserFavorites;
