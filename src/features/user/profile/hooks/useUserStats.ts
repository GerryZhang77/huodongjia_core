/**
 * useUserStats - 获取用户统计数据
 */

import { useQuery } from "@tanstack/react-query";
import { getUserStats } from "../services/userProfileApi";
import type { UserStats } from "@/services/userApi";

/**
 * 获取用户统计数据
 */
export function useUserStats() {
  return useQuery<{ success: boolean; stats?: UserStats }, Error>({
    queryKey: ["user", "stats"],
    queryFn: getUserStats,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}
