/**
 * 通知偏好设置面板
 * - 推送/声音
 * - 各类型开关（私信/关注/活动通知）
 * - 免打扰时段
 *
 * 直接嵌入到 UserSettings 页面
 */

import { FC, ElementType } from "react";
import { Bell, Volume2, MessageCircle, UserPlus, Activity, Moon, Smartphone } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../hooks";
import type { NotificationPreferences } from "../services/notificationPrefApi";

interface RowProps {
  icon: ElementType;
  label: string;
  description?: string;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

const ToggleRow: FC<RowProps> = ({ icon: Icon, label, description, value, onChange, disabled }) => (
  <div className="flex items-center px-4 py-3.5">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 bg-slate-100 dark:bg-gray-700">
      <Icon size={18} className="text-slate-600 dark:text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
      {description && (
        <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`w-12 h-7 rounded-full relative transition-colors flex-shrink-0 ${
        value ? "bg-primary-500" : "bg-slate-200 dark:bg-gray-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          value ? "right-1" : "left-1"
        }`}
      />
    </button>
  </div>
);

export const NotificationPreferencesPanel: FC = () => {
  const { data: pref, isLoading } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  const apply = async (patch: Partial<NotificationPreferences>) => {
    try {
      await update.mutateAsync(patch);
    } catch (e) {
      Toast.show({
        icon: "fail",
        content: e instanceof Error ? e.message : "更新失败",
      });
    }
  };

  const setType = (key: string, val: boolean) => {
    if (!pref) return;
    apply({ type_settings: { ...pref.type_settings, [key]: val } });
  };

  if (isLoading || !pref) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 px-4 py-6 text-center text-sm text-slate-400">
        加载中...
      </div>
    );
  }

  const ts = pref.type_settings || {};
  // 活动通知由多个类型组成：enrollment / match / reminder / activity_change / approval / waitlist
  const activityKeys = [
    "enrollment",
    "match",
    "reminder",
    "activity_change",
    "approval",
    "waitlist",
    "activity",
  ];
  const activityEnabled = activityKeys.every((k) => ts[k] !== false);
  const setActivity = (val: boolean) => {
    if (!pref) return;
    const next = { ...pref.type_settings };
    for (const k of activityKeys) next[k] = val;
    apply({ type_settings: next });
  };

  // 时间格式：后端返回 'HH:MM:SS' 或 'HH:MM'，input type=time 需要 'HH:MM'
  const toHM = (s: string | null) => (s ? s.slice(0, 5) : "");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 overflow-hidden divide-y divide-slate-100 dark:divide-gray-700">
      <ToggleRow
        icon={Bell}
        label="推送通知"
        description="关闭后不再接收任何通知"
        value={pref.push_enabled}
        onChange={(v) => apply({ push_enabled: v })}
      />
      <ToggleRow
        icon={Smartphone}
        label="报名短信通知"
        description="接收报名提交、审核结果和候补状态短信"
        value={pref.sms_enabled !== false}
        onChange={(v) => apply({ sms_enabled: v })}
      />
      <ToggleRow
        icon={Volume2}
        label="通知声音"
        description="收到消息时播放提示音"
        value={pref.sound_enabled}
        onChange={(v) => apply({ sound_enabled: v })}
        disabled={!pref.push_enabled}
      />
      <ToggleRow
        icon={MessageCircle}
        label="私信通知"
        description="收到私信时通知"
        value={ts.message !== false}
        onChange={(v) => setType("message", v)}
        disabled={!pref.push_enabled}
      />
      <ToggleRow
        icon={UserPlus}
        label="关注通知"
        description="有人关注我时通知"
        value={ts.follow !== false}
        onChange={(v) => setType("follow", v)}
        disabled={!pref.push_enabled}
      />
      <ToggleRow
        icon={Activity}
        label="活动通知"
        description="报名、匹配、提醒等活动相关通知"
        value={activityEnabled}
        onChange={setActivity}
        disabled={!pref.push_enabled}
      />

      {/* 免打扰时段 */}
      <div className="px-4 py-3.5">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 bg-slate-100 dark:bg-gray-700">
            <Moon size={18} className="text-slate-600 dark:text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              免打扰时段
            </p>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
              指定时间段内不推送通知
            </p>
          </div>
          <button
            type="button"
            onClick={() => apply({ dnd_enabled: !pref.dnd_enabled })}
            className={`w-12 h-7 rounded-full relative transition-colors flex-shrink-0 ${
              pref.dnd_enabled ? "bg-primary-500" : "bg-slate-200 dark:bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                pref.dnd_enabled ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>
        {pref.dnd_enabled && (
          <div className="flex items-center gap-3 mt-3 pl-12">
            <input
              type="time"
              value={toHM(pref.dnd_start)}
              onChange={(e) => apply({ dnd_start: e.target.value || null })}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
            />
            <span className="text-xs text-slate-400">至</span>
            <input
              type="time"
              value={toHM(pref.dnd_end)}
              onChange={(e) => apply({ dnd_end: e.target.value || null })}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPreferencesPanel;
