/**
 * useDeleteActivity - 删除活动（乐观更新：先从列表 cache 中移除，失败回滚）
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteActivity } from "../services/activityManageApi";

type ActivityListData = {
  data?: { activities?: Array<{ id: string }> };
} | undefined;

/**
 * 删除活动 Hook
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => deleteActivity(activityId),
    onMutate: async (activityId) => {
      await queryClient.cancelQueries({ queryKey: ["merchant", "activities"] });

      // 抓所有 ["merchant","activities",*] 的快照（不同分页/筛选会有多份缓存）
      const queries = queryClient.getQueriesData<ActivityListData>({
        queryKey: ["merchant", "activities"],
      });
      const snapshots: Array<[unknown[], ActivityListData]> = [];
      for (const [key, value] of queries) {
        snapshots.push([key as unknown[], value]);
        if (!value?.data?.activities) continue;
        queryClient.setQueryData(key as unknown[], {
          ...value,
          data: {
            ...value.data,
            activities: value.data.activities.filter((a) => a.id !== activityId),
          },
        });
      }
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      for (const [key, value] of ctx?.snapshots ?? []) {
        queryClient.setQueryData(key, value);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant", "activities"] });
    },
  });
}
