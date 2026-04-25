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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "favorites"] });
      queryClient.invalidateQueries({ queryKey: ["user", "activities"] });
    },
  });
}

/**
 * 切换收藏状态
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => toggleFavorite(activityId),
    onSuccess: (_, activityId) => {
      queryClient.invalidateQueries({ queryKey: ["user", "favorites"] });
      queryClient.invalidateQueries({ queryKey: ["user", "activities"] });
      queryClient.invalidateQueries({
        queryKey: ["user", "favorite-status", activityId],
      });
    },
  });
}
