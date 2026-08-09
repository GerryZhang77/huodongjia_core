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
    // 活动主体较稳定，但名额是高频动态数据；重新进入页面时必须校准。
    staleTime: 30 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
