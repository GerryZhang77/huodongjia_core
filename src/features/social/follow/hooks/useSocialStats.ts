import { useQuery } from "@tanstack/react-query";
import { getSocialStats } from "../services/followApi";

export function useSocialStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["social", "stats", userId],
    queryFn: () => getSocialStats(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
