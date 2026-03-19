/**
 * UserDetailDrawer - 用户详情抽屉
 *
 * 从底部弹出的用户详情面板，展示：
 * 1. 用户基本信息（头像、姓名、性别、年龄、行业等）
 * 2. 标签管理（自动标签 + 自定义标签，支持添加/删除）
 * 3. 参与活动列表
 * 4. 操作按钮（打标签、推送活动）
 */

import React from "react";
import { Popup } from "antd-mobile";
import {
  X,
  Tag as TagIcon,
  Send,
  MapPin,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Star,
  UserCircle,
} from "lucide-react";
import type { MerchantUser } from "@/features/merchant/user-pool/types";
import {
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVEL_COLORS,
  GENDER_LABELS,
} from "@/features/merchant/user-pool/types";

// ========================================
// 类型定义
// ========================================

export interface UserDetailDrawerProps {
  /** 是否显示 */
  visible: boolean;
  /** 当前查看的用户 */
  user: MerchantUser | null;
  /** 关闭回调 */
  onClose: () => void;
  /** 打标签回调 */
  onTagUser?: (userId: string) => void;
  /** 推送活动回调 */
  onPushActivity?: (userId: string) => void;
}

// ========================================
// 辅助组件
// ========================================

/** 信息行 */
interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string | number | undefined;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon size={16} className="text-gray-400 flex-shrink-0" />
      <span className="text-sm text-gray-500 w-16 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 flex-1 truncate">{value}</span>
    </div>
  );
};

/** 标签组 */
interface TagGroupProps {
  title: string;
  tags: string[];
  variant: "custom" | "auto";
}

const TagGroup: React.FC<TagGroupProps> = ({ title, tags, variant }) => {
  if (tags.length === 0) return null;

  const getTagStyle = (tag: string): string => {
    if (variant === "custom") {
      // 自定义标签颜色映射
      const customColors: Record<string, string> = {
        高价值用户: "bg-orange-100 text-orange-600 border-orange-200",
        种子用户: "bg-purple-100 text-purple-600 border-purple-200",
        社交达人: "bg-blue-100 text-blue-600 border-blue-200",
        "KOL/KOC": "bg-yellow-100 text-yellow-600 border-yellow-200",
        待跟进: "bg-red-100 text-red-600 border-red-200",
        企业客户: "bg-green-100 text-green-600 border-green-200",
      };
      return (
        customColors[tag] || "bg-accent-50 text-accent-600 border-accent-200"
      );
    }
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div>
      <div className="text-xs text-gray-500 mb-2">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`px-2.5 py-1 text-xs rounded-full border ${getTagStyle(tag)}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

/** 活动参与记录项 */
interface ActivityItemProps {
  name: string;
  index: number;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ name, index }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-400 text-xs font-medium flex items-center justify-center flex-shrink-0">
      {index + 1}
    </div>
    <span className="text-sm text-gray-700 flex-1 truncate">{name}</span>
  </div>
);

// ========================================
// 主组件
// ========================================

const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  visible,
  user,
  onClose,
  onTagUser,
  onPushActivity,
}) => {
  // 格式化日期
  const formatDateFull = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  if (!user) return null;

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        maxHeight: "85vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">用户详情</h3>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* 内容区域 - 可滚动 */}
      <div className="flex-1 overflow-y-auto px-5 pb-32">
        {/* 用户头像 + 名字 + 活跃度 */}
        <div className="flex items-center gap-4 py-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-600 font-bold text-xl">
                {user.name.slice(0, 1)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {user.name}
              </h2>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-medium ${ACTIVITY_LEVEL_COLORS[user.activityLevel]}`}
              >
                {ACTIVITY_LEVEL_LABELS[user.activityLevel]}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {user.gender && (
                <span>{GENDER_LABELS[user.gender] || user.gender}</span>
              )}
              {user.age && <span>{user.age}岁</span>}
              {user.occupation && <span>{user.occupation}</span>}
            </div>
          </div>
        </div>

        {/* 参与统计卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-primary-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-primary-600">
              {user.participationCount}
            </div>
            <div className="text-xs text-primary-400 mt-0.5">参与活动</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-green-600">
              {formatDateFull(user.firstParticipatedAt)}
            </div>
            <div className="text-xs text-green-500 mt-0.5">首次参与</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-orange-600">
              {formatDateFull(user.lastParticipatedAt)}
            </div>
            <div className="text-xs text-orange-500 mt-0.5">最近参与</div>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
            <UserCircle size={16} className="text-gray-500" />
            基本信息
          </h4>
          <div className="bg-gray-50 rounded-xl px-4 py-1 divide-y divide-gray-100">
            <InfoRow icon={Briefcase} label="行业" value={user.industry} />
            <InfoRow icon={Building2} label="公司" value={user.company} />
            <InfoRow icon={MapPin} label="城市" value={user.city} />
            <InfoRow icon={Phone} label="手机" value={user.phone} />
            <InfoRow icon={Mail} label="邮箱" value={user.email} />
          </div>
        </div>

        {/* 个人简介 */}
        {user.bio && (
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              个人简介
            </h4>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">
              {user.bio}
            </p>
          </div>
        )}

        {/* 标签 */}
        <div className="mb-5 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <TagIcon size={16} className="text-gray-500" />
            标签
          </h4>
          <TagGroup
            title="自定义标签"
            tags={user.customTags}
            variant="custom"
          />
          <TagGroup title="自动标签" tags={user.autoTags} variant="auto" />
          {user.customTags.length === 0 && user.autoTags.length === 0 && (
            <p className="text-sm text-gray-400 py-2">暂无标签</p>
          )}
        </div>

        {/* 参与活动列表 */}
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
            <Star size={16} className="text-gray-500" />
            参与活动 ({user.participatedActivityNames.length})
          </h4>
          <div className="bg-gray-50 rounded-xl px-4">
            {user.participatedActivityNames.length > 0 ? (
              user.participatedActivityNames.map((name, idx) => (
                <ActivityItem key={name} name={name} index={idx} />
              ))
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                暂无参与记录
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 底部操作栏 - 固定在底部 */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3 safe-area-pb">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[22px] border border-accent-300 text-accent-600 font-medium text-sm hover:bg-accent-50 transition-colors"
          onClick={() => onTagUser?.(user.id)}
        >
          <TagIcon size={16} />
          打标签
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[22px] bg-gradient-to-br from-primary-400 to-primary-500 text-white font-medium text-sm shadow-sm hover:shadow-md transition-all"
          onClick={() => onPushActivity?.(user.id)}
        >
          <Send size={16} />
          推送活动
        </button>
      </div>
    </Popup>
  );
};

export default UserDetailDrawer;
