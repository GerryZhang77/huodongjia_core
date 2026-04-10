/**
 * useSubmitEnrollment - 提交报名
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitEnrollment } from "../services/userEnrollmentApi";
import type { EnrollmentFormData } from "../types";

/**
 * 提交报名 Hook
 */
export function useSubmitEnrollment(activityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnrollmentFormData) =>
      submitEnrollment(activityId, data),
    onSuccess: () => {
      // 刷新我的报名列表
      queryClient.invalidateQueries({ queryKey: ["user", "enrollments"] });
      // 刷新活动详情 (更新报名状态) - 修复：使用正确的 queryKey
      queryClient.invalidateQueries({
        queryKey: ["user", "activity", activityId],
      });
      // 刷新报名状态
      queryClient.invalidateQueries({
        queryKey: ["user", "enrollment-status", activityId],
      });
    },
  });
}
