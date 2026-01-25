/**
 * 个人中心页面 (商家端)
 * 显示商家资料、设置、退出登录等
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building,
  Phone,
  Mail,
  Calendar,
  Users,
  Activity,
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
} from "lucide-react";
import { Dialog, Toast, Popup } from "antd-mobile";
import { MerchantLayout } from "@/components/layout";
import { mockMerchantProfile } from "@/mocks/data/merchant";
import { useStore } from "@/store";
import { useThemeStore } from "@/store/themeStore";
import { ThemeSelector } from "@/components/ui/ThemeSelector";

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
  const profile = mockMerchantProfile;

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
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Camera size={12} className="text-primary-500" />
                </button>
              </div>

              {/* 基本信息 */}
              <div>
                <h2 className="text-lg font-semibold mb-1">{profile.name}</h2>
                <p className="text-sm text-white/70">{profile.company}</p>
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
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.totalActivities}</p>
              <p className="text-xs text-white/70">创建活动</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.totalParticipants}</p>
              <p className="text-xs text-white/70">服务人数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">4.9</p>
              <p className="text-xs text-white/70">好评率</p>
            </div>
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
              value={profile.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
              onClick={() => Toast.show({ content: "修改手机号功能开发中" })}
            />
            <MenuItem
              icon={<Mail size={18} />}
              label="邮箱"
              value={profile.email || "未绑定"}
              onClick={() => Toast.show({ content: "绑定邮箱功能开发中" })}
            />
            <MenuItem
              icon={<Building size={18} />}
              label="公司/组织"
              value={profile.company || "未填写"}
              onClick={() => Toast.show({ content: "编辑功能开发中" })}
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
              icon={<Calendar size={18} />}
              label="注册时间"
              value={formatDate(profile.createdAt)}
              showArrow={false}
            />
            <MenuItem
              icon={<Activity size={18} />}
              label="累计活动"
              value={profile.totalActivities}
              showArrow={false}
            />
            <MenuItem
              icon={<Users size={18} />}
              label="服务人数"
              value={profile.totalParticipants}
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
