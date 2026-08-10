/**
 * 更新报名状态 Hook
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/components/ui/Toast";
import { updateEnrollmentStatus as updateStatusApi } from "../services";
import type { EnrollmentStatus } from "../types";
import { merchantQueryKeys } from "@/features/merchant/queryKeys";

type EnrollmentListData = {
  data?: { enrollments?: Array<{ id: string; status?: EnrollmentStatus }> };
  enrollments?: Array<{ id: string; status?: EnrollmentStatus }>;
} | undefined;

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
    onMutate: async ({ enrollmentIds, status }) => {
      const listKey = merchantQueryKeys.enrollmentList(activityId);
      await queryClient.cancelQueries({ queryKey: listKey });
      const queries = queryClient.getQueriesData<EnrollmentListData>({
        queryKey: listKey,
      });
      const snapshots: Array<[unknown[], EnrollmentListData]> = [];
      const idSet = new Set(enrollmentIds);
      for (const [key, value] of queries) {
        snapshots.push([key as unknown[], value]);
        if (value?.enrollments) {
          queryClient.setQueryData(key as unknown[], {
            ...value,
            enrollments: value.enrollments.map((e) =>
              idSet.has(e.id) ? { ...e, status } : e,
            ),
          });
        } else if (value?.data?.enrollments) {
          queryClient.setQueryData(key as unknown[], {
            ...value,
            data: {
              ...value.data,
              enrollments: value.data.enrollments.map((e) =>
                idSet.has(e.id) ? { ...e, status } : e,
              ),
            },
          });
        }
      }
      return { snapshots };
    },
    onSuccess: (result, { enrollmentIds, status }) => {
      const statusText =
        status === "approved"
          ? "通过"
          : status === "rejected"
            ? "拒绝"
            : status === "waitlist"
              ? "加入候补"
              : "更新";
      const updatedCount = result.data?.updatedCount ?? enrollmentIds.length;
      const smsQueuedCount = result.data?.smsQueuedCount ?? 0;
      const smsSkippedCount = result.data?.smsSkippedCount ?? 0;
      const smsSummary = smsQueuedCount > 0
        ? `，${smsQueuedCount} 条短信已加入发送队列${smsSkippedCount > 0 ? `，${smsSkippedCount} 条跳过` : ""}`
        : "";
      Toast.show({
        icon: "success",
        content: `已${statusText} ${updatedCount} 条报名${smsSummary}`,
      });
    },
    onError: (error, _vars, ctx) => {
      // 回滚
      for (const [key, value] of ctx?.snapshots ?? []) {
        queryClient.setQueryData(key, value);
      }
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "更新失败",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: merchantQueryKeys.enrollmentList(activityId),
      });
      queryClient.invalidateQueries({ queryKey: merchantQueryKeys.activity(activityId) });
      queryClient.invalidateQueries({ queryKey: merchantQueryKeys.activities() });
      queryClient.invalidateQueries({
        queryKey: merchantQueryKeys.matchingParticipants(activityId),
      });
      queryClient.invalidateQueries({
        queryKey: merchantQueryKeys.matchingCatalog(activityId),
      });
      queryClient.invalidateQueries({
        queryKey: ["merchant", "enrollment-statistics", activityId],
      });
      queryClient.invalidateQueries({ queryKey: ["public", "activity", activityId] });
      queryClient.invalidateQueries({ queryKey: ["public", "activities"] });
      queryClient.invalidateQueries({ queryKey: ["user", "activity", activityId] });
      queryClient.invalidateQueries({ queryKey: ["user", "activities"] });
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
