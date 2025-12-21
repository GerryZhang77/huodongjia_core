/**
 * useEnrollmentStatus - 检查报名状态
 */

import { useQuery } from "@tanstack/react-query";
import { checkEnrollmentStatus } from "../services/userEnrollmentApi";

/**
 * 检查用户是否已报名某活动
 */
export function useEnrollmentStatus(activityId: string | undefined) {
  return useQuery({
    queryKey: ["user", "enrollment-status", activityId],
    queryFn: () => checkEnrollmentStatus(activityId!),
    enabled: !!activityId,
    staleTime: 1 * 60 * 1000, // 1分钟
  });
}
