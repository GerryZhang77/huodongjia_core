/**
 * useUpdateProfile - 更新用户资料
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "../services/userProfileApi";
import type { UpdateProfileRequest } from "../types";

/**
 * 更新用户资料 Hook
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateUserProfile(data),
    onSuccess: () => {
      // 刷新用户资料
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
