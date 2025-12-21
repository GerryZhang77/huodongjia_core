/**
 * useDeleteActivity - 删除活动
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteActivity } from "../services/activityManageApi";

/**
 * 删除活动 Hook
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => deleteActivity(activityId),
    onSuccess: () => {
      // 刷新活动列表
      queryClient.invalidateQueries({ queryKey: ["merchant", "activities"] });
    },
  });
}
