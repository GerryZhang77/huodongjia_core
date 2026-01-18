/**
 * useActivityDetail - 获取活动详情
 */

import { useQuery } from "@tanstack/react-query";
import { getUserActivityDetail } from "../services/userActivityApi";
import type { UserActivity } from "@/services/userApi";

interface ActivityDetailResponse {
  success: boolean;
  data?: UserActivity;
}

/**
 * 获取单个活动详情
 */
export function useActivityDetail(id?: string) {
  return useQuery<ActivityDetailResponse, Error>({
    queryKey: ["user", "activity", id],
    queryFn: () => getUserActivityDetail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}
