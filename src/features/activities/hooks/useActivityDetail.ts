/**
 * 获取活动详情 Hook
 */

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toast } from "@/components/ui/Toast";
import { getActivityById } from "../services";
import { useActivityStore } from "../stores";
import { demoActivity, isDemoActivity } from "@/mocks/demo-activity";
import {
  merchantCacheTimes,
  merchantQueryKeys,
} from "@/features/merchant/queryKeys";

export const useActivityDetail = (activityId: string | undefined) => {
  const { setCurrentActivity } = useActivityStore();

  const query = useQuery({
    queryKey: merchantQueryKeys.activity(activityId),
    queryFn: () =>
      isDemoActivity(activityId!)
        ? Promise.resolve(demoActivity)
        : getActivityById(activityId!),
    enabled: Boolean(activityId),
    staleTime: merchantCacheTimes.activityStale,
    gcTime: merchantCacheTimes.activityGc,
  });

  useEffect(() => {
    setCurrentActivity(query.data ?? null);
  }, [query.data, setCurrentActivity]);

  useEffect(() => {
    if (!query.error) return;
    console.error("获取活动详情失败:", query.error);
    Toast.show({ icon: "fail", content: "获取活动详情失败" });
  }, [query.error]);

  return {
    activity: query.data ?? null,
    loading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
