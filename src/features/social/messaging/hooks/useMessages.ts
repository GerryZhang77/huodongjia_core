import { useQuery } from "@tanstack/react-query";
import { listMessages } from "../services/messageApi";

/**
 * 拉取某会话的消息列表（轮询）
 * - 进入聊天页时调用
 * - 默认每 5 秒轮询拉取新消息
 */
export function useMessages(
  conversationId: string | undefined,
  options?: { pollInterval?: number; limit?: number },
) {
  return useQuery({
    queryKey: ["messages", "list", conversationId, options?.limit],
    queryFn: () =>
      listMessages(conversationId!, { limit: options?.limit ?? 50 }),
    enabled: !!conversationId,
    refetchInterval: options?.pollInterval ?? 5 * 1000,
    staleTime: 1000,
  });
}
