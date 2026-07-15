import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getActivityById } from "@/features/activities/services";
import { getEnrollmentsDetailed } from "@/features/enrollment/services/enrollmentApi";
import {
  getMatchConfig,
  getMatchFieldCatalog,
  getMatchGroups,
  getMatchingHistory,
  getMatchRules,
  getParticipants,
} from "@/features/matching/services/matchingApi";
import {
  merchantCacheTimes,
  merchantQueryKeys,
} from "@/features/merchant/queryKeys";

const preloadDetailChunk = () => import("@/pages/common/ActivityDetail");
const preloadEnrollmentChunk = () =>
  import("@/pages/merchant/EnrollmentManagementNew");
const preloadMatchingChunk = () => import("@/pages/merchant/MatchingConfig");

/** 商家活动卡片和详情页共享的代码、详情与业务数据预取。 */
export function usePrefetchMerchantActivity() {
  const queryClient = useQueryClient();

  const prefetchDetail = useCallback(
    (activityId: string) => {
      void preloadDetailChunk();
      void queryClient.prefetchQuery({
        queryKey: merchantQueryKeys.activity(activityId),
        queryFn: () => getActivityById(activityId),
        staleTime: merchantCacheTimes.activityStale,
        gcTime: merchantCacheTimes.activityGc,
      });
    },
    [queryClient],
  );

  const prefetchEnrollment = useCallback(
    (activityId: string) => {
      void preloadEnrollmentChunk();
      void queryClient.prefetchQuery({
        queryKey: merchantQueryKeys.enrollmentList(activityId),
        queryFn: () =>
          getEnrollmentsDetailed(activityId, { page: 1, pageSize: 1000 }),
        staleTime: merchantCacheTimes.enrollmentStale,
        gcTime: merchantCacheTimes.enrollmentGc,
      });
    },
    [queryClient],
  );

  const prefetchMatching = useCallback(
    (activityId: string) => {
      void preloadMatchingChunk();
      const common = { gcTime: merchantCacheTimes.matchingGc };
      void queryClient.prefetchQuery({
        queryKey: merchantQueryKeys.matchingRules(activityId),
        queryFn: () => getMatchRules(activityId),
        staleTime: merchantCacheTimes.matchingRulesStale,
        ...common,
      });
      void queryClient.prefetchQuery({
        queryKey: merchantQueryKeys.matchingParticipants(activityId),
        queryFn: () => getParticipants(activityId),
        staleTime: merchantCacheTimes.matchingParticipantsStale,
        ...common,
      });
      void queryClient.prefetchQuery({
        queryKey: merchantQueryKeys.matchingCatalog(activityId),
        queryFn: () => getMatchFieldCatalog(activityId),
        staleTime: 5 * 60 * 1000,
        ...common,
      });
      void queryClient.prefetchQuery({
        queryKey: merchantQueryKeys.matchingConfig(activityId),
        queryFn: () => getMatchConfig(activityId),
        staleTime: merchantCacheTimes.matchingRulesStale,
        ...common,
      });
      void queryClient.prefetchQuery({
        queryKey: merchantQueryKeys.matchingHistory(activityId),
        queryFn: () => getMatchingHistory(activityId),
        staleTime: 60 * 1000,
        ...common,
      });
      void queryClient.prefetchQuery({
        queryKey: merchantQueryKeys.matchingResults(activityId),
        queryFn: () => getMatchGroups(activityId),
        staleTime: merchantCacheTimes.matchingResultStale,
        ...common,
      });
    },
    [queryClient],
  );

  return { prefetchDetail, prefetchEnrollment, prefetchMatching };
}
