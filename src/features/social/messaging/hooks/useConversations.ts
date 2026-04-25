import { useQuery } from "@tanstack/react-query";
import { listConversations } from "../services/messageApi";

/**
 * 我的会话列表（轮询）
 */
export function useConversations(options?: { pollInterval?: number }) {
  return useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: listConversations,
    refetchInterval: options?.pollInterval ?? 30 * 1000,
    staleTime: 5 * 1000,
  });
}
