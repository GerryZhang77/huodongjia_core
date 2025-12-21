/**
 * useMatchResult - 获取匹配结果
 */

import { useQuery } from "@tanstack/react-query";
import { getMatchResult } from "../services/matchingApi";
import type { MatchResult } from "@/services/matchingApi";

/**
 * 获取活动的匹配结果
 */
export function useMatchResult(activityId: string | undefined) {
  return useQuery<{ success: boolean; result?: MatchResult }, Error>({
    queryKey: ["merchant", "matching", "result", activityId],
    queryFn: () => getMatchResult(activityId!),
    enabled: !!activityId,
  });
}
