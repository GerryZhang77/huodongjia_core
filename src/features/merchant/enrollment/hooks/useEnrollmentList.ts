/**
 * useEnrollmentList - 获取报名列表
 */

import { useQuery } from "@tanstack/react-query";
import { getEnrollmentsDetailed } from "@/features/enrollment/services/enrollmentApi";
import type { EnrollmentListResponse } from "@/features/enrollment/types";
import {
  merchantCacheTimes,
  merchantQueryKeys,
} from "@/features/merchant/queryKeys";

/**
 * 获取活动的报名列表
 */
export function useEnrollmentList(activityId: string | undefined) {
  return useQuery<EnrollmentListResponse, Error>({
    queryKey: merchantQueryKeys.enrollmentList(activityId),
    queryFn: () =>
      getEnrollmentsDetailed(activityId!, { page: 1, pageSize: 1000 }),
    enabled: !!activityId,
    staleTime: merchantCacheTimes.enrollmentStale,
    gcTime: merchantCacheTimes.enrollmentGc,
  });
}
