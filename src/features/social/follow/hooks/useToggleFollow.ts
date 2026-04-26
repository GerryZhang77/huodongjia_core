import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "../services/followApi";
import type { FollowRelation } from "../services/followApi";

/**
 * 切换关注/取关（乐观更新关系数据，stats 由 onSettled 校准）
 * 入参：{ userId, currentlyFollowing }
 *
 * 注意：useFollowRelation 通过 getRelation() 写入缓存的是解包后的 FollowRelation
 * 对象（{ isFollowing, isFollowedBy, isFriend, ... }），所以这里 setQueryData
 * 必须用同一种形状，否则 FollowButton 读取 relation.isFollowing 会拿到 undefined。
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
    onMutate: async ({ userId, currentlyFollowing }) => {
      const relKey = ["social", "relation", userId];
      await queryClient.cancelQueries({ queryKey: relKey });
      const prevRelation = queryClient.getQueryData<FollowRelation>(relKey);
      // 立即翻转关系（保持 FollowRelation 解包形状，与 useFollowRelation 一致）
      queryClient.setQueryData<FollowRelation>(relKey, (old) => {
        const isFollowedBy = old?.isFollowedBy ?? false;
        const nowFollowing = !currentlyFollowing;
        return {
          isSelf: old?.isSelf ?? false,
          isFollowing: nowFollowing,
          isFollowedBy,
          isFriend: nowFollowing && isFollowedBy,
        };
      });
      return { prevRelation, relKey };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevRelation) {
        queryClient.setQueryData(ctx.relKey, ctx.prevRelation);
      }
    },
    onSettled: (_data, _err, variables) => {
      // relation 的乐观值由 onMutate 写入；这里只校准数字类 stats，避免重新拉取关系导致按钮抖动
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
