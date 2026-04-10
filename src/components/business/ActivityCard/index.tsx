/**
 * ActivityCard - 通用活动卡片组件
 *
 * 用途: 展示活动信息的统一卡片
 * 复用于: 发现页、活动记录、收藏列表等
 *
 * 设计规范:
 * - 圆角: 16px
 * - 阴影: shadow-card
 * - 悬停效果: 上移 + 阴影增强
 */

import { FC } from "react";
import { clsx } from "clsx";
import { Calendar, MapPin, Users, Heart, Trash2 } from "lucide-react";
import { Tag } from "@/components/ui";
import dayjs from "dayjs";
import type { ActivityCardProps } from "./types";

// 用户状态配置
const userStatusConfig = {
  recruiting: { color: "primary" as const, text: "报名中" },
  pending: { color: "warning" as const, text: "待审核" },
  approved: { color: "success" as const, text: "已通过" },
  completed: { color: "gray" as const, text: "已结束" },
};

// 格式化日期
const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format("M月D日 HH:mm");
};

/**
 * ActivityCard 组件
 */
export const ActivityCard: FC<ActivityCardProps> = ({
  activity,
  onClick,
  showUserStatus = true,
  showFavorite = false,
  isFavorited = false,
  onToggleFavorite,
  editMode = false,
  onRemove,
  className,
}) => {
  const {
    id,
    title,
    coverImage,
    eventStartTime,
    location,
    maxParticipants,
    currentParticipants,
    tags,
    userStatus,
    organizer,
  } = activity;

  const statusConfig = userStatusConfig[userStatus];

  const handleClick = () => {
    if (!editMode) {
      onClick?.(id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(id);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(id);
  };

  return (
    <div
      className={clsx(
        "relative bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden",
        "transition-all duration-200",
        !editMode &&
          "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      {/* 封面图 */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* 用户状态标签 */}
        {showUserStatus && (
          <div className="absolute top-3 left-3">
            <Tag color={statusConfig.color} variant="filled" size="small">
              {statusConfig.text}
            </Tag>
          </div>
        )}

        {/* 收藏按钮 */}
        {showFavorite && !editMode && (
          <button
            onClick={handleFavoriteClick}
            className={clsx(
              "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center",
              "transition-all duration-200",
              isFavorited
                ? "bg-error-500 text-white"
                : "bg-white/90 backdrop-blur-sm text-gray-400 hover:text-error-500"
            )}
          >
            <Heart size={18} className={isFavorited ? "fill-current" : ""} />
          </button>
        )}

        {/* 删除按钮 (编辑模式) */}
        {editMode && onRemove && (
          <button
            onClick={handleRemoveClick}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-error-500 text-white flex items-center justify-center hover:bg-error-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* 内容区 */}
      <div className="p-4">
        {/* 标题 */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
          {title}
        </h3>

        {/* 信息 */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={14} className="flex-shrink-0" />
            <span className="truncate">4月10日 18:00</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Users size={14} className="flex-shrink-0" />
            <span>
              {currentParticipants}/{maxParticipants} 人
            </span>
          </div>
        </div>

        {/* 标签 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <Tag key={index} color="gray" variant="soft" size="small">
                {tag}
              </Tag>
            ))}
          </div>
        )}

        {/* 组织者 */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <img
            src={organizer.avatar}
            alt={organizer.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {organizer.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
