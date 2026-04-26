import { useInfiniteQuery } from "@tanstack/react-query";
import { listDiscoverableUsers, type DiscoverableUser } from "../services/discoverApi";

/**
 * "发现用户" 列表（cursor 分页）
 */
export function useDiscoverUsers(keyword: string = "") {
  return useInfiniteQuery({
    queryKey: ["user", "discover-users", keyword],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const res = await listDiscoverableUsers({
        cursor: pageParam,
        keyword,
        limit: 20,
      });
      if (!res.success) {
        return { users: [] as DiscoverableUser[], nextCursor: null, hasMore: false };
      }
      return res.data!;
    },
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
    staleTime: 30 * 1000,
  });
}
