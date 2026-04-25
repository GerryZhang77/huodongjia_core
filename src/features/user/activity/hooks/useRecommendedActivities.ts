/**
 * useRecommendedActivities - 获取推荐活动
 */

import { useQuery } from "@tanstack/react-query";
import { getRecommendedActivities } from "../services/userActivityApi";
import type { UserActivityListResponse } from "@/services/userApi";

/**
 * 获取推荐活动列表 (首页)
 */
export function useRecommendedActivities() {
  return useQuery<UserActivityListResponse, Error>({
    queryKey: ["user", "activities", "recommended"],
    queryFn: getRecommendedActivities,
    staleTime: 15 * 60 * 1000, // 15分钟（首页推荐相对稳定）
    gcTime: 30 * 60 * 1000,
  });
}
