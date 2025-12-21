/**
 * useMyEnrollments - 获取我的报名列表
 */

import { useQuery } from "@tanstack/react-query";
import { getMyEnrollments } from "../services/userEnrollmentApi";
import type { EnrollmentListResponse } from "@/services/enrollmentApi";

/**
 * 获取我的报名列表
 */
export function useMyEnrollments() {
  return useQuery<EnrollmentListResponse, Error>({
    queryKey: ["user", "enrollments"],
    queryFn: getMyEnrollments,
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}
