/**
 * 用户端名片页面
 * 简洁现代的个人资料展示
 */

import { FC } from "react";
import {
  Edit3,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  Heart,
  Settings,
  ChevronRight,
  Share2,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import {
  getUserProfile,
  tagColorMap,
  InterestTag,
} from "@/mocks/data/user-profile";

// 标签组件
const TagChip: FC<{ tag: InterestTag }> = ({ tag }) => {
  const colors = tagColorMap[tag.colorType];
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {tag.name}
    </span>
  );
};

// 统计项组件
const StatItem: FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-xl font-bold text-gray-900">{value}</p>
    <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
  </div>
);

// 菜单项组件
const MenuItem: FC<{
  icon: React.ElementType;
  label: string;
  color?: string;
  onClick?: () => void;
}> = ({ icon: Icon, label, color = "text-gray-600", onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={color} />
      <span className="text-sm text-gray-700">{label}</span>
    </div>
    <ChevronRight size={16} className="text-gray-300" />
  </button>
);

const UserProfileCards: FC = () => {
  const profile = getUserProfile();

  return (
    <UserLayout bgColor="bg-gray-100">
      {/* 顶部背景 */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 pt-4 pb-20 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">我的名片</h1>
          <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Settings size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* 个人卡片 */}
      <div className="px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 头像和基本信息 */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow"
              />
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">
                    {profile.name}
                  </h2>
                  <span className="px-1.5 py-0.5 bg-primary-100 text-primary-600 text-[10px] font-medium rounded">
                    {profile.role}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Briefcase size={12} />
                  <span>{profile.occupation}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin size={12} />
                  <span>{profile.city}</span>
                </div>
              </div>
            </div>

            {/* 个人简介 */}
            <p className="text-sm text-gray-600 mt-3 leading-relaxed line-clamp-2">
              {profile.bio}
            </p>

            {/* 操作按钮 */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
                <Edit3 size={14} />
                编辑名片
              </button>
              <button className="w-11 h-11 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                <Share2 size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="flex items-center justify-around py-4 border-t border-gray-100">
            <StatItem value={profile.stats.activitiesJoined} label="参与活动" />
            <div className="w-px h-8 bg-gray-100" />
            <StatItem value={profile.stats.matchedFriends} label="匹配好友" />
            <div className="w-px h-8 bg-gray-100" />
            <StatItem
              value={profile.stats.favoritedActivities}
              label="收藏活动"
            />
          </div>
        </div>
      </div>

      {/* 兴趣标签 */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">兴趣标签</h3>
            <button className="text-xs text-primary-500 font-medium">
              编辑
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.interestTags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="px-4 mt-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          <MenuItem
            icon={Calendar}
            label="我的活动记录"
            color="text-primary-500"
          />
          <MenuItem icon={Users} label="我的好友" color="text-green-500" />
          <MenuItem icon={Heart} label="我的收藏" color="text-pink-500" />
          <MenuItem icon={Settings} label="账号设置" />
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProfileCards;
