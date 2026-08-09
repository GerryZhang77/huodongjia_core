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

export function usePublicActivityDetail(id?: string, registrationTypeId?: string) {
  return useQuery<PublicActivityDetailResponse, Error>({
    queryKey: ["public", "activity", id, registrationTypeId || ""],
    queryFn: () => getPublicActivityDetail(id!, registrationTypeId),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
