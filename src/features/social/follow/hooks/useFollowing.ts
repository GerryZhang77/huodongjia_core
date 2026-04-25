import { useQuery } from "@tanstack/react-query";
import { getFollowing } from "../services/followApi";

export function useFollowing(
  userId: string | undefined,
  params?: { page?: number; pageSize?: number },
) {
  return useQuery({
    queryKey: ["social", "following", userId, params],
    queryFn: () => getFollowing(userId!, params),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
