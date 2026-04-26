/**
 * UserCard - 用户池用户卡片组件
 *
 * 两栏布局：
 * - 左侧：选择框 / 头像 / 用户主信息（姓名、人口属性、参与统计、来源活动）
 * - 右侧：商家标签（彩色，醒目）+ 兴趣自动标签（柔和灰色，二级信息）
 */

import React from "react";
import { Check, Activity, Calendar, CalendarRange } from "lucide-react";
import type {
  MerchantUser,
  CustomTag,
} from "@/features/merchant/user-pool/types";
import {
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVEL_COLORS,
  GENDER_LABELS,
} from "@/features/merchant/user-pool/types";
import { getCustomTagClassName } from "@/features/merchant/user-pool/utils/tagColors";

// ========================================
// 类型定义
// ========================================

export interface UserCardProps {
  user: MerchantUser;
  selected: boolean;
  onSelect: () => void;
  /** 卡片主点击：打开商家详情抽屉 */
  onClick?: () => void;
  /** 分组背景色（按活动分组时由父组件传入），不传则透明 */
  groupBg?: string;
  /** 活动 ID -> 活动名 查找表（用于补全后端缺失的活动名，避免显示 UUID） */
  activityNameById?: Map<string, string>;
  /** 商家自定义标签定义（含颜色），用于从 customTags 名字反查颜色 */
  customTagDefs?: CustomTag[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}

// ========================================
// 组件
// ========================================

const UserCard: React.FC<UserCardProps> = ({
  user,
  selected,
  onSelect,
  onClick,
  groupBg,
  activityNameById,
  customTagDefs,
}) => {
  // 商家自定义标签：name -> color 的查找表
  const customTagColorMap = React.useMemo(() => {
    const m = new Map<string, string>();
    (customTagDefs || []).forEach((t) => m.set(t.name, t.color));
    return m;
  }, [customTagDefs]);

  // 商家标签（最多 3 个，超出折叠）
  const merchantTags = user.customTags || [];
  const visibleMerchantTags = merchantTags.slice(0, 3);
  const extraMerchantTagCount = merchantTags.length - visibleMerchantTags.length;

  // 兴趣 / 自动标签（最多 3 个，超出折叠）
  const interestTags = user.autoTags || [];
  const visibleInterestTags = interestTags.slice(0, 3);
  const extraInterestTagCount =
    interestTags.length - visibleInterestTags.length;

  // 来源活动展示（最多 2 个 + "+N"）
  const activityIds = user.participatedActivityIds || [];
  const activityNames = user.participatedActivityNames || [];
  const resolvedActivities = activityIds.map((id, i) => {
    const fromList = activityNames[i];
    const name = (fromList && fromList.trim())
      ? fromList
      : (activityNameById?.get(id) || "未命名活动");
    return { id, name };
  });
  const visibleActivities = resolvedActivities.slice(0, 2);
  const extraActivityCount =
    resolvedActivities.length - visibleActivities.length;

  return (
    <div
      className={`group rounded-xl border p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-px ${
        selected
          ? "border-primary-400 bg-primary-50/30 shadow-sm"
          : `${groupBg || "bg-white"} border-gray-100 hover:border-gray-200`
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* 选择框 */}
        <button
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
            selected
              ? "bg-primary-400 border-primary-400"
              : "border-gray-300 hover:border-primary-400"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {selected && <Check size={12} className="text-white" />}
        </button>

        {/* 头像 */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              loading="lazy"
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <span className="text-primary-600 font-medium text-sm">
              {user.name.slice(0, 1)}
            </span>
          )}
        </div>

        {/* 主体两栏：左 信息 / 右 标签 */}
        <div className="flex-1 min-w-0 flex items-start gap-3">
          {/* ========= 左：用户主信息 ========= */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* 姓名 + 活跃度 */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {user.name}
              </span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${ACTIVITY_LEVEL_COLORS[user.activityLevel]}`}
              >
                {ACTIVITY_LEVEL_LABELS[user.activityLevel]}
              </span>
            </div>

            {/* 人口属性 */}
            {(user.gender || user.age || user.industry || user.city) && (
              <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5">
                {user.gender && (
                  <span>{GENDER_LABELS[user.gender] || user.gender}</span>
                )}
                {user.age && <span>{user.age}岁</span>}
                {user.industry && <span className="truncate">{user.industry}</span>}
                {user.city && <span>{user.city}</span>}
              </div>
            )}

            {/* 参与统计 */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Activity size={12} />
                参与 {user.participationCount} 次
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                最近 {formatDate(user.lastParticipatedAt)}
              </span>
            </div>

            {/* 来源活动 */}
            {visibleActivities.length > 0 && (
              <div className="flex items-start gap-1 text-xs text-gray-500">
                <CalendarRange
                  size={12}
                  className="mt-0.5 flex-shrink-0 text-gray-400"
                />
                <div className="flex flex-wrap gap-1">
                  {visibleActivities.map((a) => (
                    <span
                      key={a.id}
                      className="px-1.5 py-0.5 rounded bg-gray-50 text-gray-600 max-w-[160px] truncate"
                      title={a.name}
                    >
                      {a.name}
                    </span>
                  ))}
                  {extraActivityCount > 0 && (
                    <span className="text-gray-400">+{extraActivityCount}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========= 右：商家标签栏（彩色，醒目） ========= */}
          {visibleMerchantTags.length > 0 && (
            <div className="flex-shrink-0 w-32 sm:w-40 flex flex-wrap justify-end items-start gap-1">
              {visibleMerchantTags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-0.5 text-xs rounded-full font-medium max-w-[120px] truncate ${getCustomTagClassName(
                    customTagColorMap.get(tag),
                  )}`}
                  title={tag}
                >
                  {tag}
                </span>
              ))}
              {extraMerchantTagCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs text-gray-400">
                  +{extraMerchantTagCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========= 底部一行：兴趣 / 自动标签（柔和灰色，全宽） ========= */}
      {visibleInterestTags.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-gray-50 flex flex-wrap items-center gap-1">
          <span className="text-[11px] text-gray-400 mr-1">兴趣</span>
          {visibleInterestTags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[11px] rounded text-gray-500 bg-gray-50 border border-gray-100"
            >
              {tag}
            </span>
          ))}
          {extraInterestTagCount > 0 && (
            <span className="px-1 py-0.5 text-[11px] text-gray-400">
              +{extraInterestTagCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UserCard;
