/**
 * useFavoriteActivity - 收藏活动
 * @deprecated 请使用 useFavorites.ts 中的 useToggleFavorite
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFavorite } from "../services/userActivityApi";

/**
 * 收藏/取消收藏活动
 * @deprecated 请使用 useToggleFavorite
 */
export function useFavoriteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => toggleFavorite(activityId),
    onSuccess: () => {
      // 刷新收藏列表和推荐列表
      queryClient.invalidateQueries({
        queryKey: ["user", "favorites"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", "activities"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", "activities", "recommended"],
      });
    },
  });
}
