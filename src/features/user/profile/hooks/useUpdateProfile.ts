/**
 * useUpdateProfile - 更新用户资料
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "../services/userProfileApi";
import type { UpdateProfileRequest } from "../types";

/**
 * 更新用户资料 Hook（乐观合并 patch 到 cache）
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateUserProfile(data),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ["user", "profile"] });
      const prev = queryClient.getQueryData<{ profile?: Record<string, unknown> }>([
        "user",
        "profile",
      ]);
      if (prev?.profile) {
        queryClient.setQueryData(["user", "profile"], {
          ...prev,
          profile: { ...prev.profile, ...patch },
        });
      }
      return { prev };
    },
    onError: (_err, _patch, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["user", "profile"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
