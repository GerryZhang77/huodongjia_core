import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getUserActivityDetail } from "@/features/user/activity/services/userActivityApi";

/**
 * 返回 prefetch 函数：列表 hover/可见时调用，提前拉取活动详情。
 * react-query 的 prefetchQuery 自带去重：若数据未过期，不会重新请求。
 *
 * @example
 * const prefetch = usePrefetchActivityDetail();
 * <Card onMouseEnter={() => prefetch(id)} ... />
 */
export function usePrefetchActivityDetail() {
  const qc = useQueryClient();
  return useCallback(
    (id?: string) => {
      if (!id) return;
      qc.prefetchQuery({
        queryKey: ["user", "activity", id],
        queryFn: () => getUserActivityDetail(id),
        staleTime: 15 * 60 * 1000,
      });
    },
    [qc]
  );
}
