/**
 * useExecuteMatching - 执行匹配
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { executeMatching } from "../services/matchingApi";
import type { ExecuteMatchRequest } from "../types";

/**
 * 执行匹配 Hook
 */
export function useExecuteMatching(activityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExecuteMatchRequest) =>
      executeMatching(activityId, data),
    onSuccess: () => {
      // 刷新匹配结果
      queryClient.invalidateQueries({
        queryKey: ["merchant", "matching", "result", activityId],
      });
    },
  });
}
