/**
 * 用户端"我的"页面（原名片页）
 * 整合个人资料卡片 + 我的活动列表 + 功能入口
 */

import { FC, useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit3,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Users,
  Heart,
  Settings,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Camera,
  Images,
  Phone,
  Mail,
  Fingerprint,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import dayjs from "dayjs";
import { Toast } from "@/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { UserLayout } from "@/components/layout/UserLayout";
import { useUserProfile, useUserActivities } from "@/features/user";
import { useUnreadCount } from "@/features/social";
import { userApi } from "@/services";
import type { UserProfile } from "@/services/userApi";
import type { UserActivity } from "@/services/userApi";
import { eventBus, EVENTS } from "@/utils/eventBus";

// ==================== 子组件 ====================

// 菜单项组件
const MenuItem: FC<{
  icon: React.ElementType;
  label: string;
  color?: string;
  badge?: number;
  onClick?: () => void;
}> = ({ icon: Icon, label, color = "text-gray-600", badge, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors"
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={color} />
      <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <ChevronRight size={16} className="text-gray-300 dark:text-gray-500" />
    </div>
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
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      icon: Clock,
      label: "报名中",
    },
    pending: {
      bg: "bg-yellow-50 dark:bg-yellow-900/30",
      text: "text-yellow-600 dark:text-yellow-400",
      icon: Clock,
      label: "待审核",
    },
    approved: {
      bg: "bg-green-50 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400",
      icon: CheckCircle,
      label: "已通过",
    },
    rejected: {
      bg: "bg-red-50 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400",
      icon: XCircle,
      label: "未通过",
    },
    completed: {
      bg: "bg-gray-50 dark:bg-gray-700",
      text: "text-gray-500 dark:text-gray-400",
      icon: CheckCircle,
      label: "已结束",
    },
    ended: {
      bg: "bg-gray-50 dark:bg-gray-700",
      text: "text-gray-500 dark:text-gray-400",
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
      className="w-full flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors text-left"
    >
      {/* 活动封面 */}
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={activity.coverImage}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 活动信息 */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
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

        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          <Calendar size={12} />
          <span>{dayjs(activity.eventStartTime).format("M月D日 HH:mm")}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <MapPin size={12} />
          <span className="truncate">{activity.location}</span>
        </div>
      </div>
    </button>
  );
};

// ==================== 主组件 ====================

const UserProfileCards: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 使用 hooks 获取数据
  const { data: profileData, isLoading: isLoadingProfile } = useUserProfile();
  const { data: activitiesData, isLoading: isLoadingActivities } =
    useUserActivities();
  // 私信未读数（用于菜单项 badge）
  const { data: unreadMsgCount } = useUnreadCount({ pollInterval: 30000 });

  // 用户资料状态（从 API 获取）
  const profile = useMemo<UserProfile | null>(() => {
    return profileData?.profile || null;
  }, [profileData]);

  // 我的活动状态
  const [activeStatusTab, setActiveStatusTab] =
    useState<ActivityStatusTab>("all");

  // 活动列表
  const myActivities = useMemo(() => {
    return activitiesData?.data?.activities || [];
  }, [activitiesData]);

  // 头像上传状态
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [idCopied, setIdCopied] = useState(false);

  // 监听资料更新事件（用于本地刷新）
  useEffect(() => {
    const handleProfileUpdate = () => {
      // TODO: 触发重新获取 profile
    };

    eventBus.on(EVENTS.PROFILE_UPDATED, handleProfileUpdate);
    return () => {
      eventBus.off(EVENTS.PROFILE_UPDATED, handleProfileUpdate);
    };
  }, []);

  // 过滤活动列表
  const filteredActivities = useMemo(() => {
    return myActivities.filter((activity) => {
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
  }, [myActivities, activeStatusTab]);

  // 处理头像上传
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      Toast.show({ icon: "fail", content: "请选择图片文件" });
      return;
    }

    // 验证文件大小（限制 5MB）
    if (file.size > 5 * 1024 * 1024) {
      Toast.show({ icon: "fail", content: "图片大小不能超过 5MB" });
      return;
    }

    setAvatarUploading(true);
    try {
      const res = await userApi.uploadAvatar(file);
      if (res.success && res.avatarUrl) {
        queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        Toast.show({ icon: "success", content: "头像更新成功" });
      } else {
        Toast.show({ icon: "fail", content: "上传失败，请重试" });
      }
    } catch (error) {
      console.error("头像上传失败:", error);
      Toast.show({ icon: "fail", content: "上传失败，请稍后重试" });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 加载中状态
  if (isLoadingProfile) {
    return (
      <UserLayout bgColor="bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">加载中...</div>
        </div>
      </UserLayout>
    );
  }

  // 无数据状态
  if (!profile) {
    return (
      <UserLayout bgColor="bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">无法获取用户信息</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout bgColor="bg-gray-100 dark:bg-gray-900">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {/* 头像和基本信息 */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* 头像 */}
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white dark:ring-gray-700 shadow"
                />
                <button
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shadow-md hover:bg-primary-600 active:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                >
                  <Camera size={10} className={avatarUploading ? "text-white animate-pulse" : "text-white"} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {profile.name}
                  </h2>
                  {profile.role && (
                    <span className="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-medium rounded">
                      {profile.role}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {profile.occupation && (
                    <span className="flex items-center gap-1">
                      <Briefcase size={11} />
                      {profile.occupation}
                    </span>
                  )}
                  {profile.company && (
                    <span className="flex items-center gap-1">
                      <Building2 size={11} />
                      {profile.company}
                    </span>
                  )}
                  {profile.city && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {profile.city}
                    </span>
                  )}
                </div>
              </div>
              {/* 编辑按钮 */}
              <button
                onClick={() => navigate("/u/profile/edit")}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit3 size={16} className="text-gray-400" />
              </button>
            </div>

            {/* 个人简介 */}
            {profile.bio && (
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-3 px-0.5">
                {profile.bio}
              </p>
            )}

            {/* 兴趣标签 */}
            {(profile.tags?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.tags!.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-600"
                  >
                    {tag}
                  </span>
                ))}
                {profile.tags!.length > 5 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    +{profile.tags!.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 联系方式 & 账号信息 */}
      <div className="px-4 md:px-6 lg:px-8 mt-4 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
          {profile.phone && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Phone size={16} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">手机号</p>
                <p className="text-sm text-gray-700 dark:text-gray-200">{profile.phone}</p>
              </div>
            </div>
          )}
          {profile.email && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Mail size={16} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">邮箱</p>
                <p className="text-sm text-gray-700 dark:text-gray-200">{profile.email}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 px-4 py-3">
            <Fingerprint size={16} className="text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">用户 ID</p>
              <p className="text-sm text-gray-700 dark:text-gray-200 font-mono truncate">{profile.id}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(profile.id);
                setIdCopied(true);
                Toast.show({ content: "已复制", duration: 1000 });
                setTimeout(() => setIdCopied(false), 1500);
              }}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {idCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* 照片墙 */}
      {profile.photos && profile.photos.length > 0 && (
        <div className="px-4 md:px-6 lg:px-8 mt-4 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Images size={14} />照片墙
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {profile.photos.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 我的活动区域 */}
      <div className="px-4 md:px-6 lg:px-8 mt-4 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {/* 标题和查看全部 */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              我的活动
            </h3>
            <button
              onClick={() => navigate("/u/activities/history")}
              className="text-xs text-primary-500 dark:text-primary-400 font-medium flex items-center gap-0.5"
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
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                    className="w-full flex items-center justify-center gap-1 py-2.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    <MoreHorizontal size={14} />
                    查看更多 ({filteredActivities.length - 3})
                  </button>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
          <MenuItem
            icon={MessageCircle}
            label="我的私信"
            color="text-blue-500"
            badge={unreadMsgCount}
            onClick={() => navigate("/u/messages")}
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

    </UserLayout>
  );
};

export default UserProfileCards;
