import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPreferences,
  updatePreferences,
  type NotificationPreferences,
} from "../services/notificationPrefApi";

const KEY = ["notification", "preferences"];

export function useNotificationPreferences() {
  return useQuery({
    queryKey: KEY,
    queryFn: getPreferences,
    staleTime: 60 * 1000,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<NotificationPreferences>) => updatePreferences(body),
    onSuccess: (data) => {
      queryClient.setQueryData(KEY, data);
    },
  });
}
