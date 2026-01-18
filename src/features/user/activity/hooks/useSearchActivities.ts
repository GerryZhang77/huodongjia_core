/**
 * useSearchActivities - 搜索活动
 */

import { useQuery } from "@tanstack/react-query";
import { searchActivities } from "../services/userActivityApi";
import type { UserActivityListResponse } from "@/services/userApi";

export interface SearchActivitiesParams {
  keyword?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 搜索活动
 */
export function useSearchActivities(params: SearchActivitiesParams) {
  return useQuery<UserActivityListResponse, Error>({
    queryKey: ["user", "activities", "search", params],
    queryFn: () => searchActivities(params),
    staleTime: 2 * 60 * 1000, // 2分钟
    enabled: !!params.keyword || !!params.category, // 只有有搜索条件时才查询
  });
}
