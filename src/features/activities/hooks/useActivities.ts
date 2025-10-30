/**
 * useActivities Hook
 * 活动列表查询 Hook - 使用 TanStack Query
 *
 * 临时方案：当后端接口未实现时，返回静态演示数据
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, Toast } from "antd-mobile";
import {
  getActivities,
  deleteActivity,
  type GetActivitiesResponse,
} from "../services/api";
import { demoActivity } from "@/mocks/demo-activity";

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
 *
 * 临时方案：当后端返回 404 时，使用静态演示数据
 */
export function useActivities() {
  return useQuery<GetActivitiesResponse, Error>({
    queryKey: activitiesKeys.list(),
    queryFn: async () => {
      try {
        // 尝试请求真实后端
        const response = await getActivities();
        console.log("[useActivities] ✅ 使用真实后端数据");
        return response;
      } catch (error: unknown) {
        // 检查是否为 404 错误
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          console.warn("[useActivities] ⚠️  后端接口未实现，使用静态演示数据");

          // 返回静态演示数据（格式与后端响应一致）
          return {
            success: true,
            message: "使用演示数据",
            activities: [demoActivity],
            total: 1,
          } as GetActivitiesResponse;
        }

        // 其他错误继续抛出
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: false, // 禁用重试，避免多次 404 请求
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
