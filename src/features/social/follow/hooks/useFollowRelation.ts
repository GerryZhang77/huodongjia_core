import { useQuery } from "@tanstack/react-query";
import { getRelation } from "../services/followApi";

/**
 * 我与某用户的关系（是否已关注 / 是否互关）
 */
export function useFollowRelation(userId: string | undefined) {
  return useQuery({
    queryKey: ["social", "relation", userId],
    queryFn: () => getRelation(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}
