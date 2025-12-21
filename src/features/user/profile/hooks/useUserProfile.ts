/**
 * useUserProfile - 获取用户资料
 */

import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../services/userProfileApi";
import type { UserProfile } from "@/services/userApi";

/**
 * 获取用户资料
 */
export function useUserProfile() {
  return useQuery<{ success: boolean; profile?: UserProfile }, Error>({
    queryKey: ["user", "profile"],
    queryFn: getUserProfile,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}
