import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { merchantApi } from "@/services";
import {
  getMerchantUserPool,
  listCustomTags,
} from "@/features/merchant/user-pool/services/userPoolApi";
import { getMerchantActivities } from "@/features/merchant/activity-manage/services/activityManageApi";
import type { CustomTag } from "@/features/merchant/user-pool/types";

/**
 * 商家端 Tab/Sidebar 预拉取钩子
 *
 * react-query 的 prefetchQuery 是幂等的：同 key 的数据未过期时不会再次请求。
 * 在底部 Tab / 侧边栏上 hover 或 pointerdown 时调用，给页面切换争取几百毫秒。
 *
 * queryKey 与 staleTime **必须** 与各页面真正使用的 useQuery 保持一致。
 */

/** 商家个人中心 / 编辑页共享 */
export function usePrefetchMerchantProfile() {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.prefetchQuery({
      queryKey: ["merchant", "profile"],
      queryFn: () => merchantApi.getMerchantProfile(),
      staleTime: 5 * 60 * 1000,
    });
  }, [qc]);
}

/** 商家用户池：用户池 + 自定义标签 + 活动列表 三个核心查询 */
export function usePrefetchMerchantUserPool() {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.prefetchQuery({
      queryKey: ["merchant", "user-pool"],
      queryFn: async () => {
        const res = await getMerchantUserPool();
        return res.success ? (res.data?.users ?? []) : [];
      },
      staleTime: 60 * 1000,
    });
    qc.prefetchQuery<CustomTag[]>({
      queryKey: ["merchant", "user-pool", "custom-tags"],
      queryFn: async () => {
        const res = await listCustomTags();
        if (!res.success) return [];
        return (res.data?.tags || []).map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
          userCount: t.userCount,
          createdAt: t.createdAt,
        }));
      },
      staleTime: 5 * 60 * 1000,
    });
    qc.prefetchQuery({
      queryKey: ["merchant", "activities"],
      queryFn: () => getMerchantActivities(),
      staleTime: 30 * 1000,
    });
  }, [qc]);
}
