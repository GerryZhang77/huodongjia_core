/**
 * useUpdateActivity - 更新活动
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateActivity } from "../services/activityManageApi";
import type { UpdateActivityRequest } from "../types";
import { merchantQueryKeys } from "@/features/merchant/queryKeys";

/**
 * 更新活动 Hook
 */
export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActivityRequest }) =>
      updateActivity(id, data),
    onSuccess: (_, variables) => {
      // 刷新活动详情和列表
      queryClient.invalidateQueries({
        queryKey: merchantQueryKeys.activity(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: merchantQueryKeys.activities(),
      });
      queryClient.invalidateQueries({
        queryKey: merchantQueryKeys.matchingCatalog(variables.id),
      });
    },
  });
}
