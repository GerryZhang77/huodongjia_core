/**
 * useMerchantActivities - 获取商家活动列表
 */

import { useQuery } from "@tanstack/react-query";
import { getMerchantActivities } from "../services/activityManageApi";
import type { ActivityListResponse } from "@/services/activityApi";

/**
 * 获取商家的活动列表
 */
export function useMerchantActivities() {
  return useQuery<ActivityListResponse, Error>({
    queryKey: ["merchant", "activities"],
    queryFn: () => getMerchantActivities(),
    // 报名人数和活动状态会变化：短缓存秒开，并允许 30 秒后后台刷新。
    staleTime: 30 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}
