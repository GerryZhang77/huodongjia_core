/**
 * useActivityDetail - 获取活动详情 Hook (共享)
 */

import { useQuery } from "@tanstack/react-query";
import { getActivityDetail } from "../services/activityApi";
import type { ActivityDetailResponse } from "@/services/activityApi";

/**
 * 获取活动详情
 */
export function useActivityDetail(id: string | undefined) {
  return useQuery<ActivityDetailResponse, Error>({
    queryKey: ["activity", "detail", id],
    queryFn: () => getActivityDetail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}
