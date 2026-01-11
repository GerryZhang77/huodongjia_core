/**
 * 用户端"我的"页面（原名片页）
 * 整合个人资料卡片 + 我的活动列表 + 功能入口
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
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from "lucide-react";
import dayjs from "dayjs";
import { UserLayout } from "@/components/layout/UserLayout";
import {
  getUserProfile,
  updateUserProfile,
  tagColorMap,
  InterestTag,
  UserProfile,
} from "@/mocks/data/user-profile";
import { mockUserActivities, UserActivity } from "@/mocks/data/user-activities";
import { EditInterestsModal } from "./EditInterestsModal";
import { eventBus, EVENTS } from "@/utils/eventBus";

// ==================== 子组件 ====================

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

// 活动状态 Tab 类型
type ActivityStatusTab = "all" | "pending" | "approved" | "ended";

// 状态配置
const statusTabConfig: {
  key: ActivityStatusTab;
  label: string;
}[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "报名中" },
  { key: "approved", label: "已通过" },
  { key: "ended", label: "已结束" },
];

// 我的活动卡片组件
const MyActivityCard: FC<{
  activity: UserActivity;
  onClick: () => void;
}> = ({ activity, onClick }) => {
  // 状态样式映射
  const statusStyles: Record<
    string,
    { bg: string; text: string; icon: React.ElementType; label: string }
  > = {
    recruiting: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      icon: Clock,
      label: "报名中",
    },
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      icon: Clock,
      label: "待审核",
    },
    approved: {
      bg: "bg-green-50",
      text: "text-green-600",
      icon: CheckCircle,
      label: "已通过",
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-600",
      icon: XCircle,
      label: "未通过",
    },
    completed: {
      bg: "bg-gray-50",
      text: "text-gray-500",
      icon: CheckCircle,
      label: "已结束",
    },
    ended: {
      bg: "bg-gray-50",
      text: "text-gray-500",
      icon: CheckCircle,
      label: "已结束",
    },
  };

  // 判断活动是否已结束
  const isEnded = dayjs(activity.eventEndTime).isBefore(dayjs());
  const displayStatus = isEnded ? "ended" : activity.userStatus;
  const status = statusStyles[displayStatus] || statusStyles.pending;
  const StatusIcon = status.icon;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
    >
      {/* 活动封面 */}
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={activity.coverImage}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 活动信息 */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
            {activity.title}
          </h4>
          {/* 状态标签 */}
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
          >
            <StatusIcon size={12} />
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
          <Calendar size={12} />
          <span>{dayjs(activity.eventStartTime).format("M月D日 HH:mm")}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <MapPin size={12} />
          <span className="truncate">{activity.location}</span>
        </div>
      </div>
    </button>
  );
};

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

// ==================== 主组件 ====================

const UserProfileCards: FC = () => {
  const navigate = useNavigate();

  // 用户资料状态
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [showEditInterests, setShowEditInterests] = useState(false);

  // 我的活动状态
  const [activeStatusTab, setActiveStatusTab] =
    useState<ActivityStatusTab>("all");
  const [myActivities, setMyActivities] = useState<UserActivity[]>([]);

  // 加载用户活动数据
  useEffect(() => {
    setMyActivities(mockUserActivities);
  }, []);

  // 监听资料更新事件
  useEffect(() => {
    const handleProfileUpdate = () => {
      const updatedProfile = getUserProfile();
      setProfile(updatedProfile);
    };

    eventBus.on(EVENTS.PROFILE_UPDATED, handleProfileUpdate);
    return () => {
      eventBus.off(EVENTS.PROFILE_UPDATED, handleProfileUpdate);
    };
  }, []);

  // 过滤活动列表
  const filteredActivities = myActivities.filter((activity) => {
    const isEnded = dayjs(activity.eventEndTime).isBefore(dayjs());

    switch (activeStatusTab) {
      case "pending":
        return !isEnded && activity.userStatus === "pending";
      case "approved":
        return !isEnded && activity.userStatus === "approved";
      case "ended":
        return isEnded;
      default:
        return true;
    }
  });

  // 保存兴趣标签
  const handleSaveInterests = (tags: string[]) => {
    const newInterestTags: InterestTag[] = tags.map((name, index) => ({
      id: `tag_${Date.now()}_${index}`,
      name,
      colorType: getRandomColorType(),
    }));

    const updatedProfile = {
      ...profile,
      interestTags: newInterestTags,
    };
    setProfile(updatedProfile);
    updateUserProfile({ interestTags: newInterestTags });
  };

  return (
    <UserLayout bgColor="bg-gray-100">
      {/* 顶部背景 */}
      <div className="bg-gradient-to-br from-primary-400 to-primary-500 pt-4 pb-20 px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">我的</h1>
          <button
            onClick={() => navigate("/u/settings")}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 active:bg-white/40 transition-colors"
          >
            <Settings size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* 个人卡片 - 简化版 */}
      <div className="px-4 md:px-6 lg:px-8 -mt-16 relative z-10 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 头像和基本信息 */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow"
              />
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">
                    {profile.name}
                  </h2>
                  <span className="px-1.5 py-0.5 bg-primary-100 text-primary-600 text-[10px] font-medium rounded">
                    {profile.role}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Briefcase size={11} />
                    {profile.occupation}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {profile.city}
                  </span>
                </div>
              </div>
              {/* 编辑按钮 */}
              <button
                onClick={() => navigate("/u/profile/edit")}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <Edit3 size={16} className="text-gray-400" />
              </button>
            </div>

            {/* 兴趣标签 - 折叠显示 */}
            {profile.interestTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.interestTags.slice(0, 5).map((tag) => (
                  <TagChip key={tag.id} tag={tag} />
                ))}
                {profile.interestTags.length > 5 && (
                  <button
                    onClick={() => setShowEditInterests(true)}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
                  >
                    +{profile.interestTags.length - 5}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 我的活动区域 */}
      <div className="px-4 md:px-6 lg:px-8 mt-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 标题和查看全部 */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-gray-900">我的活动</h3>
            <button
              onClick={() => navigate("/u/activities/history")}
              className="text-xs text-primary-500 font-medium flex items-center gap-0.5"
            >
              查看全部
              <ChevronRight size={14} />
            </button>
          </div>

          {/* 状态筛选 Tab */}
          <div className="flex items-center gap-1 px-4 pb-3">
            {statusTabConfig.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStatusTab(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeStatusTab === tab.key
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 活动列表 */}
          <div className="px-3 pb-3">
            {filteredActivities.length > 0 ? (
              <div className="space-y-2">
                {filteredActivities.slice(0, 3).map((activity) => (
                  <MyActivityCard
                    key={activity.id}
                    activity={activity}
                    onClick={() => navigate(`/u/activities/${activity.id}`)}
                  />
                ))}
                {filteredActivities.length > 3 && (
                  <button
                    onClick={() => navigate("/u/activities/history")}
                    className="w-full flex items-center justify-center gap-1 py-2.5 text-xs text-gray-500 hover:text-primary-500 transition-colors"
                  >
                    <MoreHorizontal size={14} />
                    查看更多 ({filteredActivities.length - 3})
                  </button>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                暂无
                {statusTabConfig.find((t) => t.key === activeStatusTab)?.label}
                活动
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="px-4 md:px-6 lg:px-8 mt-4 mb-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
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
