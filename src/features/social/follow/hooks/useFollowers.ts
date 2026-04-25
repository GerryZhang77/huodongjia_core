import { useQuery } from "@tanstack/react-query";
import { getFollowers } from "../services/followApi";

export function useFollowers(
  userId: string | undefined,
  params?: { page?: number; pageSize?: number },
) {
  return useQuery({
    queryKey: ["social", "followers", userId, params],
    queryFn: () => getFollowers(userId!, params),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
