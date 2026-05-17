import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";

export type MerchantNotificationType =
  | "enrollment"
  | "match"
  | "system"
  | "reminder"
  | "approval"
  | "message"
  | "follow"
  | "contact_request";

export interface MerchantNotification {
  id: string;
  type: MerchantNotificationType;
  title: string;
  content: string;
  activityId?: string;
  activityTitle?: string;
  senderId?: string;
  sender?: { id: string; name?: string | null; avatar?: string | null } | null;
  isRead: boolean;
  createdAt: string;
}

export interface MerchantNotificationsResponse {
  success: boolean;
  data: {
    notifications?: MerchantNotification[];
    unreadCount?: number;
  };
}

export const merchantNotificationsQueryKey = [
  "merchant",
  "notifications",
] as const;

export function useMerchantNotifications() {
  return useQuery({
    queryKey: merchantNotificationsQueryKey,
    queryFn: () =>
      api.get<MerchantNotificationsResponse>(
        "/api/merchant/received-notifications",
      ),
  });
}
