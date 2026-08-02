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
    onSuccess: (_, { enrollmentIds, status }) => {
      const statusText =
        status === "approved" ? "通过" : status === "rejected" ? "拒绝" : "更新";
      Toast.show({
        icon: "success",
        content: `已${statusText} ${enrollmentIds.length} 条报名`,
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
