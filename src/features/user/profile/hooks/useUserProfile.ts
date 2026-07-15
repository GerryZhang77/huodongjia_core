/**
 * useUserProfile - 获取用户资料
 */

import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../services/userProfileApi";
import type { UserProfile } from "@/services/userApi";

/**
 * 获取用户资料
 */
export function useUserProfile(options?: { enabled?: boolean }) {
  return useQuery<{ success: boolean; profile?: UserProfile }, Error>({
    queryKey: ["user", "profile"],
    queryFn: getUserProfile,
    enabled: options?.enabled ?? true,
    staleTime: 15 * 60 * 1000, // 15分钟（用户资料相对稳定，更新后由 mutation invalidate 即可）
    gcTime: 30 * 60 * 1000,
  });
}
