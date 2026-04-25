import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMutes,
  muteUser,
  unmuteUser,
} from "../services/notificationPrefApi";

const KEY = ["notification", "mutes"];

export function useMutes() {
  return useQuery({
    queryKey: KEY,
    queryFn: listMutes,
    staleTime: 60 * 1000,
  });
}

export function useMuteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      mute_message,
      mute_activity,
    }: {
      userId: string;
      mute_message?: boolean;
      mute_activity?: boolean;
    }) => muteUser(userId, { mute_message, mute_activity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useUnmuteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => unmuteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
}
