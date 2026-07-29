/**
 * 个人中心页面 (商家端)
 * 显示商家资料、设置、退出登录等
 */

import React, { useState, useRef } from "react";
import {
  useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  User,
  Building,
  Phone,
  Mail,
  Calendar,
  Settings,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  Edit,
  Camera,
  Moon,
  Sun,
  Monitor,
  Copy,
  Check,
  Fingerprint,
  Eye,
  EyeOff,
  Briefcase,
  MapPin,
  MessageCircle,
  Layers,
  Quote,
  } from "lucide-react";
import { Dialog,
  Popup,
} from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import { MerchantLayout } from "@/components/layout";
import type {
  MerchantProfileResponse,
  MerchantPrivacySettings,
} from "@/services";
import { useStore } from "@/store";
import { useThemeStore } from "@/store/themeStore";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { useSocialStats } from "@/features/social";
import { useImageUpload } from "@/features/uploads";
import { useLogout } from "@/features/auth/hooks";
import { useMerchantProfile } from "@/features/merchant/hooks";
import { merchantQueryKeys } from "@/features/merchant/queryKeys";

const PROFILE_KEY = merchantQueryKeys.profile();

/**
 * 菜单项组件
 */
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
  onClick?: () => void;
  danger?: boolean;
  showArrow?: boolean;
  /** 该字段在公开主页是否可见；undefined 时不展示标识 */
  isPublic?: boolean;
}

const PublicBadge: React.FC<{ isPublic: boolean }> = ({ isPublic }) => (
  <span
      className={`inline-flex flex-nowrap items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
      isPublic
        ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
    }`}
    title={isPublic ? "其他用户可见" : "仅自己可见"}
  >
    {isPublic ? <Eye size={10} /> : <EyeOff size={10} />}
    {isPublic ? "公开" : "私密"}
  </span>
);

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  value,
  onClick,
  danger = false,
  showArrow = true,
  isPublic,
}) => {
  return (
    <button
      className={`w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        danger ? "text-error-500" : "text-gray-700 dark:text-gray-200"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <span
          className={
            danger ? "text-error-500" : "text-gray-400 dark:text-gray-500"
          }
        >
          {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
        {isPublic !== undefined && <PublicBadge isPublic={isPublic} />}
      </div>
      <div className="flex items-center gap-2">
        {value !== undefined && (
          <span className="text-sm text-gray-400 dark:text-gray-500 max-w-[180px] truncate">
            {value}
          </span>
        )}
        {showArrow && (
          <ChevronRight
            size={16}
            className={
              danger ? "text-error-400" : "text-gray-300 dark:text-gray-600"
            }
          />
        )}
      </div>
    </button>
  );
};

/**
 * 个人中心页面
 */
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout: clearLegacySession } = useStore();
  const logout = useLogout();
  const { mode } = useThemeStore();
  const [showThemePopup, setShowThemePopup] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // 商家资料 - 与 ProfileEditPage 共享缓存键，避免编辑/返回的二次拉取
  const {
    data: profileResp,
    isLoading,
    isError,
  } = useMerchantProfile();
  const profile = profileResp?.success ? profileResp.profile : null;

  const { data: socialStats } = useSocialStats(profile?.id);
  const merchantAvatarUpload = useImageUpload({ kind: "merchant-avatar" });

  // 通过 setQueryData 直接修改缓存，避免本地 state 与 query 缓存双源不同步
  const patchAvatar = (avatar: string | null) => {
    queryClient.setQueryData<MerchantProfileResponse>(PROFILE_KEY, (old) =>
      old?.profile
        ? { ...old, profile: { ...old.profile, avatar: avatar ?? undefined } }
        : old,
    );
  };

  // 处理头像上传：立即预览（blob:），server 返回后替换为真实 url；失败回滚
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const handle = merchantAvatarUpload.uploadWithPreview(file);
    if (!handle.tempUrl) return; // 校验未通过

    const previousAvatar = profile?.avatar ?? null;
    patchAvatar(handle.tempUrl);
    setAvatarUploading(true);

    handle.finalUrlPromise
      .then((real) => {
        patchAvatar(real);
        // 让其他 query（如关注数等）感知到刷新，但避免立刻 refetch profile 抖一下
        queryClient.invalidateQueries({
          queryKey: PROFILE_KEY,
          refetchType: "none",
        });
        Toast.show({ icon: "success", content: "头像更新成功" });
      })
      .catch(() => {
        // hook 已 toast；这里只回滚
        patchAvatar(previousAvatar);
      })
      .finally(() => {
        setAvatarUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  };

  // 获取当前主题模式显示文本
  const getThemeModeText = () => {
    switch (mode) {
      case "light":
        return "浅色";
      case "dark":
        return "深色";
      case "system":
        return "跟随系统";
      default:
        return "浅色";
    }
  };

  // 获取当前主题图标
  const ThemeIcon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;

  // 行业 value -> 中文 label（与 ProfileEditPage 保持一致）
  const INDUSTRY_LABELS: Record<string, string> = {
    internet: "互联网/IT",
    finance: "金融/投资",
    education: "教育/培训",
    healthcare: "医疗/健康",
    realestate: "房地产/建筑",
    manufacturing: "制造业",
    retail: "零售/电商",
    media: "文化/传媒",
    consulting: "咨询/服务",
    other: "其他",
  };

  // 隐私读取（与后端 default 保持一致；未设置时按合理默认值）
  const privacy = (profile?.privacy_settings ?? {}) as MerchantPrivacySettings;
  const isFieldPublic = (
    key: keyof MerchantPrivacySettings,
    defaultPublic: boolean,
  ): boolean => {
    const v = privacy[key];
    return typeof v === "boolean" ? v : defaultPublic;
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 处理退出登录
  const handleLogout = () => {
    Dialog.confirm({
      content: "确定要退出登录吗？",
      confirmText: "退出",
      cancelText: "取消",
      onConfirm: () => {
        clearLegacySession();
        logout();
        Toast.show({ content: "已退出登录" });
      },
    });
  };

  return (
    <MerchantLayout title="个人中心">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">加载中...</div>
        </div>
      ) : !profile || isError ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">加载失败</div>
        </div>
      ) : (
        <div className="space-y-4 pb-6">
          {/* 用户信息卡片 */}
          <div className="bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl p-5 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* 头像 */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={28} className="text-white/80" />
                    )}
                  </div>
                  <button
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    <Camera size={12} className={avatarUploading ? "text-gray-300" : "text-primary-500"} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* 基本信息 */}
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold mb-1 truncate">
                    {profile.name}
                  </h2>
                  {(() => {
                    // 顶部副标题用最能代表身份的字段：职业 (· 公司) > 行业 > 城市
                    // 全空时给"去完善"入口，避免硬塞"未填写地址"这种占位
                    const parts: string[] = [];
                    if (profile.occupation) parts.push(profile.occupation);
                    if (profile.company) parts.push(profile.company);
                    let tagline = parts.join(" · ");
                    if (!tagline && profile.industry) {
                      tagline =
                        INDUSTRY_LABELS[profile.industry] || profile.industry;
                    }
                    if (!tagline && profile.city) tagline = profile.city;
                    if (tagline) {
                      return (
                        <p className="text-sm text-white/80 truncate">
                          {tagline}
                        </p>
                      );
                    }
                    return (
                      <button
                        type="button"
                        onClick={() => navigate("/dashboard/profile/edit")}
            className="inline-flex flex-nowrap items-center gap-0.5 whitespace-nowrap text-xs text-white/70 transition-colors hover:text-white [&>svg]:shrink-0"
                      >
                        完善资料让参与者更了解你
                        <ChevronRight size={12} />
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* 编辑按钮 */}
              <button
                onClick={() => navigate("/dashboard/profile/edit")}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <Edit size={14} className="text-white" />
              </button>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold">{profile.stats?.totalEvents ?? 0}</p>
                <p className="text-xs text-white/70">活动数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{profile.stats?.totalServed ?? 0}</p>
                <p className="text-xs text-white/70">服务人数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{socialStats?.followingCount ?? 0}</p>
                <p className="text-xs text-white/70">关注</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{socialStats?.followersCount ?? 0}</p>
                <p className="text-xs text-white/70">粉丝</p>
              </div>
            </div>
            {/* 好评率（评分系统暂未上线） */}
            <div className="mt-3 text-xs text-white/70 flex items-center justify-center gap-1">
              <span>好评率</span>
              <span className="font-medium">
                {profile.stats?.ratingAvg != null
                  ? `${Math.round(profile.stats.ratingAvg * 100)}%`
                  : "暂无评分"}
              </span>
            </div>
          </div>

          {/* 个人介绍 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  个人介绍
                </h3>
                <PublicBadge isPublic={isFieldPublic("bio", true)} />
              </div>
              <button
                className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
                onClick={() => navigate("/dashboard/profile/edit?focus=bio")}
              >
                {profile.bio ? "编辑" : "去填写"}
              </button>
            </div>
            <div className="px-4 py-4">
              {profile.bio ? (
                <div className="relative pl-5">
                  <Quote
                    size={14}
                    className="absolute left-0 top-0.5 text-gray-300 dark:text-gray-600"
                  />
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                    {profile.bio}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  还没有自我介绍。一段简介能让参与者更快建立信任，建议补充。
                </p>
              )}
            </div>
          </div>

          {/* 职业信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                职业信息
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <MenuItem
                icon={<Briefcase size={18} />}
                label="职业"
                value={profile.occupation || "未填写"}
                isPublic={isFieldPublic("occupation", true)}
                onClick={() =>
                  navigate("/dashboard/profile/edit?focus=occupation")
                }
              />
              <MenuItem
                icon={<Layers size={18} />}
                label="行业"
                value={
                  profile.industry
                    ? INDUSTRY_LABELS[profile.industry] || profile.industry
                    : "未填写"
                }
                isPublic={isFieldPublic("industry", true)}
                onClick={() => navigate("/dashboard/profile/edit")}
              />
              <MenuItem
                icon={<Building size={18} />}
                label="公司 / 组织"
                value={profile.company || "未填写"}
                isPublic={isFieldPublic("company", false)}
                onClick={() =>
                  navigate("/dashboard/profile/edit?focus=company")
                }
              />
            </div>
          </div>

          {/* 联系方式 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                联系方式
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <MenuItem
                icon={<Phone size={18} />}
                label="手机号"
                value={profile.phone || "未绑定"}
                isPublic={isFieldPublic("phone", false)}
                onClick={() => navigate("/dashboard/profile/edit?focus=phone")}
              />
              <MenuItem
                icon={<Mail size={18} />}
                label="邮箱"
                value={profile.email || "未绑定"}
                isPublic={isFieldPublic("email", false)}
                onClick={() => navigate("/dashboard/profile/edit?focus=email")}
              />
              <MenuItem
                icon={<MessageCircle size={18} />}
                label="微信号"
                value={profile.wechat || "未绑定"}
                isPublic={isFieldPublic("wechat", false)}
                onClick={() => navigate("/dashboard/profile/edit?focus=wechat")}
              />
              <MenuItem
                icon={<MapPin size={18} />}
                label="所在城市"
                value={profile.city || "未填写"}
                isPublic={isFieldPublic("city", false)}
                onClick={() => navigate("/dashboard/profile/edit?focus=city")}
              />
            </div>
          </div>

          {/* 账户信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                账户信息
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <MenuItem
                icon={<User size={18} />}
                label="登录账号"
                value={profile.account}
                showArrow={false}
              />
              <div className="flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-3">
                  <Fingerprint size={18} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">主办方 ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 dark:text-gray-500 font-mono truncate max-w-[160px]">{profile.id}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(profile.id);
                      setIdCopied(true);
                      Toast.show({ content: "已复制", duration: 1000 });
                      setTimeout(() => setIdCopied(false), 1500);
                    }}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {idCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                  </button>
                </div>
              </div>
              <MenuItem
                icon={<Calendar size={18} />}
                label="注册时间"
                value={formatDate(profile.created_at)}
                showArrow={false}
              />
            </div>
          </div>

          {/* 我的资源 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                我的资源
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <MenuItem
                icon={<FileText size={18} />}
                label="我的模板"
                value="报名表 / 参与要求"
                onClick={() => navigate("/dashboard/profile/templates")}
              />
            </div>
          </div>

          {/* 设置与帮助 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                设置与帮助
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <MenuItem
                icon={<ThemeIcon size={18} />}
                label="外观模式"
                value={getThemeModeText()}
                onClick={() => setShowThemePopup(true)}
              />
              <MenuItem
                icon={<Settings size={18} />}
                label="账户设置"
                onClick={() => Toast.show({ content: "账户设置开发中" })}
              />
              <MenuItem
                icon={<Shield size={18} />}
                label="隐私与安全"
                onClick={() => Toast.show({ content: "隐私设置开发中" })}
              />
              <MenuItem
                icon={<FileText size={18} />}
                label="用户协议"
                onClick={() => Toast.show({ content: "用户协议" })}
              />
              <MenuItem
                icon={<HelpCircle size={18} />}
                label="帮助中心"
                onClick={() => navigate("/dashboard/help")}
              />
            </div>
          </div>

          {/* 退出登录 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <MenuItem
              icon={<LogOut size={18} />}
              label="退出登录"
              onClick={handleLogout}
              danger
              showArrow={false}
            />
          </div>

          {/* 版本信息 */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
            活动家 v1.0.0
          </p>
        </div>
      )}

      {/* 主题选择弹窗 */}
      <Popup
        visible={showThemePopup}
        onMaskClick={() => setShowThemePopup(false)}
        bodyStyle={{
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          padding: "20px",
        }}
        className="dark:bg-gray-800"
      >
        <div className="pb-safe">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              选择外观模式
            </h3>
            <button
              onClick={() => setShowThemePopup(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              完成
            </button>
          </div>
          <ThemeSelector variant="card" />
        </div>
      </Popup>
    </MerchantLayout>
  );
};

export default ProfilePage;
