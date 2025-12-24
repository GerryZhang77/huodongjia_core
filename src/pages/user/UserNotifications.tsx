/**
 * 用户端通知页面
 * 简洁的消息列表设计
 */

import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Users,
  MessageCircle,
  AlertCircle,
  Clock,
  CheckCheck,
  Inbox,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  NotificationType,
  Notification,
} from "@/mocks/data/user-notifications";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

// 通知图标和颜色配置
const notificationConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  approval: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  matching: { icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
  greeting: { icon: MessageCircle, color: "text-pink-600", bg: "bg-pink-50" },
  activity_change: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  waitlist: { icon: Clock, color: "text-gray-600", bg: "bg-gray-100" },
};

// 格式化时间
const formatTime = (dateStr: string): string => {
  const date = dayjs(dateStr);
  const now = dayjs();
  const diffMinutes = now.diff(date, "minute");

  if (diffMinutes < 1) return "刚刚";
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}小时前`;
  if (diffMinutes < 2880) return "昨天";
  return date.format("M/D");
};

// 通知项组件
const NotificationItem: FC<{
  notification: Notification;
  onClick: (n: Notification) => void;
}> = ({ notification, onClick }) => {
  const config = notificationConfig[notification.type];
  const Icon = config.icon;

  return (
    <button
      onClick={() => onClick(notification)}
      className={`w-full flex items-start gap-3 p-4 md:p-5 text-left transition-colors ${
        notification.isRead ? "bg-white" : "bg-primary-50/50"
      } hover:bg-gray-50 active:bg-gray-100`}
    >
      {/* 图标 */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}
      >
        <Icon size={18} className={config.color} />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`text-sm leading-snug ${
              notification.isRead
                ? "text-gray-700"
                : "text-gray-900 font-medium"
            }`}
          >
            {notification.title}
          </h3>
          <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">
            {formatTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {notification.content}
        </p>
        {notification.activityName && (
          <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
            {notification.activityName}
          </span>
        )}
      </div>

      {/* 未读指示器 */}
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
      )}
    </button>
  );
};

const UserNotifications: FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(getAllNotifications());
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setNotifications(getAllNotifications());
    if (notification.activityId) {
      navigate(`/u/activities/${notification.activityId}`);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    setNotifications(getAllNotifications());
  };

  return (
    <UserLayout bgColor="bg-white">
      {/* 标题栏 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8 max-w-3xl mx-auto">
          <div>
            <h1 className="text-lg font-bold text-gray-900">消息</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500">{unreadCount} 条未读</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-primary-600 font-medium rounded-full bg-primary-50 hover:bg-primary-100 transition-colors"
            >
              <CheckCheck size={14} />
              全部已读
            </button>
          )}
        </div>
      </header>

      {/* 通知列表 */}
      <div className="divide-y divide-gray-100 max-w-3xl mx-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Inbox size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm">暂无消息</p>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserNotifications;
