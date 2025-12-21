/**
 * useCreateActivity - 创建活动
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createActivity } from "../services/activityManageApi";
import type { CreateActivityRequest } from "../types";

/**
 * 创建活动 Hook
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityRequest) => createActivity(data),
    onSuccess: () => {
      // 刷新活动列表
      queryClient.invalidateQueries({ queryKey: ["merchant", "activities"] });
    },
  });
}
