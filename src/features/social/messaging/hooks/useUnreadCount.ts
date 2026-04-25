import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "../services/messageApi";

/**
 * 全部未读私信数（用于顶部 badge）
 * - 默认每 30 秒轮询
 */
export function useUnreadCount(options?: {
  pollInterval?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: options?.pollInterval ?? 30 * 1000,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 1000,
  });
}
