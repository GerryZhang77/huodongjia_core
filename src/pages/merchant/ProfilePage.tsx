/**
 * 个人中心页面 (商家端)
 * 显示商家资料、设置、退出登录等
 */

import React, { useState, useEffect, useRef } from "react";
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
  } from "lucide-react";
import { Dialog,
  Popup,
} from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import { MerchantLayout } from "@/components/layout";
import { merchantApi, uploadMerchantAvatar, type MerchantProfile } from "@/services";
import { useStore } from "@/store";
import { useThemeStore } from "@/store/themeStore";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { useSocialStats } from "@/features/social";

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
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  value,
  onClick,
  danger = false,
  showArrow = true,
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
      </div>
      <div className="flex items-center gap-2">
        {value !== undefined && (
          <span className="text-sm text-gray-400 dark:text-gray-500">
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
  const { logout } = useStore();
  const { mode } = useThemeStore();
  const [showThemePopup, setShowThemePopup] = useState(false);
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: socialStats } = useSocialStats(profile?.id);

  // 加载商家资料
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await merchantApi.getMerchantProfile();
        if (response.success) {
          setProfile(response.profile);
        } else {
          Toast.show({ content: "获取商家信息失败" });
        }
      } catch (error) {
        console.error("加载商家资料失败:", error);
        Toast.show({ content: "加载失败，请稍后重试" });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // 处理头像上传
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await uploadMerchantAvatar(file);
      if (res.success && res.data?.url) {
        setProfile((prev) => prev ? { ...prev, avatar: res.data!.url } : prev);
        queryClient.invalidateQueries({ queryKey: ["merchant", "profile"] });
        Toast.show({ icon: "success", content: "头像更新成功" });
      } else {
        Toast.show({ icon: "fail", content: res.message || "上传失败" });
      }
    } catch {
      Toast.show({ icon: "fail", content: "上传失败，请稍后重试" });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
        logout();
        Toast.show({ content: "已退出登录" });
        navigate("/login");
      },
    });
  };

  return (
    <MerchantLayout title="个人中心">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">加载中...</div>
        </div>
      ) : !profile ? (
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
                <div>
                  <h2 className="text-lg font-semibold mb-1">{profile.name}</h2>
                  <p className="text-sm text-white/70">{profile.location || "未填写地址"}</p>
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
                onClick={() => navigate("/dashboard/profile/edit?focus=phone")}
              />
              <MenuItem
                icon={<Mail size={18} />}
                label="邮箱"
                value={profile.email || "未绑定"}
                onClick={() => navigate("/dashboard/profile/edit?focus=email")}
              />
              <MenuItem
                icon={<Building size={18} />}
                label="地址"
                value={profile.city || profile.location || "未填写"}
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">商家 ID</span>
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
