import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markConversationRead } from "../services/messageApi";

/**
 * 标记会话已读
 * - 进入聊天页时调用
 */
export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => markConversationRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
      queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
      queryClient.invalidateQueries({
        queryKey: ["messages", "list", conversationId],
      });
    },
  });
}
