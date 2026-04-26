import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptExchange,
  rejectExchange,
  requestExchange,
  type Contacts,
} from "../services/contactExchangeApi";
import type { ChatMessage } from "../../messaging/services/messageApi";

type MessagesData = { messages: ChatMessage[] } | undefined;

/**
 * 把所有消息列表 cache 中 payload.exchangeId === id 的消息状态改为指定值
 * 返回快照用于错误回滚
 */
function patchExchangeMessageStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  exchangeId: string,
  newStatus: ChatMessage["status"],
) {
  const queries = queryClient.getQueriesData<MessagesData>({
    queryKey: ["messages", "list"],
  });
  const snapshots: Array<[unknown[], MessagesData]> = [];
  for (const [key, value] of queries) {
    snapshots.push([key as unknown[], value]);
    if (!value?.messages) continue;
    const next = value.messages.map((m) => {
      const pid = (m.payload as { exchangeId?: string } | null | undefined)?.exchangeId;
      return pid === exchangeId ? { ...m, status: newStatus } : m;
    });
    queryClient.setQueryData<MessagesData>(key as unknown[], { messages: next });
  }
  return snapshots;
}

/**
 * 发起交换请求
 */
export function useRequestExchange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      receiverId,
      contacts,
    }: {
      receiverId: string;
      contacts: Contacts;
    }) => requestExchange({ receiverId, contacts }),
    onSuccess: () => {
      // 刷新会话和消息
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
      queryClient.invalidateQueries({ queryKey: ["messages", "list"] });
    },
  });
}

/**
 * 接受交换请求（乐观更新对应 message.status）
 */
export function useAcceptExchange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      contacts,
    }: {
      id: string;
      contacts: Contacts;
    }) => acceptExchange(id, contacts),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", "list"] });
      const snapshots = patchExchangeMessageStatus(queryClient, id, "accepted");
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      for (const [key, value] of ctx?.snapshots ?? []) {
        queryClient.setQueryData(key, value);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
    },
  });
}

/**
 * 拒绝交换请求（乐观更新）
 */
export function useRejectExchange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectExchange(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["messages", "list"] });
      const snapshots = patchExchangeMessageStatus(queryClient, id, "rejected");
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      for (const [key, value] of ctx?.snapshots ?? []) {
        queryClient.setQueryData(key, value);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
    },
  });
}
