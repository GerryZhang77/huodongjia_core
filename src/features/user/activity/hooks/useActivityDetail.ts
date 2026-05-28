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
export function useActivityDetail(id?: string, registrationTypeId?: string) {
  return useQuery<ActivityDetailResponse, Error>({
    queryKey: ["user", "activity", id, registrationTypeId || ""],
    queryFn: () => getUserActivityDetail(id!, registrationTypeId),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15分钟（活动详情相对稳定）
    gcTime: 30 * 60 * 1000,
  });
}
