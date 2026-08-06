/**
 * 商家端服务端状态的统一 Query Key。
 *
 * 所有页面、预取和 mutation 失效都应从这里取 key，避免“预取了但页面没命中”
 * 或修改一处数据后误清空整个商家缓存。
 */
export const merchantQueryKeys = {
  root: ["merchant"] as const,
  profile: () => ["merchant", "profile"] as const,
  activities: () => ["merchant", "activities"] as const,
  activity: (activityId: string | undefined) =>
    ["merchant", "activity", activityId] as const,
  enrollmentRoot: (activityId: string | undefined) =>
    ["merchant", "enrollment", activityId] as const,
  enrollmentList: (activityId: string | undefined) =>
    ["merchant", "enrollment", activityId, "list"] as const,
  matchingRoot: (activityId: string | undefined) =>
    ["merchant", "matching", activityId] as const,
  matchingRules: (activityId: string | undefined) =>
    ["merchant", "matching", activityId, "rules"] as const,
  matchingParticipants: (activityId: string | undefined) =>
    ["merchant", "matching", activityId, "participants"] as const,
  matchingHistory: (activityId: string | undefined) =>
    ["merchant", "matching", activityId, "history"] as const,
  matchingCatalog: (
    activityId: string | undefined,
    participantScope?: string,
  ) =>
    participantScope
      ? (["merchant", "matching", activityId, "field-catalog", participantScope] as const)
      : (["merchant", "matching", activityId, "field-catalog"] as const),
  matchingConfig: (activityId: string | undefined) =>
    ["merchant", "matching", activityId, "config"] as const,
  matchingResults: (activityId: string | undefined) =>
    ["merchant", "matching", activityId, "results"] as const,
  matchingValidation: (activityId: string | undefined) =>
    ["merchant", "matching", activityId, "validation"] as const,
};

export const merchantCacheTimes = {
  profileStale: 5 * 60 * 1000,
  profileGc: 30 * 60 * 1000,
  activityStale: 2 * 60 * 1000,
  activityGc: 30 * 60 * 1000,
  enrollmentStale: 45 * 1000,
  enrollmentGc: 20 * 60 * 1000,
  matchingParticipantsStale: 30 * 1000,
  matchingRulesStale: 10 * 60 * 1000,
  matchingResultStale: 30 * 1000,
  matchingGc: 30 * 60 * 1000,
} as const;
