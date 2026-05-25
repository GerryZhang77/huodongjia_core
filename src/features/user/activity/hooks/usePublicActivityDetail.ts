/**
 * usePublicActivityDetail - 获取公开活动详情
 */

import { useQuery } from "@tanstack/react-query";
import { getPublicActivityDetail } from "../services/userActivityApi";
import type { UserActivity } from "@/services/userApi";

interface PublicActivityDetailResponse {
  success: boolean;
  data?: UserActivity;
}

export function usePublicActivityDetail(id?: string) {
  return useQuery<PublicActivityDetailResponse, Error>({
    queryKey: ["public", "activity", id],
    queryFn: () => getPublicActivityDetail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
