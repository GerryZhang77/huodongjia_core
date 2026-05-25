/**
 * useUserActivities - 获取用户活动列表（我的活动）
 */

import { useQuery } from "@tanstack/react-query";
import { getUserActivities } from "../services/userActivityApi";
import type { UserActivityListResponse } from "@/services/userApi";

interface UseUserActivitiesParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

interface UseUserActivitiesOptions {
  enabled?: boolean;
}

/**
 * 获取用户活动列表
 */
export function useUserActivities(
  params?: UseUserActivitiesParams,
  options?: UseUserActivitiesOptions,
) {
  return useQuery<UserActivityListResponse, Error>({
    queryKey: ["user", "activities", params],
    queryFn: () => getUserActivities(params),
    enabled: options?.enabled ?? true,
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}
