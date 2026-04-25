import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendMessage,
  type MessageType,
} from "../services/messageApi";

interface SendArgs {
  conversationId: string;
  content: string;
  message_type?: MessageType;
  payload?: Record<string, unknown>;
}

/**
 * 发送消息
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, content, message_type, payload }: SendArgs) =>
      sendMessage(conversationId, { content, message_type, payload }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", "list", variables.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
    },
  });
}
