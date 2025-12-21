/**
 * useSearchActivities - 搜索活动
 */

import { useQuery } from "@tanstack/react-query";
import { searchActivities } from "../services/userActivityApi";
import type {
  ActivityListResponse,
  ActivityQueryParams,
} from "@/services/activityApi";

/**
 * 搜索活动
 */
export function useSearchActivities(params: ActivityQueryParams) {
  return useQuery<ActivityListResponse, Error>({
    queryKey: ["user", "activities", "search", params],
    queryFn: () => searchActivities(params),
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}
