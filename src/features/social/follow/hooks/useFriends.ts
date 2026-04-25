import { useQuery } from "@tanstack/react-query";
import { getFriends } from "../services/followApi";

export function useFriends(userId: string | undefined) {
  return useQuery({
    queryKey: ["social", "friends", userId],
    queryFn: () => getFriends(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
