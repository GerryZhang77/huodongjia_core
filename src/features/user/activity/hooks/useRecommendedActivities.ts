/**
 * useRecommendedActivities - 获取推荐活动
 */

import { useQuery } from "@tanstack/react-query";
import {
  getPublicActivityList,
  getRecommendedActivities,
} from "../services/userActivityApi";
import type { UserActivityListResponse } from "@/services/userApi";

/**
 * 获取推荐活动列表 (首页)
 */
export function useRecommendedActivities(options?: { guest?: boolean }) {
  const guest = options?.guest === true;

  return useQuery<UserActivityListResponse, Error>({
    queryKey: guest
      ? ["public", "activities"]
      : ["user", "activities", "recommended"],
    queryFn: () =>
      guest ? getPublicActivityList() : getRecommendedActivities(),
    staleTime: 15 * 60 * 1000, // 15分钟（首页推荐相对稳定）
    gcTime: 30 * 60 * 1000,
  });
}
