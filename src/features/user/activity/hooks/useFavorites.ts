/**
 * useFavorites - 获取收藏列表
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite,
} from "../services/userActivityApi";
import type { UserActivityListResponse } from "@/services/userApi";

/**
 * 获取收藏活动列表
 */
export function useFavorites() {
  return useQuery<UserActivityListResponse, Error>({
    queryKey: ["user", "favorites"],
    queryFn: getFavorites,
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}

/**
 * 添加收藏
 */
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => addFavorite(activityId),
    onSuccess: (_data, activityId) => {
      // 同步该活动的单卡收藏态缓存，避免其它列表页继续显示旧状态
      queryClient.setQueryData(["user", "favorite-status", activityId], {
        success: true,
        data: { favorited: true },
      });
      queryClient.invalidateQueries({ queryKey: ["user", "favorites"] });
      queryClient.invalidateQueries({ queryKey: ["user", "activities"] });
    },
  });
}

/**
 * 取消收藏
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => removeFavorite(activityId),
    onSuccess: (_data, activityId) => {
      // 同步该活动的单卡收藏态缓存
      queryClient.setQueryData(["user", "favorite-status", activityId], {
        success: true,
        data: { favorited: false },
      });
      queryClient.invalidateQueries({ queryKey: ["user", "favorites"] });
      queryClient.invalidateQueries({ queryKey: ["user", "activities"] });
    },
  });
}

/**
 * 切换收藏状态（乐观更新：立即翻转本地缓存，失败回滚）
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  type FavStatus = { success: boolean; data: { favorited: boolean } };

  return useMutation({
    mutationFn: (activityId: string) => toggleFavorite(activityId),
    onMutate: async (activityId) => {
      const key = ["user", "favorite-status", activityId];
      // 取消进行中的查询，避免覆盖乐观值
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<FavStatus>(key);
      // 立即翻转
      queryClient.setQueryData<FavStatus>(key, (old) => ({
        success: true,
        data: { favorited: !old?.data?.favorited },
      }));
      return { prev, key };
    },
    onError: (_err, _activityId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: (_data, _err, activityId) => {
      // 列表/聚合数据走 invalidate 校准；favorite-status 信任乐观值
      queryClient.invalidateQueries({ queryKey: ["user", "favorites"] });
      queryClient.invalidateQueries({ queryKey: ["user", "activities"] });
      queryClient.invalidateQueries({
        queryKey: ["user", "favorite-status", activityId],
      });
    },
  });
}
