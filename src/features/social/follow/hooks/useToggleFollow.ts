import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "../services/followApi";

/**
 * 切换关注/取关（乐观更新关系数据，stats 由 onSettled 校准）
 * 入参：{ userId, currentlyFollowing }
 */
export function useToggleFollow() {
  const queryClient = useQueryClient();

  type Relation = {
    success: boolean;
    data: {
      isSelf: boolean;
      isFollowing: boolean;
      isFollowedBy: boolean;
      isFriend: boolean;
    };
  };

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
    onMutate: async ({ userId, currentlyFollowing }) => {
      const relKey = ["social", "relation", userId];
      await queryClient.cancelQueries({ queryKey: relKey });
      const prevRelation = queryClient.getQueryData<Relation>(relKey);
      // 立即翻转关系
      queryClient.setQueryData<Relation>(relKey, (old) => ({
        success: true,
        data: {
          isSelf: old?.data?.isSelf ?? false,
          isFollowing: !currentlyFollowing,
          isFollowedBy: old?.data?.isFollowedBy ?? false,
          isFriend:
            (!currentlyFollowing) && (old?.data?.isFollowedBy ?? false),
        },
      }));
      return { prevRelation, relKey };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevRelation) {
        queryClient.setQueryData(ctx.relKey, ctx.prevRelation);
      }
    },
    onSettled: (_data, _err, variables) => {
      // 数字类 stats 由后端校准，避免乐观偏差
      queryClient.invalidateQueries({
        queryKey: ["social", "stats", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["social", "stats", "self"] });
      queryClient.invalidateQueries({ queryKey: ["social", "following"] });
      queryClient.invalidateQueries({ queryKey: ["social", "followers"] });
      queryClient.invalidateQueries({ queryKey: ["social", "friends"] });
    },
  });
}
