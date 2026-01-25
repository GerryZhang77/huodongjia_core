/**
 * 商家端设置页面
 * 包含账户设置、通知设置、隐私设置等
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Shield,
  Moon,
  Globe,
  Mail,
  MessageSquare,
  Lock,
  Eye,
  ChevronRight,
  Sun,
  Monitor,
} from "lucide-react";
import { Switch, Toast, Popup } from "antd-mobile";
import { MerchantLayout } from "@/components/layout";
import { useThemeStore } from "@/store/themeStore";
import { ThemeSelector } from "@/components/ui/ThemeSelector";

// 设置项类型
interface SettingItem {
  id: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  type: "link" | "toggle" | "select";
  value?: boolean | string;
  options?: { label: string; value: string }[];
  onClick?: () => void;
  onChange?: (value: boolean) => void;
}

// 设置组类型
interface SettingGroup {
  title: string;
  items: SettingItem[];
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useThemeStore();

  // 本地状态
  const [showThemePopup, setShowThemePopup] = useState(false);
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    activityReminder: true,
    enrollmentNotice: true,
    matchingResult: true,
  });

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

  // 设置组配置
  const settingGroups: SettingGroup[] = [
    {
      title: "账户",
      items: [
        {
          id: "profile",
          icon: User,
          label: "个人资料",
          description: "修改头像、昵称等信息",
          type: "link",
          onClick: () => navigate("/dashboard/profile/edit"),
        },
        {
          id: "security",
          icon: Lock,
          label: "账户安全",
          description: "密码、登录设备管理",
          type: "link",
          onClick: () => Toast.show({ content: "账户安全功能开发中" }),
        },
        {
          id: "privacy",
          icon: Shield,
          label: "隐私设置",
          description: "管理数据和隐私偏好",
          type: "link",
          onClick: () => Toast.show({ content: "隐私设置功能开发中" }),
        },
      ],
    },
    {
      title: "通知",
      items: [
        {
          id: "push",
          icon: Bell,
          label: "推送通知",
          description: "接收应用内推送消息",
          type: "toggle",
          value: notifications.push,
          onChange: (value) =>
            setNotifications((prev) => ({ ...prev, push: value })),
        },
        {
          id: "email",
          icon: Mail,
          label: "邮件通知",
          description: "接收邮件提醒",
          type: "toggle",
          value: notifications.email,
          onChange: (value) =>
            setNotifications((prev) => ({ ...prev, email: value })),
        },
        {
          id: "sms",
          icon: MessageSquare,
          label: "短信通知",
          description: "接收短信提醒",
          type: "toggle",
          value: notifications.sms,
          onChange: (value) =>
            setNotifications((prev) => ({ ...prev, sms: value })),
        },
      ],
    },
    {
      title: "通知内容",
      items: [
        {
          id: "activityReminder",
          icon: Bell,
          label: "活动提醒",
          description: "活动即将开始时提醒",
          type: "toggle",
          value: notifications.activityReminder,
          onChange: (value) =>
            setNotifications((prev) => ({ ...prev, activityReminder: value })),
        },
        {
          id: "enrollmentNotice",
          icon: User,
          label: "报名通知",
          description: "有新报名时通知",
          type: "toggle",
          value: notifications.enrollmentNotice,
          onChange: (value) =>
            setNotifications((prev) => ({ ...prev, enrollmentNotice: value })),
        },
        {
          id: "matchingResult",
          icon: Eye,
          label: "匹配结果",
          description: "匹配完成时通知",
          type: "toggle",
          value: notifications.matchingResult,
          onChange: (value) =>
            setNotifications((prev) => ({ ...prev, matchingResult: value })),
        },
      ],
    },
    {
      title: "外观与语言",
      items: [
        {
          id: "theme",
          icon: ThemeIcon,
          label: "外观模式",
          description: getThemeModeText(),
          type: "link",
          onClick: () => setShowThemePopup(true),
        },
        {
          id: "language",
          icon: Globe,
          label: "语言",
          description: "简体中文",
          type: "link",
          onClick: () => Toast.show({ content: "语言设置功能开发中" }),
        },
      ],
    },
  ];

  // 渲染设置项
  const renderSettingItem = (item: SettingItem) => {
    const Icon = item.icon;

    return (
      <div
        key={item.id}
        className={`flex items-center justify-between py-3 px-4 ${
          item.type === "link"
            ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            : ""
        } transition-colors`}
        onClick={item.type === "link" ? item.onClick : undefined}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Icon size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {item.label}
            </p>
            {item.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {item.type === "toggle" && (
          <Switch
            checked={item.value as boolean}
            onChange={item.onChange}
            style={{
              "--checked-color": "#3B82F6",
            }}
          />
        )}

        {item.type === "link" && (
          <ChevronRight
            size={18}
            className="text-gray-300 dark:text-gray-600"
          />
        )}
      </div>
    );
  };

  return (
    <MerchantLayout title="设置" showBack onBack={() => navigate(-1)}>
      <div className="space-y-4 pb-6">
        {settingGroups.map((group) => (
          <div
            key={group.title}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            {group.title && (
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {group.title}
                </h3>
              </div>
            )}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {group.items.map(renderSettingItem)}
            </div>
          </div>
        ))}

        {/* 版本信息 */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
          活动家 v1.0.0 · Build 2024.12.25
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
      >
        <div className="pb-safe">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              选择外观模式
            </h3>
            <button
              onClick={() => setShowThemePopup(false)}
              className="text-primary-500 hover:text-primary-600"
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

export default SettingsPage;
