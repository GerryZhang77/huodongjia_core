/**
 * 用户端名片页面
 * 简洁现代的个人资料展示
 */

import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  updateUserProfile,
  tagColorMap,
  InterestTag,
  UserProfile,
} from "@/mocks/data/user-profile";
import { EditInterestsModal } from "./EditInterestsModal";
import { eventBus, EVENTS } from "@/utils/eventBus";

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

// 标签颜色类型池（用于随机分配）
const TAG_COLOR_TYPES: InterestTag["colorType"][] = [
  "primary",
  "secondary",
  "accent",
  "warning",
  "default",
];

// 获取随机颜色类型
const getRandomColorType = (): InterestTag["colorType"] => {
  return TAG_COLOR_TYPES[Math.floor(Math.random() * TAG_COLOR_TYPES.length)];
};

const UserProfileCards: FC = () => {
  const navigate = useNavigate();

  // 本地状态：存储用户资料数据
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [showEditInterests, setShowEditInterests] = useState(false);

  // 监听资料更新事件 - 实现跨页面数据同步
  useEffect(() => {
    const handleProfileUpdate = () => {
      // 重新获取最新数据
      const updatedProfile = getUserProfile();
      setProfile(updatedProfile);
      console.log("资料已更新，重新加载数据");
    };

    // 注册事件监听
    eventBus.on(EVENTS.PROFILE_UPDATED, handleProfileUpdate);

    // 清理函数：组件卸载时移除监听
    return () => {
      eventBus.off(EVENTS.PROFILE_UPDATED, handleProfileUpdate);
    };
  }, []);

  // 保存兴趣标签
  const handleSaveInterests = (tags: string[]) => {
    // 1. 构建新的标签数据（添加 id 和颜色类型）
    const newInterestTags: InterestTag[] = tags.map((name, index) => ({
      id: `tag_${Date.now()}_${index}`, // 生成唯一 ID
      name,
      colorType: getRandomColorType(), // 随机分配颜色
    }));

    // 2. 更新本地 state（立即响应 UI）
    const updatedProfile = {
      ...profile,
      interestTags: newInterestTags,
    };
    setProfile(updatedProfile);

    // 3. 同步更新 mock 数据（保持数据一致性）
    updateUserProfile({ interestTags: newInterestTags });

    // TODO: 迁移到真实 API 时的替换步骤
    // ============================================
    // 第一步：引入 API 服务
    // import { userApi } from '@/services/api/user';
    //
    // 第二步：替换上面的 updateUserProfile 调用为：
    // try {
    //   const response = await userApi.updateInterestTags({
    //     userId: profile.id,
    //     tags: tags, // 只传标签名称数组即可
    //   });
    //
    //   // API 返回完整的标签数据（包含 id 和 colorType）
    //   setProfile({
    //     ...profile,
    //     interestTags: response.data.interestTags,
    //   });
    //
    //   // 可选：显示成功提示
    //   // toast.success('兴趣标签更新成功');
    // } catch (error) {
    //   console.error('更新兴趣标签失败:', error);
    //   // 显示错误提示
    //   // toast.error('更新失败，请重试');
    //   // 恢复原始数据
    //   // setProfile(profile);
    // }
    // ============================================

    console.log("已保存兴趣标签:", newInterestTags);
  };

  return (
    <UserLayout bgColor="bg-gray-100">
      {/* 顶部背景 */}
      <div className="bg-gradient-to-br from-primary-400 to-primary-500 pt-4 pb-20 px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">我的名片</h1>
          <button
            onClick={() => navigate("/u/settings")}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 active:bg-white/40 transition-colors"
          >
            <Settings size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* 个人卡片 */}
      <div className="px-4 md:px-6 lg:px-8 -mt-16 relative z-10 max-w-2xl mx-auto">
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
              <button
                onClick={() => navigate("/u/cards/edit")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
              >
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
      <div className="px-4 md:px-6 lg:px-8 mt-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">兴趣标签</h3>
            <button
              onClick={() => setShowEditInterests(true)}
              className="text-xs text-primary-500 font-medium"
            >
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
      <div className="px-4 md:px-6 lg:px-8 mt-4 mb-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          <MenuItem
            icon={Calendar}
            label="我的活动记录"
            color="text-primary-500"
            onClick={() => navigate("/u/activities/history")}
          />
          <MenuItem
            icon={Users}
            label="我的好友"
            color="text-green-500"
            onClick={() => navigate("/u/friends")}
          />
          <MenuItem
            icon={Heart}
            label="我的收藏"
            color="text-pink-500"
            onClick={() => navigate("/u/favorites")}
          />
          <MenuItem
            icon={Settings}
            label="账号设置"
            onClick={() => navigate("/u/settings")}
          />
        </div>
      </div>

      {/* 编辑兴趣标签弹窗 */}
      <EditInterestsModal
        open={showEditInterests}
        onClose={() => setShowEditInterests(false)}
        currentTags={profile.interestTags}
        onSave={handleSaveInterests}
      />
    </UserLayout>
  );
};

export default UserProfileCards;
