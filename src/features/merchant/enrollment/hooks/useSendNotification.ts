/**
 * useSendNotification - 发送通知
 */

import { useMutation } from "@tanstack/react-query";
import { sendNotification } from "../services/enrollmentManageApi";
import type { SendNotificationRequest } from "@/services/enrollmentApi";

/**
 * 发送通知 Hook
 */
export function useSendNotification(activityId: string) {
  return useMutation({
    mutationFn: (data: SendNotificationRequest) =>
      sendNotification(activityId, data),
  });
}
