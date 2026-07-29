import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/stores";
import { merchantApi } from "@/services";
import {
  merchantCacheTimes,
  merchantQueryKeys,
} from "@/features/merchant/queryKeys";

export function useMerchantProfile() {
  return useQuery({
    queryKey: merchantQueryKeys.profile(),
    queryFn: () => merchantApi.getMerchantProfile(),
    staleTime: merchantCacheTimes.profileStale,
    gcTime: merchantCacheTimes.profileGc,
  });
}

/** 导航等全局区域统一读取资料缓存，认证身份只作为首屏兜底。 */
export function useMerchantIdentity() {
  const user = useAuthStore((state) => state.user);
  const profileQuery = useMerchantProfile();
  const profile = profileQuery.data?.success
    ? profileQuery.data.profile
    : undefined;

  return {
    user,
    profile,
    displayName: profile?.name || user?.name || "主办方",
    avatarUrl: profile?.avatar || user?.avatar || null,
    ...profileQuery,
  };
}
