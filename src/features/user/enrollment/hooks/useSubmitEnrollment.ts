/**
 * useSubmitEnrollment - 提交报名
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitEnrollment } from "../services/userEnrollmentApi";
import type { EnrollmentFormData } from "../types";
import type { EnrollmentImageAnswers } from "@/services/enrollmentApi";

export interface SubmitEnrollmentInput {
  enrollment: EnrollmentFormData;
  imageAnswers?: EnrollmentImageAnswers;
}

/**
 * 提交报名 Hook
 */
export function useSubmitEnrollment(activityId: string, registrationTypeId?: string) {
  const queryClient = useQueryClient();

  const refreshActivityCapacity = () => {
    queryClient.invalidateQueries({ queryKey: ["user", "activity", activityId] });
    queryClient.invalidateQueries({ queryKey: ["public", "activity", activityId] });
    queryClient.invalidateQueries({ queryKey: ["public", "activities"] });
    queryClient.invalidateQueries({ queryKey: ["user", "activities", "recommended"] });
    queryClient.invalidateQueries({ queryKey: ["user", "favorites"] });
  };

  return useMutation({
    mutationFn: (input: SubmitEnrollmentInput) =>
      submitEnrollment(
        activityId,
        input.enrollment,
        registrationTypeId,
        input.imageAnswers,
      ),
    onSuccess: () => {
      // 刷新我的报名列表
      queryClient.invalidateQueries({ queryKey: ["user", "enrollments"] });
      refreshActivityCapacity();
      // 刷新报名状态
      queryClient.invalidateQueries({
        queryKey: ["user", "enrollment-status", activityId],
      });
    },
    onError: (error: unknown) => {
      const code = (error as { response?: { data?: { code?: string } } })
        ?.response?.data?.code;
      if (code === "EVENT_CAPACITY_FULL" || code === "REGISTRATION_OPTION_FULL") {
        refreshActivityCapacity();
      }
    },
  });
}
