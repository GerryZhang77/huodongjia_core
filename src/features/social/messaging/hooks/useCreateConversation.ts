import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createConversation } from "../services/messageApi";

/**
 * 与某用户开启会话（已存在则复用）
 * 返回会话 id 用于后续跳转
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (peerId: string) => createConversation(peerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
    },
  });
}
