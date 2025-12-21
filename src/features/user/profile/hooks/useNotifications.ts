/**
 * useNotifications - 获取通知列表
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/userProfileApi";
import type { NotificationListResponse } from "@/services/userApi";

/**
 * 获取通知列表
 */
export function useNotifications(params?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery<NotificationListResponse, Error>({
    queryKey: ["user", "notifications", params],
    queryFn: () => getNotifications(params),
    staleTime: 1 * 60 * 1000, // 1分钟
  });
}

/**
 * 标记通知为已读
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
  });
}

/**
 * 标记所有通知为已读
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
  });
}
