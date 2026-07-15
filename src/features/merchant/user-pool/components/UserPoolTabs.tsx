/**
 * UserPoolTabs - 用户管理页面 Tab 切换
 *
 * 两个 Tab：
 * - 我的用户（商家私域用户池）
 * - 发现用户（平台公域用户数据库）
 */

import React from "react";
import { Users, Compass } from "lucide-react";
import type { UserPoolTab } from "@/features/merchant/user-pool/types";

// ========================================
// 类型定义
// ========================================

export interface UserPoolTabsProps {
  activeTab: UserPoolTab;
  onChange: (tab: UserPoolTab) => void;
  /** 我的用户数 */
  myUserCount?: number;
  /** 平台用户数（展示用） */
  platformUserCount?: number;
}

// ========================================
// Tab 配置
// ========================================

interface TabConfig {
  key: UserPoolTab;
  label: string;
  icon: React.ElementType;
  countKey: "myUserCount" | "platformUserCount";
}

const TABS: TabConfig[] = [
  {
    key: "my-users",
    label: "我的用户",
    icon: Users,
    countKey: "myUserCount",
  },
  {
    key: "discover",
    label: "发现用户",
    icon: Compass,
    countKey: "platformUserCount",
  },
];

// ========================================
// 组件
// ========================================

const UserPoolTabs: React.FC<UserPoolTabsProps> = ({
  activeTab,
  onChange,
  myUserCount,
  platformUserCount,
}) => {
  const counts = { myUserCount, platformUserCount };

  return (
    <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        const count = counts[tab.countKey];

        return (
          <button
            key={tab.key}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => onChange(tab.key)}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            {count !== undefined && (
              <span
            className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default UserPoolTabs;
