/**
 * 更新报名状态 Hook
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/components/ui/Toast";
import { updateEnrollmentStatus as updateStatusApi } from "../services";
import type { EnrollmentStatus } from "../types";

export const useUpdateEnrollmentStatus = (activityId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      enrollmentIds,
      status,
    }: {
      enrollmentIds: string[];
      status: EnrollmentStatus;
    }) => updateStatusApi({ activityId, enrollmentIds, status }),
    onSuccess: (_, { enrollmentIds, status }) => {
      const statusText =
        status === "approved" ? "通过" : status === "rejected" ? "拒绝" : "更新";
      Toast.show({
        icon: "success",
        content: `已${statusText} ${enrollmentIds.length} 条报名`,
      });
      queryClient.invalidateQueries({
        queryKey: ["merchant", "enrollment", "list", activityId],
      });
      queryClient.invalidateQueries({ queryKey: ["activity", "detail", activityId] });
      queryClient.invalidateQueries({ queryKey: ["merchant", "activities"] });
    },
    onError: (error) => {
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "更新失败",
      });
    },
  });

  const updateStatus = (
    enrollmentIds: string[],
    status: EnrollmentStatus,
    onSuccess?: () => void
  ) => {
    if (enrollmentIds.length === 0) {
      Toast.show({ icon: "fail", content: "请先选择要操作的报名" });
      return;
    }
    mutation.mutate({ enrollmentIds, status }, { onSuccess });
  };

  return { updateStatus, loading: mutation.isPending };
};
