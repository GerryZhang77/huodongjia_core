/**
 * useActivities Hook
 * 活动列表查询 Hook - 使用 TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Toast } from "antd-mobile";
import {
  getMyActivities,
  type GetActivitiesResponse,
} from "../services/activitiesApi";
import { deleteActivity } from "../services/activityApi";

/**
 * 查询键
 */
export const activitiesKeys = {
  all: ["activities"] as const,
  myActivities: () => [...activitiesKeys.all, "my"] as const,
};

/**
 * 获取我的活动列表
 */
export function useActivities() {
  return useQuery<GetActivitiesResponse, Error>({
    queryKey: activitiesKeys.myActivities(),
    queryFn: getMyActivities,
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: 2,
  });
}

/**
 * 删除活动 Mutation
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      // 刷新活动列表
      queryClient.invalidateQueries({
        queryKey: activitiesKeys.myActivities(),
      });
      Toast.show({ icon: "success", content: "删除成功" });
    },
    onError: (error: Error) => {
      Toast.show({ icon: "fail", content: error.message || "删除失败" });
    },
  });
}
