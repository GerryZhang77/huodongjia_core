import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendMessage,
  type ChatMessage,
  type MessageType,
} from "../services/messageApi";
import { useAuthStore } from "@/features/auth/stores/authStore";

interface SendArgs {
  conversationId: string;
  receiverId?: string;
  content: string;
  message_type?: MessageType;
  payload?: Record<string, unknown>;
  /** 重试时复用同一 tempId；首次发送可省略 */
  _tempId?: string;
}

type MessagesData = { messages: ChatMessage[] } | undefined;

/**
 * 发送消息（pending + tempId 乐观更新）
 *
 * 体验：
 * - 点击发送的瞬间消息以「pending」状态出现在底部，输入框立刻清空可继续打字
 * - server 返回成功 → 用真实 id/created_at 替换占位
 * - 失败 → 占位项保留并标记 'failed'，UI 渲染「重试 / 删除」按钮
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      message_type,
      payload,
    }: SendArgs) =>
      sendMessage(conversationId, { content, message_type, payload }),
    onMutate: async (vars) => {
      const { conversationId, content, message_type, payload, receiverId } = vars;
      const tempId = vars._tempId || `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // 取消轮询，避免乐观更新被覆盖
      const listKeyPrefix = ["messages", "list", conversationId];
      await queryClient.cancelQueries({ queryKey: listKeyPrefix });

      const optimistic: ChatMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUser?.id || "",
        receiver_id: receiverId || "",
        content,
        message_type: message_type || "text",
        payload: payload ?? null,
        status: "pending",
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
        _clientState: "pending",
      };

      // 给所有匹配 ["messages","list", conversationId, *] 的缓存追加占位
      const queries = queryClient.getQueriesData<MessagesData>({
        queryKey: listKeyPrefix,
      });
      const snapshots: Array<[unknown[], MessagesData]> = [];
      for (const [key, value] of queries) {
        snapshots.push([key as unknown[], value]);
        // 重试场景：先把同 tempId 的旧 failed 项替换掉
        const existing = value?.messages?.find((m) => m.id === tempId);
        const next: ChatMessage[] = existing
          ? (value?.messages || []).map((m) => (m.id === tempId ? optimistic : m))
          : [...(value?.messages || []), optimistic];
        queryClient.setQueryData<MessagesData>(key as unknown[], { messages: next });
      }

      return { tempId, snapshots };
    },
    onSuccess: (data, vars, ctx) => {
      const { conversationId } = vars;
      const tempId = ctx?.tempId;
      if (!tempId) return;

      // 用 server 返回的 message 替换临时项（保留位置、id 改为真实值）
      const queries = queryClient.getQueriesData<MessagesData>({
        queryKey: ["messages", "list", conversationId],
      });
      for (const [key, value] of queries) {
        if (!value?.messages) continue;
        const next = value.messages.map((m) =>
          m.id === tempId ? { ...data.message, _clientState: undefined } : m,
        );
        queryClient.setQueryData<MessagesData>(key as unknown[], { messages: next });
      }
      // 会话列表（最近消息）需要刷新
      queryClient.invalidateQueries({ queryKey: ["messages", "conversations"] });
    },
    onError: (_err, vars, ctx) => {
      const { conversationId } = vars;
      const tempId = ctx?.tempId;
      if (!tempId) return;

      // 把临时项标记为 failed（保留在列表，用户可重试 / 删除）
      const queries = queryClient.getQueriesData<MessagesData>({
        queryKey: ["messages", "list", conversationId],
      });
      for (const [key, value] of queries) {
        if (!value?.messages) continue;
        const next = value.messages.map((m) =>
          m.id === tempId ? { ...m, _clientState: "failed" as const } : m,
        );
        queryClient.setQueryData<MessagesData>(key as unknown[], { messages: next });
      }
    },
  });
}

/**
 * 从本地 cache 删除一条 failed 消息（不调 API）
 */
export function dropFailedMessage(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  messageId: string,
) {
  const queries = queryClient.getQueriesData<MessagesData>({
    queryKey: ["messages", "list", conversationId],
  });
  for (const [key, value] of queries) {
    if (!value?.messages) continue;
    queryClient.setQueryData<MessagesData>(key as unknown[], {
      messages: value.messages.filter((m) => m.id !== messageId),
    });
  }
}
