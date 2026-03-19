/**
 * UserCard - 用户池用户卡片组件
 *
 * 展示聚合后的用户信息：姓名、标签、参与次数、活跃度等
 * 支持选择、点击查看详情
 */

import React from "react";
import { Check, Activity, Calendar } from "lucide-react";
import type { MerchantUser } from "@/features/merchant/user-pool/types";
import {
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVEL_COLORS,
  GENDER_LABELS,
} from "@/features/merchant/user-pool/types";

// ========================================
// 类型定义
// ========================================

export interface UserCardProps {
  user: MerchantUser;
  selected: boolean;
  onSelect: () => void;
  onClick?: () => void;
}

// ========================================
// 辅助函数
// ========================================

function getTagColor(tag: string): string {
  // 自定义标签颜色
  const customColors: Record<string, string> = {
    高价值用户: "bg-orange-100 text-orange-600",
    种子用户: "bg-purple-100 text-purple-600",
    社交达人: "bg-blue-100 text-blue-600",
    "KOL/KOC": "bg-yellow-100 text-yellow-600",
    待跟进: "bg-red-100 text-red-600",
    企业客户: "bg-green-100 text-green-600",
  };
  if (customColors[tag]) return customColors[tag];

  // 自动标签使用灰色
  return "bg-gray-100 text-gray-600";
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
}) => {
  // 合并所有标签（自定义标签优先展示）
  const allTags = [...user.customTags, ...user.autoTags];
  const displayTags = allTags.slice(0, 4);
  const extraTagCount = allTags.length - displayTags.length;

  return (
    <div
      className={`bg-white rounded-xl border p-4 transition-all cursor-pointer hover:shadow-sm ${
        selected ? "border-primary-400 bg-primary-50/30" : "border-gray-100"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* 选择框 */}
        <button
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <span className="text-primary-600 font-medium text-sm">
            {user.name.slice(0, 1)}
          </span>
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          {/* 第一行：名字 + 活跃度 */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 truncate">
              {user.name}
            </span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${ACTIVITY_LEVEL_COLORS[user.activityLevel]}`}
            >
              {ACTIVITY_LEVEL_LABELS[user.activityLevel]}
            </span>
          </div>

          {/* 第二行：基本信息 */}
          <div className="text-sm text-gray-500 space-x-3">
            {user.gender && (
              <span>{GENDER_LABELS[user.gender] || user.gender}</span>
            )}
            {user.age && <span>{user.age}岁</span>}
            {user.industry && <span>{user.industry}</span>}
            {user.city && <span>{user.city}</span>}
          </div>

          {/* 第三行：参与统计 */}
          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Activity size={12} />
              参与{user.participationCount}次
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              最近{formatDate(user.lastParticipatedAt)}
            </span>
          </div>

          {/* 第四行：标签 */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-0.5 text-xs rounded-full ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
              {extraTagCount > 0 && (
                <span className="text-xs text-gray-400">+{extraTagCount}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
