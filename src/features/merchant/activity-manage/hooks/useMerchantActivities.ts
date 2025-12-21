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
    queryFn: getMerchantActivities,
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}
