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
 * 工具：把对应 notification 在所有 ["user","notifications",*] 缓存里标已读
 */
function patchAllNotificationCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  predicate: (n: { id: string; isRead?: boolean }) => boolean,
) {
  const queries = queryClient.getQueriesData<NotificationListResponse>({
    queryKey: ["user", "notifications"],
  });
  const snapshots: Array<[unknown[], NotificationListResponse | undefined]> = [];
  for (const [key, value] of queries) {
    snapshots.push([key as unknown[], value]);
    if (!value?.data?.notifications) continue;
    const nextNotifications = value.data.notifications.map((n) =>
      predicate(n) ? { ...n, isRead: true } : n,
    );
    const becameReadCount = value.data.notifications.filter(
      (n) => !n.isRead && predicate(n),
    ).length;
    queryClient.setQueryData<NotificationListResponse>(key as unknown[], {
      ...value,
      data: {
        ...value.data,
        notifications: nextNotifications,
        unreadCount:
          value.data.unreadCount !== undefined
            ? Math.max(0, value.data.unreadCount - becameReadCount)
            : value.data.unreadCount,
      },
    });
  }
  return snapshots;
}

/**
 * 标记通知为已读（乐观更新）
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["user", "notifications"] });
      const snapshots = patchAllNotificationCaches(
        queryClient,
        (n) => n.id === notificationId,
      );
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      // 回滚所有快照
      for (const [key, value] of ctx?.snapshots ?? []) {
        queryClient.setQueryData(key, value);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
  });
}

/**
 * 标记所有通知为已读（乐观更新整列表）
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["user", "notifications"] });
      const snapshots = patchAllNotificationCaches(queryClient, () => true);
      return { snapshots };
    },
    onError: (_err, _v, ctx) => {
      for (const [key, value] of ctx?.snapshots ?? []) {
        queryClient.setQueryData(key, value);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
  });
}
