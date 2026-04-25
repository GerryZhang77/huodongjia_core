/**
 * 用户端设置页面
 * 用户账户设置和偏好配置
 */

import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Lock,
  Globe,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  Moon,
  Volume2,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { UserLayout } from "@/components/layout/UserLayout";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useThemeStore } from "@/store/themeStore";
import { deleteAccount } from "@/features/auth/services/authApi";

// 设置项类型
interface SettingItem {
  id: string;
  icon: FC<{ size?: number; className?: string }>;
  label: string;
  description?: string;
  type: "link" | "toggle" | "action";
  value?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

// 设置组类型
interface SettingGroup {
  title: string;
  items: SettingItem[];
}

const UserSettings: FC = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const { isDark, toggleTheme } = useThemeStore();

  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [idCopied, setIdCopied] = useState(false);

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id).then(() => {
      setIdCopied(true);
      Toast.show({ content: "ID 已复制" });
      setTimeout(() => setIdCopied(false), 2000);
    });
  };

  // 设置组数据
  const settingGroups: SettingGroup[] = [
    {
      title: "账户",
      items: [
        {
          id: "profile",
          icon: User,
          label: "编辑个人资料",
          description: "修改头像、昵称等信息",
          type: "link",
          onClick: () => navigate("/u/profile/edit"),
        },
        {
          id: "privacy",
          icon: Lock,
          label: "隐私设置",
          description: "管理谁可以看到你的信息",
          type: "link",
        },
        {
          id: "security",
          icon: Shield,
          label: "账户安全",
          description: "密码、登录设备管理",
          type: "link",
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
          description: "接收活动更新和消息提醒",
          type: "toggle",
          value: notifications,
          onClick: () => setNotifications(!notifications),
        },
        {
          id: "sound",
          icon: Volume2,
          label: "通知声音",
          description: "收到消息时播放提示音",
          type: "toggle",
          value: soundEnabled,
          onClick: () => setSoundEnabled(!soundEnabled),
        },
      ],
    },
    {
      title: "外观",
      items: [
        {
          id: "darkmode",
          icon: Moon,
          label: "深色模式",
          description: "减少眼睛疲劳",
          type: "toggle",
          value: isDark,
          onClick: toggleTheme,
        },
        {
          id: "language",
          icon: Globe,
          label: "语言",
          description: "简体中文",
          type: "link",
        },
      ],
    },
    {
      title: "支持",
      items: [
        {
          id: "help",
          icon: HelpCircle,
          label: "帮助中心",
          type: "link",
        },
        {
          id: "terms",
          icon: FileText,
          label: "用户协议",
          type: "link",
        },
        {
          id: "privacy_policy",
          icon: Shield,
          label: "隐私政策",
          type: "link",
        },
      ],
    },
    {
      title: "",
      items: [
        {
          id: "logout",
          icon: LogOut,
          label: "退出登录",
          type: "action",
          danger: true,
          onClick: () => {
            clearAuth();
            navigate("/login");
          },
        },
        {
          id: "delete-account",
          icon: Trash2,
          label: "注销账号",
          description: "永久删除账号及所有数据",
          type: "action",
          danger: true,
          onClick: async () => {
            if (!window.confirm("确定要注销账号吗？此操作不可撤销，所有数据将被永久删除。")) {
              return;
            }
            const result = await deleteAccount();
            if (result.success) {
              clearAuth();
              navigate("/login");
            } else {
              alert(result.message);
            }
          },
        },
      ],
    },
  ];

  return (
    <UserLayout
      showTabBar={true}
      showTopBar={true}
      showBreadcrumb={true}
      breadcrumbItems={[{ label: "首页", path: "/u/home" }, { label: "设置" }]}
    >
      <div className="md:py-6 lg:py-8">
        {/* 用户 ID - 仅自己可见 */}
        {user?.id && (
          <div className="px-4 md:px-6 pt-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 dark:text-gray-500">我的 ID</p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300 mt-0.5">{user.id}</p>
              </div>
              <button onClick={handleCopyId} className="p-2 rounded-xl bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors">
                {idCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* 设置列表 */}
        <div className="px-4 md:px-6 py-4 space-y-6">
          {settingGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {group.title && (
                <h3 className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
                  {group.title}
                </h3>
              )}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 overflow-hidden divide-y divide-slate-100 dark:divide-gray-700">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={item.onClick}
                      className={`flex items-center px-4 py-3.5 ${
                        item.type !== "toggle"
                          ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700"
                          : ""
                      } transition-colors`}
                    >
                      {/* 图标 */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mr-3 ${
                          item.danger
                            ? "bg-red-50 dark:bg-red-900/30"
                            : "bg-slate-100 dark:bg-gray-700"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={
                            item.danger
                              ? "text-red-500"
                              : "text-slate-600 dark:text-gray-400"
                          }
                        />
                      </div>

                      {/* 文本 */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            item.danger
                              ? "text-red-500"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* 右侧操作 */}
                      {item.type === "link" && (
                        <ChevronRight
                          size={18}
                          className="text-slate-300 dark:text-gray-600"
                        />
                      )}
                      {item.type === "toggle" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onClick?.();
                          }}
                          className={`w-12 h-7 rounded-full relative transition-colors ${
                            item.value
                              ? "bg-primary-500"
                              : "bg-slate-200 dark:bg-gray-600"
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                              item.value ? "right-1" : "left-1"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 版本信息 */}
        <div className="px-4 md:px-6 py-6 text-center">
          <p className="text-xs text-slate-300 dark:text-gray-600">
            活动家 v1.0.0
          </p>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserSettings;
