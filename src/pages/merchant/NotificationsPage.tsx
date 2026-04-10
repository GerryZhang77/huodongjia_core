/**
 * 消息通知页面 (商家端)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { api } from "@/services/api/client";

interface MerchantNotification {
  id: string;
  type: "enrollment" | "match" | "system" | "reminder" | "approval";
  title: string;
  content: string;
  activityId?: string;
  activityTitle?: string;
  isRead: boolean;
  createdAt: string;
}

const notificationIcons: Record<string, React.ReactNode> = {
  enrollment: <UserPlus size={18} />,
  approval: <UserPlus size={18} />,
  match: <GitMerge size={18} />,
  system: <Settings size={18} />,
  reminder: <Clock size={18} />,
};

const notificationColors: Record<string, string> = {
  enrollment: "bg-primary-100 text-primary-500",
  approval: "bg-primary-100 text-primary-500",
  match: "bg-accent-100 text-accent-500",
  system: "bg-gray-100 text-gray-500",
  reminder: "bg-orange-100 text-secondary-500",
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString();
};

interface NotificationCardProps {
  notification: MerchantNotification;
  onRead: () => void;
  onDelete: () => void;
  onClick: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onRead, onDelete, onClick }) => (
  <div
    className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
      notification.isRead ? "border-gray-100" : "border-primary-200 bg-primary-50/30"
    }`}
    onClick={onClick}
  >
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notificationColors[notification.type] ?? "bg-gray-100 text-gray-500"}`}>
        {notificationIcons[notification.type] ?? <Bell size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{notification.title}</h4>
          {!notification.isRead && <span className="w-2 h-2 bg-error-500 rounded-full flex-shrink-0" />}
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{notification.content}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{formatTime(notification.createdAt)}</span>
          {notification.activityTitle && (
            <span className="text-xs text-primary-500 flex items-center gap-0.5">
              {notification.activityTitle}
              <ChevronRight size={12} />
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        {!notification.isRead && (
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-500"
            onClick={(e) => { e.stopPropagation(); onRead(); }}
            title="标为已读"
          >
            <Check size={14} />
          </button>
        )}
        <button
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-error-500"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="删除"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  </div>
);

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["merchant", "notifications"],
    queryFn: () => api.get<{ success: boolean; data: { notifications: MerchantNotification[]; unreadCount: number } }>("/api/merchant/received-notifications"),
  });

  const notifications: MerchantNotification[] = data?.data?.notifications ?? [];
  const unreadCount = data?.data?.unreadCount ?? 0;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["merchant", "notifications"] });

  const readMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/merchant/notifications/${id}/read`),
    onSuccess: invalidate,
  });

  const readAllMutation = useMutation({
    mutationFn: () => api.post("/api/merchant/notifications/read-all"),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/merchant/notifications/${id}`),
    onSuccess: invalidate,
  });

  const filteredNotifications =
    activeFilter === "all" ? notifications
    : activeFilter === "unread" ? notifications.filter((n) => !n.isRead)
    : notifications.filter((n) => n.type === activeFilter);

  const handleClick = (notification: MerchantNotification) => {
    if (!notification.isRead) readMutation.mutate(notification.id);
    if (notification.activityId) navigate(`/dashboard/activity/${notification.activityId}/enrollment`);
  };

  return (
    <MerchantLayout title="消息中心">
      <div className="space-y-4">
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
                onClick={() => readAllMutation.mutate()}
              >
                <CheckCheck size={14} />
                全部已读
              </button>
            )}
          </div>
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

        {isLoading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <p className="text-gray-400 text-sm">加载中...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
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
                onRead={() => readMutation.mutate(notification.id)}
                onDelete={() => deleteMutation.mutate(notification.id)}
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
