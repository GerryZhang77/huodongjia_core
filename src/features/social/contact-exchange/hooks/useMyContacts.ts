import { useQuery } from "@tanstack/react-query";
import { getMyContacts } from "../services/contactExchangeApi";

/**
 * 我自己的联系方式（phone/email/wechat）
 * 用于：
 * - 发起交换前预检查（hasAny 决定能不能发）
 * - 发起请求时勾选要分享的字段
 */
export function useMyContacts() {
  return useQuery({
    queryKey: ["contact-exchange", "my-contacts"],
    queryFn: getMyContacts,
    staleTime: 60 * 1000,
  });
}
