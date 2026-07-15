/**
 * DiscoveryUserCard - 发现用户卡片（脱敏版）
 *
 * 展示平台公域用户的脱敏信息：
 * - 昵称、头像、城市、行业、兴趣标签
 * - 匹配度指示
 * - 操作：查看详情、邀请活动、收藏
 * - 已解锁用户显示完整信息
 */

import React from "react";
import {
  MapPin,
  Briefcase,
  Heart,
  Lock,
  Unlock,
  Send,
  Star,
  Activity,
} from "lucide-react";
import type { PlatformUser } from "@/features/merchant/user-pool/types";
import { GENDER_LABELS } from "@/features/merchant/user-pool/types";

// ========================================
// 类型定义
// ========================================

export interface DiscoveryUserCardProps {
  user: PlatformUser;
  onViewDetail: (userId: string) => void;
  onInvite: (userId: string) => void;
  onToggleFavorite: (userId: string) => void;
  onUnlock?: (userId: string) => void;
}

// ========================================
// 辅助函数
// ========================================

function getMatchScoreColor(score: number): string {
  if (score >= 85) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 70) return "text-primary-600 bg-primary-50 border-primary-200";
  if (score >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-gray-600 bg-gray-50 border-gray-200";
}

function getMatchScoreLabel(score: number): string {
  if (score >= 85) return "极佳";
  if (score >= 70) return "良好";
  if (score >= 50) return "一般";
  return "较低";
}

function getInterestColor(interest: string): string {
  const colors: Record<string, string> = {
    创业: "bg-orange-100 text-orange-600",
    投资: "bg-green-100 text-green-600",
    设计: "bg-purple-100 text-purple-600",
    编程: "bg-blue-100 text-blue-600",
    营销: "bg-pink-100 text-pink-600",
    教育: "bg-cyan-100 text-cyan-600",
    健身: "bg-amber-100 text-amber-600",
    摄影: "bg-indigo-100 text-indigo-600",
  };
  // 默认根据字符hash选色
  for (const [key, color] of Object.entries(colors)) {
    if (interest.includes(key)) return color;
  }
  return "bg-gray-100 text-gray-600";
}

function formatLastActive(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "今天活跃";
  if (diffDays === 1) return "昨天活跃";
  if (diffDays <= 7) return `${diffDays}天前活跃`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)}周前活跃`;
  return `${Math.floor(diffDays / 30)}月前活跃`;
}

// ========================================
// 组件
// ========================================

const DiscoveryUserCard: React.FC<DiscoveryUserCardProps> = ({
  user,
  onViewDetail,
  onInvite,
  onToggleFavorite,
  onUnlock,
}) => {
  const displayName = user.isUnlocked
    ? user.name || user.nickname
    : user.nickname;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-primary-100 transition-all duration-200 group">
      <div className="flex gap-3">
        {/* 头像 + 匹配度 */}
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-medium">
                {displayName.charAt(0)}
              </div>
            )}
          </div>
          {/* 匹配度徽章 */}
          <div
            className={`absolute -bottom-1 -right-1 whitespace-nowrap rounded-full border px-1 py-0.5 text-[10px] font-bold tabular-nums ${getMatchScoreColor(user.matchScore)}`}
          >
            {user.matchScore}
          </div>
        </div>

        {/* 信息区 */}
        <div className="flex-1 min-w-0">
          {/* 第一行：名称 + 解锁标记 + 收藏 */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 text-sm truncate">
              {displayName}
            </span>
            {user.isUnlocked ? (
              <span className="flex flex-nowrap items-center gap-0.5 whitespace-nowrap rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] text-green-600">
                <Unlock size={10} />
                已解锁
              </span>
            ) : (
              <span className="flex flex-nowrap items-center gap-0.5 whitespace-nowrap rounded-full bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400">
                <Lock size={10} />
                未解锁
              </span>
            )}
            {user.gender && (
              <span className="text-xs text-gray-400">
                {GENDER_LABELS[user.gender]}
              </span>
            )}
            {user.ageGroup && (
              <span className="text-xs text-gray-400">{user.ageGroup}岁</span>
            )}

            {/* 收藏按钮 */}
            <button
              className="ml-auto flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(user.id);
              }}
            >
              <Heart
                size={16}
                className={`transition-colors ${
                  user.isFavorited
                    ? "fill-red-500 text-red-500"
                    : "text-gray-300 hover:text-red-400"
                }`}
              />
            </button>
          </div>

          {/* 第二行：城市 + 行业 + 职业 */}
          <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
            {user.city && (
              <span className="flex items-center gap-0.5">
                <MapPin size={11} />
                {user.city}
              </span>
            )}
            {user.industry && (
              <span className="flex items-center gap-0.5">
                <Briefcase size={11} />
                {user.industry}
              </span>
            )}
            {user.occupation && <span>{user.occupation}</span>}
          </div>

          {/* 第三行：兴趣标签 */}
          <div className="flex flex-wrap gap-1 mb-2">
            {user.interests.slice(0, 4).map((interest) => (
              <span
                key={interest}
                className={`max-w-full truncate whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] ${getInterestColor(interest)}`}
              >
                {interest}
              </span>
            ))}
            {user.interests.length > 4 && (
              <span className="whitespace-nowrap rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                +{user.interests.length - 4}
              </span>
            )}
          </div>

          {/* 第四行：活跃度 + 匹配评价 + 操作按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-0.5">
                <Activity size={11} />
                参与{user.participationCount}次活动
              </span>
              <span>{formatLastActive(user.lastActiveAt)}</span>
              <span
                className={`font-medium ${getMatchScoreColor(user.matchScore).split(" ")[0]}`}
              >
                匹配{getMatchScoreLabel(user.matchScore)}
              </span>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {!user.isUnlocked && onUnlock && (
                <button
          className="flex flex-nowrap items-center gap-1 whitespace-nowrap rounded-full bg-accent-50 px-2 py-1 text-[11px] font-medium text-accent-600 transition-colors hover:bg-accent-100 [&>svg]:shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnlock(user.id);
                  }}
                >
                  <Unlock size={11} />
                  解锁
                </button>
              )}
              <button
          className="flex flex-nowrap items-center gap-1 whitespace-nowrap rounded-full bg-primary-50 px-2 py-1 text-[11px] font-medium text-primary-600 transition-colors hover:bg-primary-100 [&>svg]:shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onInvite(user.id);
                }}
              >
                <Send size={11} />
                邀请
              </button>
            </div>
          </div>

          {/* 已解锁：显示额外信息 */}
          {user.isUnlocked && (user.company || user.bio) && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              {user.company && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
                  <Star size={11} className="text-accent-400" />
                  {user.company}
                </div>
              )}
              {user.bio && (
                <p className="text-xs text-gray-400 line-clamp-1">{user.bio}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 可点击查看详情 */}
      <button
        className="sr-only"
        onClick={() => onViewDetail(user.id)}
        aria-label={`查看 ${displayName} 的详情`}
      />
      {/* 整卡片可点击 */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => onViewDetail(user.id)}
        style={{ position: "absolute", inset: 0 }}
      />
    </div>
  );
};

// 外层包裹使 position:relative 生效
const DiscoveryUserCardWrapper: React.FC<DiscoveryUserCardProps> = (props) => (
  <div className="relative">
    <DiscoveryUserCard {...props} />
  </div>
);

export default DiscoveryUserCardWrapper;
