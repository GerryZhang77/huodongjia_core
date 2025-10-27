/**
 * useActivities Hook
 * 活动列表查询 Hook - 使用 TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, Toast } from "antd-mobile";
import {
  getActivities,
  deleteActivity,
  type GetActivitiesResponse,
} from "../services/api";

/**
 * 查询键
 */
export const activitiesKeys = {
  all: ["activities"] as const,
  list: () => [...activitiesKeys.all, "list"] as const,
  detail: (id: string) => [...activitiesKeys.all, "detail", id] as const,
};

/**
 * 获取活动列表
 */
export function useActivities() {
  return useQuery<GetActivitiesResponse, Error>({
    queryKey: activitiesKeys.list(),
    queryFn: getActivities,
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: 2,
  });
}

/**
 * 删除活动 Mutation
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      // 刷新活动列表
      queryClient.invalidateQueries({
        queryKey: activitiesKeys.list(),
      });
      Toast.show({ icon: "success", content: "删除成功" });
    },
    onError: (error: Error) => {
      Toast.show({ icon: "fail", content: error.message || "删除失败" });
    },
  });

  /**
   * 删除活动（带确认弹窗）
   */
  const deleteWithConfirm = (id: string, activityTitle?: string) => {
    Dialog.confirm({
      content: activityTitle
        ? `确认删除活动 "${activityTitle}" 吗？此操作不可撤销。`
        : "确认删除这个活动吗？此操作不可撤销。",
      onConfirm: () => mutation.mutate(id),
    });
  };

  return {
    deleteActivity: deleteWithConfirm,
    deleteImmediately: mutation.mutate,
    isDeleting: mutation.isPending,
  };
}
