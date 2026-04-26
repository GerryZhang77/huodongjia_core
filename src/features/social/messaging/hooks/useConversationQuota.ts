import { useQuery } from "@tanstack/react-query";
import { getConversationQuota, type ConversationQuota } from "../services/messageApi";

/**
 * 会话发送配额：进入聊天室时拉取，决定是否展示陌生人限流提示
 *
 * - 30s staleTime：每次进入聊天室刷新一次
 * - 不放在 useMessages 的 polling 里，避免每 5s 都查
 */
export function useConversationQuota(conversationId: string | null | undefined) {
  return useQuery<ConversationQuota>({
    queryKey: ["messaging", "quota", conversationId ?? ""],
    queryFn: () => getConversationQuota(conversationId!),
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });
}
