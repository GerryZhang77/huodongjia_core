/**
 * 消息通知页面 (商家端)
 * 显示系统通知、报名提醒、匹配通知等
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  UserPlus,
  GitMerge,
  Settings,
  Clock,
  Check,
  CheckCheck,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { MerchantLayout } from "@/components/layout";
import {
  mockMerchantNotifications,
  MerchantNotification,
} from "@/mocks/data/merchant";

/**
 * 通知类型图标映射
 */
const notificationIcons: Record<string, React.ReactNode> = {
  enrollment: <UserPlus size={18} />,
  match: <GitMerge size={18} />,
  system: <Settings size={18} />,
  reminder: <Clock size={18} />,
};

/**
 * 通知类型颜色映射
 */
const notificationColors: Record<string, string> = {
  enrollment: "bg-primary-100 text-primary-500",
  match: "bg-accent-100 text-accent-500",
  system: "bg-gray-100 text-gray-500",
  reminder: "bg-orange-100 text-secondary-500",
};

/**
 * 通知卡片组件
 */
interface NotificationCardProps {
  notification: MerchantNotification;
  onRead: () => void;
  onDelete: () => void;
  onClick: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onRead,
  onDelete,
  onClick,
}) => {
  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
        notification.isRead
          ? "border-gray-100"
          : "border-primary-200 bg-primary-50/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            notificationColors[notification.type]
          }`}
        >
          {notificationIcons[notification.type]}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="w-2 h-2 bg-error-500 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
            {notification.content}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {formatTime(notification.createdAt)}
            </span>
            {notification.activityTitle && (
              <span className="text-xs text-primary-500 flex items-center gap-0.5">
                {notification.activityTitle}
                <ChevronRight size={12} />
              </span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          {!notification.isRead && (
            <button
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-500"
              onClick={(e) => {
                e.stopPropagation();
                onRead();
              }}
              title="标为已读"
            >
              <Check size={14} />
            </button>
          )}
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-error-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 消息通知页面
 */
const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockMerchantNotifications);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // 筛选后的通知
  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : activeFilter === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications.filter((n) => n.type === activeFilter);

  // 未读数量
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 标记已读
  const handleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  // 全部标记已读
  const handleReadAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // 删除通知
  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 点击通知
  const handleClick = (notification: MerchantNotification) => {
    // 标记已读
    if (!notification.isRead) {
      handleRead(notification.id);
    }
    // 跳转到相关活动
    if (notification.activityId) {
      navigate(`/dashboard/activity/${notification.activityId}/enrollment`);
    }
  };

  return (
    <MerchantLayout title="消息中心">
      <div className="space-y-4">
        {/* 头部操作栏 */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-primary-500" />
              <span className="font-medium text-gray-900">全部消息</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-error-100 text-error-500 text-xs rounded-full">
                  {unreadCount} 未读
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="text-sm text-primary-500 flex items-center gap-1 hover:underline"
                onClick={handleReadAll}
              >
                <CheckCheck size={14} />
                全部已读
              </button>
            )}
          </div>

          {/* 筛选标签 */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: "all", label: "全部" },
              { key: "unread", label: "未读" },
              { key: "enrollment", label: "报名" },
              { key: "match", label: "匹配" },
              { key: "reminder", label: "提醒" },
              { key: "system", label: "系统" },
            ].map((item) => (
              <button
                key={item.key}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeFilter === item.key
                    ? "bg-primary-400 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setActiveFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 通知列表 */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无消息</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={() => handleRead(notification.id)}
                onDelete={() => handleDelete(notification.id)}
                onClick={() => handleClick(notification)}
              />
            ))}
          </div>
        )}
      </div>
    </MerchantLayout>
  );
};

export default NotificationsPage;
