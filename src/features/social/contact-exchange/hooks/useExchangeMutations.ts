import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptExchange,
  rejectExchange,
  requestExchange,
  type Contacts,
} from "../services/contactExchangeApi";

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
 * 接受交换请求
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
    },
  });
}

/**
 * 拒绝交换请求
 */
export function useRejectExchange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectExchange(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["messages", "conversations"],
      });
    },
  });
}
