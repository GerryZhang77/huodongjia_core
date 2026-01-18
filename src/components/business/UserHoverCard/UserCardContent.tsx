/**
 * UserCardContent - 用户卡片内容组件
 * 可独立使用或作为 UserHoverCard 的内容
 */

import { FC } from "react";
import { MapPin, Briefcase, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import type { UserCardContentProps } from "./types";

/**
 * 用户卡片内容
 */
export const UserCardContent: FC<UserCardContentProps> = ({
  user,
  matchScore,
  onViewProfile,
  className,
}) => {
  // 获取头像显示内容
  const getAvatarContent = () => {
    if (user.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <span className="text-lg font-semibold text-primary-600">
        {user.name.charAt(0)}
      </span>
    );
  };

  return (
    <div
      className={clsx(
        "w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg",
        "border border-gray-100 dark:border-gray-700",
        "overflow-hidden",
        className
      )}
    >
      {/* 顶部背景 + 头像 */}
      <div className="relative h-16 bg-gradient-to-br from-primary-400 to-primary-500">
        {/* 头像 */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
              {getAvatarContent()}
            </div>
          </div>
        </div>

        {/* 匹配度标签 */}
        {matchScore !== undefined && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 dark:bg-gray-800/90 rounded-full">
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
              匹配 {matchScore}%
            </span>
          </div>
        )}
      </div>

      {/* 用户信息 */}
      <div className="pt-8 px-4 pb-3">
        {/* 姓名和角色 */}
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {user.name}
          </h4>
          {user.role && (
            <span className="px-1.5 py-0.5 bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 text-[10px] font-medium rounded">
              {user.role}
            </span>
          )}
        </div>

        {/* 职业和城市 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
          {user.occupation && (
            <span className="flex items-center gap-1">
              <Briefcase size={12} />
              {user.occupation}
            </span>
          )}
          {user.city && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {user.city}
            </span>
          )}
        </div>

        {/* 标签 */}
        {user.tags && user.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {user.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded-full"
              >
                {tag}
              </span>
            ))}
            {user.tags.length > 3 && (
              <span className="px-2 py-0.5 text-gray-400 text-[10px]">
                +{user.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 查看详情按钮 */}
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          >
            查看详情
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCardContent;
