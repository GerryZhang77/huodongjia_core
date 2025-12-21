/**
 * useEnrollmentList - 获取报名列表
 */

import { useQuery } from "@tanstack/react-query";
import { getEnrollmentList } from "../services/enrollmentManageApi";
import type { EnrollmentListResponse } from "@/services/enrollmentApi";

/**
 * 获取活动的报名列表
 */
export function useEnrollmentList(activityId: string | undefined) {
  return useQuery<EnrollmentListResponse, Error>({
    queryKey: ["merchant", "enrollment", "list", activityId],
    queryFn: () => getEnrollmentList(activityId!),
    enabled: !!activityId,
    staleTime: 1 * 60 * 1000, // 1分钟
  });
}
