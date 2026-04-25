import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "../services/followApi";

/**
 * 切换关注/取关
 * 入参：{ userId, currentlyFollowing }
 */
export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      currentlyFollowing,
    }: {
      userId: string;
      currentlyFollowing: boolean;
    }) => {
      if (currentlyFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      return { userId, nowFollowing: !currentlyFollowing };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["social", "relation", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["social", "stats", variables.userId],
      });
      // 我自己的关注/好友列表也要刷新
      queryClient.invalidateQueries({
        queryKey: ["social", "stats", "self"],
      });
      queryClient.invalidateQueries({ queryKey: ["social", "following"] });
      queryClient.invalidateQueries({ queryKey: ["social", "followers"] });
      queryClient.invalidateQueries({ queryKey: ["social", "friends"] });
    },
  });
}
