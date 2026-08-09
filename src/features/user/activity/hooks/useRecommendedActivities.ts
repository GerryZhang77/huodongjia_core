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
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
