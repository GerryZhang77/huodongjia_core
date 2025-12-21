/**
 * useFavoriteActivity - 收藏活动
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFavoriteActivity } from "../services/userActivityApi";

/**
 * 收藏/取消收藏活动
 */
export function useFavoriteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => toggleFavoriteActivity(activityId),
    onSuccess: () => {
      // 刷新收藏列表和推荐列表
      queryClient.invalidateQueries({
        queryKey: ["user", "activities", "favorites"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", "activities", "recommended"],
      });
    },
  });
}
