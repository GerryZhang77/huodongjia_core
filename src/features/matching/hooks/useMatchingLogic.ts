/**
 * 匹配模块状态管理 Hook (重构版)
 * 简化逻辑，整合规则设置和匹配执行
 *
 * 更新:
 * - 从报名数据获取参与者
 * - 支持异步匹配任务和进度轮询
 * - 支持历史记录回溯
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/components/ui/Toast";
import { getActivityById } from "@/features/activities/services/api";
import type { Activity } from "@/features/activities/types";

// API 服务函数
import {
  getMatchRules,
  saveMatchRules,
  getMatchGroups,
  getParticipants,
  getMatchingHistory,
  submitMatchingTask,
  getMatchingTaskStatus,
  getMatchFieldCatalog,
  preflightMatching,
  getMatchConfig,
  saveMatchConfig,
  publishMatchingResult,
  createMatchAdjustmentDraft,
  validateMatchResults,
  MatchingApiError,
} from "../services/matchingApi";
import { sendNotification as sendEnrollmentNotification } from "@/services/enrollmentApi";

// 使用重构版类型定义
import type {
  MatchingRule as MatchRule,
  MatchingGroup as MatchGroup,
  MatchConstraints,
  MatchingHistory,
  ParticipantMatchResult,
  MatchingSchemaField,
  MatchingSchemaGroup,
  MatchFieldCatalogItem,
  MatchPreflightResult,
  MatchValidationResult,
} from "../types";
import {
  merchantCacheTimes,
  merchantQueryKeys,
} from "@/features/merchant/queryKeys";

// === 本地类型定义 ===
export type MatchingStage =
  | "idle"
  | "configuring"
  | "matching"
  | "completed"
  | "published";
export type TabKey = "rules" | "results";

// 重新导出 MatchConstraints 类型供外部使用
export type { MatchConstraints };

export interface Participant {
  id: string;
  name: string;
  gender?: "male" | "female" | "other";
  age?: number;
  occupation?: string;
  industry?: string;
  avatar?: string;
  tags?: string[];
  bio?: string;
  enrollmentId?: string;
  imageCount?: number;
  registrationTypeId?: string | null;
  registrationTypeName?: string;
}

export interface MatchingStats {
  avgScore: number;
  minScore: number;
  maxScore: number;
  totalGroups?: number;
  totalParticipants?: number;
}

const DEFAULT_SCHEMA_GROUP_ID = '__default__';

// 本地 GroupMember 类型 (兼容多种格式)
export interface LocalGroupMember {
  id: string;
  name: string;
  avatar?: string;
  tags?: string[];
}

// === Hook 配置 ===
interface UseMatchingLogicOptions {
  activityId: string;
}

const DEFAULT_OPERATOR = "similarity" as const;

const createEmptyRule = (): MatchRule => ({
  id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "未配置规则",
  source_field: "",
  target_field: "",
  operator: DEFAULT_OPERATOR,
  type: DEFAULT_OPERATOR,
  weight: 1,
  enabled: true,
});

const normalizeRuleForUi = (rule: MatchRule, index = 0): MatchRule => {
  const operator = rule.operator || DEFAULT_OPERATOR;
  return {
    ...rule,
    name: `${index + 1}-${operator}`,
    type: rule.type || operator,
    operator,
    weight: typeof rule.weight === "number" ? rule.weight : 1,
    enabled: rule.enabled ?? true,
  };
};

const formatPreflightFailureMessage = (result: MatchPreflightResult): string => {
  if (result.message) return result.message;
  const failedRule = result.ruleDiagnostics.find((item) => !item.canExecute);
  if (failedRule?.message) return failedRule.message;
  const failedField = result.fieldDiagnostics.find((item) => !item.canMatch);
  if (failedField) {
    return `${failedField.label} 覆盖 ${failedField.coverage}/${failedField.totalEligibleParticipants}，无法用于当前匹配`;
  }
  return "当前规则字段覆盖不足，无法开始匹配";
};

const buildRegistrationSchemaGroups = (
  activityData: Activity | undefined,
): MatchingSchemaGroup[] => {
  const registrationTypes = activityData?.registrationTypes ?? [];

  if (registrationTypes.length > 0) {
    return registrationTypes
      .map((type, index) => ({
        id: type?.id ? String(type.id) : `${DEFAULT_SCHEMA_GROUP_ID}-${index}`,
        name: String(type?.name || `报名表 ${index + 1}`),
        fields: Array.isArray(type?.formSchema) ? type.formSchema : [],
      }))
      .filter((group: MatchingSchemaGroup) => group.fields.length > 0);
  }

  const fallbackFields = Array.isArray(activityData?.registrationFormSchema)
    ? activityData.registrationFormSchema
    : [];

  return fallbackFields.length > 0
    ? [{ id: DEFAULT_SCHEMA_GROUP_ID, name: "默认报名表", fields: fallbackFields }]
    : [];
};

const flattenRegistrationSchemaGroups = (
  groups: MatchingSchemaGroup[],
): MatchingSchemaField[] => {
  const fieldsByKey = new Map<string, MatchingSchemaField>();

  for (const group of groups) {
    for (const field of group.fields) {
      if (!field.key || fieldsByKey.has(field.key)) continue;
      fieldsByKey.set(field.key, field);
    }
  }

  return Array.from(fieldsByKey.values());
};

export function useMatchingLogic({ activityId }: UseMatchingLogicOptions) {
  const FOREGROUND_POLL_INTERVAL_MS = 3000;
  const BACKGROUND_POLL_INTERVAL_MS = 5000;
  const queryClient = useQueryClient();
  const queryEnabled = Boolean(activityId);

  const rulesQuery = useQuery({
    queryKey: merchantQueryKeys.matchingRules(activityId),
    queryFn: () => getMatchRules(activityId),
    enabled: queryEnabled,
    staleTime: merchantCacheTimes.matchingRulesStale,
    gcTime: merchantCacheTimes.matchingGc,
  });
  const participantsQuery = useQuery({
    queryKey: merchantQueryKeys.matchingParticipants(activityId),
    queryFn: () => getParticipants(activityId),
    enabled: queryEnabled,
    staleTime: merchantCacheTimes.matchingParticipantsStale,
    gcTime: merchantCacheTimes.matchingGc,
  });
  const historyQuery = useQuery({
    queryKey: merchantQueryKeys.matchingHistory(activityId),
    queryFn: () => getMatchingHistory(activityId),
    enabled: queryEnabled,
    staleTime: 60 * 1000,
    gcTime: merchantCacheTimes.matchingGc,
  });
  const activityQuery = useQuery({
    queryKey: merchantQueryKeys.activity(activityId),
    queryFn: () => getActivityById(activityId),
    enabled: queryEnabled,
    staleTime: merchantCacheTimes.activityStale,
    gcTime: merchantCacheTimes.activityGc,
  });
  const catalogQuery = useQuery({
    queryKey: merchantQueryKeys.matchingCatalog(activityId),
    queryFn: () => getMatchFieldCatalog(activityId),
    enabled: queryEnabled,
    staleTime: 5 * 60 * 1000,
    gcTime: merchantCacheTimes.matchingGc,
  });
  const configQuery = useQuery({
    queryKey: merchantQueryKeys.matchingConfig(activityId),
    queryFn: () => getMatchConfig(activityId),
    enabled: queryEnabled,
    staleTime: merchantCacheTimes.matchingRulesStale,
    gcTime: merchantCacheTimes.matchingGc,
  });
  const resultsQuery = useQuery({
    queryKey: merchantQueryKeys.matchingResults(activityId),
    queryFn: () => getMatchGroups(activityId),
    enabled: queryEnabled,
    staleTime: merchantCacheTimes.matchingResultStale,
    gcTime: merchantCacheTimes.matchingGc,
    retry: 1,
  });

  // === 状态定义 ===
  const [stage, setStage] = useState<MatchingStage>("idle");
  const [activeTab, setActiveTab] = useState<TabKey>("rules");

  // 规则相关
  const [rules, setRules] = useState<MatchRule[]>([]);
  const [constraints, setConstraints] = useState<MatchConstraints>({
    countMode: "range",
    minMatches: 1,
    maxMatches: 3,
    hardRules: [],
    allowManualOverride: false,
  });

  // 数据
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [registrationSchema, setRegistrationSchema] = useState<
    MatchingSchemaField[]
  >([]);
  const [registrationSchemaGroups, setRegistrationSchemaGroups] = useState<
    MatchingSchemaGroup[]
  >([]);
  const [fieldCatalog, setFieldCatalog] = useState<MatchFieldCatalogItem[]>([]);
  const [eligibleParticipantCount, setEligibleParticipantCount] = useState(0);
  const [lastPreflightResult, setLastPreflightResult] =
    useState<MatchPreflightResult | null>(null);
  // per-user top5 匹配结果（新模型）
  const [matchResults, setMatchResults] = useState<ParticipantMatchResult[]>([]);
  // 旧分组结果（历史记录回放用，当前匹配流程不再使用）
  const [groups, setGroups] = useState<MatchGroup[]>([]);
  const [history, setHistory] = useState<MatchingHistory[]>([]);

  // 加载状态
  const isLoading = [
    rulesQuery,
    participantsQuery,
    historyQuery,
    activityQuery,
    catalogQuery,
    configQuery,
    resultsQuery,
  ].some((query) => query.isPending);
  const [isMatching, setIsMatching] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCreatingAdjustmentDraft, setIsCreatingAdjustmentDraft] =
    useState(false);
  const [isPreflighting, setIsPreflighting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [matchingMessage, setMatchingMessage] = useState<string>("");
  const [lastValidationResult, setLastValidationResult] =
    useState<MatchValidationResult | null>(null);

  // 规则锁定状态 - 匹配进行中时锁定规则编辑
  const [isRulesLocked, setIsRulesLocked] = useState(false);

  // 后台执行状态 - 匹配是否在后台执行
  const [isBackgroundMatching, setIsBackgroundMatching] = useState(false);

  // 当前查看的历史记录ID
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  // 已保存的规则配置列表
  const [savedConfigs, setSavedConfigs] = useState<
    Array<{
      id: string;
      name: string;
      rules: MatchRule[];
      savedAt: string;
    }>
  >([]);

  // 任务轮询
  const taskPollingRef = useRef<NodeJS.Timeout | null>(null);
  const currentTaskIdRef = useRef<string | null>(null);
  const preflightFingerprintRef = useRef<string | null>(null);

  // 统计
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(
    null,
  );

  const clearTaskPolling = useCallback(() => {
    if (taskPollingRef.current) {
      clearTimeout(taskPollingRef.current);
      taskPollingRef.current = null;
    }
  }, []);

  // === 清理轮询 ===
  useEffect(() => clearTaskPolling, [clearTaskPolling]);

  // React Query 负责跨路由缓存；本地状态只承载尚未保存的编辑值和执行进度。
  useEffect(() => {
    if (!rulesQuery.isFetched) return;
    const rulesData = rulesQuery.data || [];
    setRules(
      rulesData.length > 0
        ? rulesData.map((rule, index) => normalizeRuleForUi(rule, index))
        : [createEmptyRule()],
    );
  }, [rulesQuery.data, rulesQuery.isFetched]);

  useEffect(() => {
    if (!participantsQuery.isFetched) return;
    setParticipants((participantsQuery.data || []) as Participant[]);
  }, [participantsQuery.data, participantsQuery.isFetched]);

  useEffect(() => {
    if (!historyQuery.isFetched) return;
    setHistory((historyQuery.data || []) as MatchingHistory[]);
  }, [historyQuery.data, historyQuery.isFetched]);

  useEffect(() => {
    const schemaGroups = buildRegistrationSchemaGroups(activityQuery.data);
    setRegistrationSchemaGroups(schemaGroups);
    setRegistrationSchema(flattenRegistrationSchemaGroups(schemaGroups));
  }, [activityQuery.data]);

  useEffect(() => {
    setFieldCatalog(catalogQuery.data?.fields || []);
    setEligibleParticipantCount(
      catalogQuery.data?.totalEligibleParticipants || 0,
    );
  }, [catalogQuery.data]);

  useEffect(() => {
    if (configQuery.data) setConstraints(configQuery.data);
  }, [configQuery.data]);

  useEffect(() => {
    if (!resultsQuery.isFetched) return;
    const matchData = resultsQuery.data;
    const nextResults = matchData?.results || [];
    setMatchResults(nextResults);
    if (nextResults.length > 0) {
      setStage(
        matchData?.resultState === "published" ? "published" : "completed",
      );
      setActiveTab("results");
      setMatchingStats(
        matchData?.stats
          ? {
              avgScore: matchData.stats.averageScore,
              minScore: matchData.stats.minScore,
              maxScore: matchData.stats.maxScore,
              totalGroups: nextResults.length,
              totalParticipants:
                matchData.stats.totalParticipants ||
                (participantsQuery.data || []).length,
            }
          : null,
      );
    } else {
      setStage("configuring");
      setMatchingStats(null);
    }
  }, [
    participantsQuery.data,
    resultsQuery.data,
    resultsQuery.isFetched,
  ]);

  // === 保存所有规则配置到后端 ===
  const handleSaveRules = useCallback(
    async (configName: string) => {
      try {
        const normalizedRules = rules.map((rule, index) =>
          normalizeRuleForUi(rule, index),
        );
        await Promise.all([
          saveMatchRules(activityId, normalizedRules),
          saveMatchConfig(activityId, constraints),
        ]);
        queryClient.setQueryData(
          merchantQueryKeys.matchingRules(activityId),
          normalizedRules,
        );
        queryClient.setQueryData(
          merchantQueryKeys.matchingConfig(activityId),
          constraints,
        );

        const newConfig = {
          id: `config_${Date.now()}`,
          name: configName,
          rules: normalizedRules,
          savedAt: new Date().toISOString(),
        };
        setSavedConfigs((prev) => [newConfig, ...prev]);
        setRules(normalizedRules);
        Toast.show({ content: `配置"${configName}"已保存`, icon: "success" });
      } catch (error) {
        console.error("Failed to save rules:", error);
        Toast.show({ content: "保存失败", icon: "fail" });
        throw error;
      }
    },
    [activityId, constraints, queryClient, rules],
  );

  // === 加载已保存的配置 ===
  const handleLoadConfig = useCallback(
    (config: {
      id: string;
      name: string;
      rules: MatchRule[];
      savedAt: string;
    }) => {
      // 应用配置中的规则
      setRules(
        config.rules.map((rule, index) => normalizeRuleForUi(rule, index)),
      );
      Toast.show({ content: `已加载配置"${config.name}"`, icon: "success" });
    },
    [],
  );

  // === 删除已保存的配置 ===
  const handleDeleteConfig = useCallback((configId: string) => {
    setSavedConfigs((prev) => prev.filter((c) => c.id !== configId));
    Toast.show({ content: "配置已删除", icon: "success" });
  }, []);

  // === 轮询任务状态（传入 activityId） ===
  const pollTaskStatus = useCallback(
    async (eventId: string) => {
      try {
        const status = await getMatchingTaskStatus(eventId);

        setMatchingProgress(status.progress);
        setMatchingMessage(status.message || "");

        if (status.status === "completed") {
          // 任务完成，停止轮询
          clearTaskPolling();
          currentTaskIdRef.current = null;

          // 重新加载数据（per-user top5 + 历史）
          const [matchData, historyData] = await Promise.all([
            getMatchGroups(activityId).catch(() => ({
              results: [] as ParticipantMatchResult[],
              stats: null,
              resultState: undefined,
            })),
            getMatchingHistory(activityId).catch(() => [] as MatchingHistory[]),
          ]);

          if (matchData.results.length > 0) {
            setMatchResults(matchData.results);
            setStage("completed");
            setActiveTab("results");
            if (matchData.stats) {
              setMatchingStats({
                avgScore: matchData.stats.averageScore,
                minScore: matchData.stats.minScore,
                maxScore: matchData.stats.maxScore,
                totalGroups: matchData.results.length,
                totalParticipants:
                  matchData.stats.totalParticipants ||
                  participants.length,
              });
            } else {
              setMatchingStats(null);
            }
          }

          if (historyData) {
            setHistory(historyData);
          }
          queryClient.setQueryData(
            merchantQueryKeys.matchingResults(activityId),
            matchData,
          );
          queryClient.setQueryData(
            merchantQueryKeys.matchingHistory(activityId),
            historyData,
          );
          void queryClient.invalidateQueries({
            queryKey: merchantQueryKeys.activities(),
          });

          setIsMatching(false);
          setIsRulesLocked(false);
          Toast.show({ content: "匹配完成", icon: "success" });
        } else if (status.status === "failed") {
          // 任务失败
          clearTaskPolling();
          currentTaskIdRef.current = null;
          setIsMatching(false);
          setIsRulesLocked(false);
          setStage("configuring");
          Toast.show({ content: status.message || "匹配失败", icon: "fail" });
        } else {
          clearTaskPolling();
          taskPollingRef.current = setTimeout(() => {
            void pollTaskStatus(eventId);
          }, isBackgroundMatching ? BACKGROUND_POLL_INTERVAL_MS : FOREGROUND_POLL_INTERVAL_MS);
        }
      } catch (error) {
        console.error("Failed to poll task status:", error);
      }
    },
    [
      activityId,
      clearTaskPolling,
      isBackgroundMatching,
      participants.length,
      queryClient,
    ],
  );

  useEffect(() => {
    if (!isMatching || !currentTaskIdRef.current) {
      return;
    }

    clearTaskPolling();
    taskPollingRef.current = setTimeout(() => {
      void pollTaskStatus(currentTaskIdRef.current!);
    }, isBackgroundMatching ? BACKGROUND_POLL_INTERVAL_MS : FOREGROUND_POLL_INTERVAL_MS);

    return clearTaskPolling;
  }, [clearTaskPolling, isBackgroundMatching, isMatching, pollTaskStatus]);

  const handleRunPreflight = useCallback(async () => {
    const normalizedRules = rules.map((rule, index) =>
      normalizeRuleForUi(rule, index),
    );
    const enabledRules = normalizedRules.filter(
      (rule) =>
        rule.enabled &&
        rule.source_field &&
        rule.target_field &&
        rule.operator,
    );
    if (enabledRules.length === 0) {
      Toast.show({ content: "请至少启用一条匹配规则", icon: "fail" });
      return null;
    }

    if (eligibleParticipantCount === 0) {
      Toast.show({ content: "暂无审核通过且参与匹配的用户", icon: "fail" });
      return null;
    }

    setIsPreflighting(true);
    try {
      const preflightResult = await preflightMatching(
        activityId,
        enabledRules,
        constraints,
      );
      setLastPreflightResult(preflightResult);
      if (!preflightResult.canExecute) {
        Toast.show({
          content: formatPreflightFailureMessage(preflightResult),
          icon: "fail",
        });
        return null;
      }
      preflightFingerprintRef.current = JSON.stringify({
        rules: normalizedRules,
        constraints,
      });
      return { normalizedRules, enabledRules, preflightResult };
    } catch (error) {
      console.error("Matching preflight failed:", error);
      Toast.show({ content: "匹配预检失败", icon: "fail" });
      return null;
    } finally {
      setIsPreflighting(false);
    }
  }, [activityId, constraints, eligibleParticipantCount, rules]);

  // === 开始匹配 (异步任务) ===
  const handleStartMatching = useCallback(async () => {
    const currentNormalizedRules = rules.map((rule, index) =>
      normalizeRuleForUi(rule, index),
    );
    const fingerprint = JSON.stringify({
      rules: currentNormalizedRules,
      constraints,
    });
    const cachedPreflightIsCurrent =
      lastPreflightResult?.canExecute === true &&
      preflightFingerprintRef.current === fingerprint;
    const preflight = cachedPreflightIsCurrent
      ? {
          normalizedRules: currentNormalizedRules,
          enabledRules: currentNormalizedRules.filter(
            (rule) =>
              rule.enabled &&
              rule.source_field &&
              rule.target_field &&
              rule.operator,
          ),
          preflightResult: lastPreflightResult,
        }
      : await handleRunPreflight();
    if (!preflight) return;
    const { normalizedRules, enabledRules } = preflight;

    setIsMatching(true);
    setMatchingProgress(0);
    setMatchingMessage("正在提交匹配任务...");
    setStage("matching");
    setIsRulesLocked(true);

    try {
      setRules(normalizedRules);
      // 开始匹配即固化本次硬约束，确保刷新页面、人工调整与运行快照保持一致。
      await saveMatchConfig(activityId, constraints);
      const { taskId } = await submitMatchingTask(activityId, enabledRules, constraints);
      currentTaskIdRef.current = taskId;
      clearTaskPolling();
      void pollTaskStatus(activityId);
    } catch (error) {
      console.error("Failed to start matching:", error);
      const diagnostics =
        error instanceof MatchingApiError ? error.diagnostics : undefined;
      Toast.show({
        content: diagnostics
          ? formatPreflightFailureMessage(diagnostics)
          : "提交匹配任务失败",
        icon: "fail",
      });
      setIsMatching(false);
      setIsRulesLocked(false);
      setStage("configuring");
      clearTaskPolling();
    }
  }, [
    activityId,
    clearTaskPolling,
    constraints,
    handleRunPreflight,
    lastPreflightResult,
    pollTaskStatus,
    rules,
  ]);

  // === 最小化匹配进度到后台 ===
  const handleMinimizeMatching = useCallback(() => {
    setIsBackgroundMatching(true);
  }, []);

  // === 展开匹配进度 ===
  const handleExpandMatching = useCallback(() => {
    setIsBackgroundMatching(false);
  }, []);

  // === 重新匹配（等同于再跑一次 execute） ===
  // 切回规则 Tab 让用户调整规则后再开始
  const handleEnterRematchMode = useCallback(() => {
    setActiveTab("rules");
    Toast.show({ content: "请调整规则后点击开始匹配", icon: "success" });
  }, []);

  // === 发布结果 ===
  const handlePublish = useCallback(
    async (sendResultNotification = true) => {
      if (matchResults.length === 0) {
        Toast.show({ content: "暂无匹配结果", icon: "fail" });
        return;
      }

      setIsPublishing(true);
      try {
        const published = await publishMatchingResult(activityId);
        let notificationFailed = false;
        if (sendResultNotification && published.enrollmentIds.length > 0) {
          try {
            await sendEnrollmentNotification(activityId, {
              enrollmentIds: published.enrollmentIds,
              message: "您的匹配结果已出炉，快来查看匹配信息吧！",
            });
          } catch (notificationError) {
            notificationFailed = true;
            console.error("Match result published but notification failed:", notificationError);
          }
        }
        setStage("published");
        if (resultsQuery.data) {
          queryClient.setQueryData(
            merchantQueryKeys.matchingResults(activityId),
            { ...resultsQuery.data, resultState: "published" as const },
          );
        }
        Toast.show({
          content: notificationFailed
            ? "结果已发布，但通知发送失败，可在报名管理中重新通知"
            : sendResultNotification
            ? `结果发布成功，已通知 ${published.enrollmentIds.length} 位参与者`
            : "结果发布成功",
          icon: "success",
        });
        const historyData = await getMatchingHistory(activityId).catch(() => []);
        setHistory(historyData);
        queryClient.setQueryData(
          merchantQueryKeys.matchingHistory(activityId),
          historyData,
        );
        void queryClient.invalidateQueries({
          queryKey: merchantQueryKeys.activities(),
        });
      } catch (error) {
        console.error("Publish failed:", error);
        if (error instanceof MatchingApiError && error.validation) {
          setLastValidationResult(error.validation);
        }
        Toast.show({
          content: error instanceof Error ? error.message : "发布失败，请重试",
          icon: "fail"
        });
        throw error;
      } finally {
        setIsPublishing(false);
      }
    },
    [activityId, matchResults.length, queryClient, resultsQuery.data],
  );

  const handleValidateResults = useCallback(async () => {
    setIsValidating(true);
    try {
      const validation = await validateMatchResults(activityId);
      setLastValidationResult(validation);
      queryClient.setQueryData(
        merchantQueryKeys.matchingValidation(activityId),
        validation,
      );
      Toast.show({
        content: validation.valid
          ? "校验通过，可以发布"
          : validation.issues[0]?.message || "结果仍有冲突",
        icon: validation.valid ? "success" : "fail",
      });
      return validation;
    } catch (error) {
      Toast.show({
        content: error instanceof Error ? error.message : "校验失败",
        icon: "fail",
      });
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [activityId, queryClient]);

  const handleCreateAdjustmentDraft = useCallback(async () => {
    setIsCreatingAdjustmentDraft(true);
    try {
      const draft = await createMatchAdjustmentDraft(activityId);
      const [matchData, historyData] = await Promise.all([
        getMatchGroups(activityId),
        getMatchingHistory(activityId),
      ]);
      queryClient.setQueryData(
        merchantQueryKeys.matchingResults(activityId),
        matchData,
      );
      queryClient.setQueryData(
        merchantQueryKeys.matchingHistory(activityId),
        historyData,
      );
      setMatchResults(matchData.results);
      setHistory(historyData);
      setStage("completed");
      setActiveTab("results");
      setLastValidationResult(null);
      Toast.show({
        content: draft.reused
          ? `已进入未发布的第 ${draft.version} 版调整草稿`
          : `已从已发布结果创建第 ${draft.version} 版调整草稿`,
        icon: "success",
      });
      return draft;
    } catch (error) {
      Toast.show({
        content: error instanceof Error ? error.message : "创建调整草稿失败",
        icon: "fail",
      });
      throw error;
    } finally {
      setIsCreatingAdjustmentDraft(false);
    }
  }, [activityId, queryClient]);

  // === 查看历史记录 ===
  const handleViewHistory = useCallback((historyItem: MatchingHistory) => {
    if (historyItem.groups && historyItem.groups.length > 0) {
      const convertedGroups = convertHistoryGroups(historyItem.groups);
      setGroups(convertedGroups);
      setMatchingStats({
        avgScore: historyItem.statistics.avgScore,
        minScore: historyItem.statistics.minScore,
        maxScore: historyItem.statistics.maxScore,
        totalGroups: historyItem.statistics.totalGroups,
        totalParticipants: historyItem.statistics.totalParticipants,
      });
      setCurrentHistoryId(historyItem.id); // 设置当前查看的历史记录ID
      setActiveTab("results");
    }
  }, []);

  // === 恢复历史记录（作为当前结果） ===
  const handleRestoreHistory = useCallback(
    (historyItem: MatchingHistory) => {
      handleViewHistory(historyItem);
      setCurrentHistoryId(null); // 清除历史ID，表示这是当前结果
      Toast.show({ content: "已恢复该历史记录作为当前结果", icon: "success" });
    },
    [handleViewHistory],
  );

  // === 刷新数据 ===
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [participantsData, historyData, catalogData, matchData] = await Promise.all([
        getParticipants(activityId).catch(() => []),
        getMatchingHistory(activityId).catch(() => []),
        getMatchFieldCatalog(activityId).catch(() => ({
          fields: [] as MatchFieldCatalogItem[],
          totalEligibleParticipants: 0,
        })),
        getMatchGroups(activityId).catch(() => ({
          results: [] as ParticipantMatchResult[],
          stats: null,
          resultState: undefined,
        })),
      ]);

      setParticipants(participantsData as Participant[]);
      setHistory(historyData);
      setFieldCatalog(catalogData.fields);
      setEligibleParticipantCount(catalogData.totalEligibleParticipants);
      setMatchResults(matchData.results);
      if (matchData.results.length > 0) {
        setStage(matchData.resultState === "published" ? "published" : "completed");
      }
      if (matchData.stats) {
        setMatchingStats({
          avgScore: matchData.stats.averageScore,
          minScore: matchData.stats.minScore,
          maxScore: matchData.stats.maxScore,
          totalGroups: matchData.results.length,
          totalParticipants: matchData.stats.totalParticipants,
        });
      } else {
        setMatchingStats(null);
      }

      queryClient.setQueryData(
        merchantQueryKeys.matchingParticipants(activityId),
        participantsData,
      );
      queryClient.setQueryData(
        merchantQueryKeys.matchingHistory(activityId),
        historyData,
      );
      queryClient.setQueryData(
        merchantQueryKeys.matchingCatalog(activityId),
        catalogData,
      );
      queryClient.setQueryData(
        merchantQueryKeys.matchingResults(activityId),
        matchData,
      );

      Toast.show({ content: "数据已刷新", icon: "success" });
    } catch (error) {
      console.error("Refresh failed:", error);
      Toast.show({ content: "刷新失败", icon: "fail" });
    } finally {
      setIsRefreshing(false);
    }
  }, [activityId, queryClient]);

  // === 返回状态和方法 ===
  return {
    // 状态
    stage,
    activeTab,
    isLoading,
    isMatching,
    isPublishing,
    isCreatingAdjustmentDraft,
    isPreflighting,
    isValidating,
    isRefreshing,
    isRulesLocked,
    matchingProgress,
    matchingMessage,

    isBackgroundMatching,
    currentHistoryId,

    // 数据
    rules,
    constraints,
    participants,
    matchResults,
    groups, // 历史记录回放保留
    history,
    matchingStats,
    savedConfigs,
    registrationSchema,
    registrationSchemaGroups,
    fieldCatalog,
    eligibleParticipantCount,
    lastPreflightResult,
    lastValidationResult,
    resultState: resultsQuery.data?.resultState,
    resultVersion: resultsQuery.data?.version,
    resultRevision: resultsQuery.data?.revision,

    // 设置方法
    setActiveTab,
    setRules,
    setConstraints,
    setGroups,

    // 规则操作
    handleSaveRules,
    handleLoadConfig,
    handleDeleteConfig,

    // 匹配操作
    handleStartMatching,
    handleRunPreflight,
    handlePublish,
    handleValidateResults,
    handleCreateAdjustmentDraft,
    handleViewHistory,
    handleRestoreHistory,
    handleRefresh,

    // 重新匹配入口（仅切回规则 Tab）
    handleEnterRematchMode,

    // 后台匹配操作
    handleMinimizeMatching,
    handleExpandMatching,
  };
}

// === 辅助函数：转换历史记录中的分组格式 ===
function convertHistoryGroups(historyGroups: unknown[]): MatchGroup[] {
  return historyGroups.map((rawGroup, index) => {
    const group =
      rawGroup && typeof rawGroup === "object"
        ? (rawGroup as Record<string, unknown>)
        : {};
    const rawMembers = Array.isArray(group.members) ? group.members : [];
    const rawReasons = Array.isArray(group.match_reasons)
      ? group.match_reasons
      : Array.isArray(group.reasons)
        ? group.reasons
        : [];
    const rawScore = Number(group.similarity_score ?? group.score ?? 0);

    return {
      id: String(group.group_id || group.id || `group_${index}`),
      name: String(group.group_name || group.name || `第${index + 1}组`),
      members: rawMembers
        .map((rawMember) => {
          if (typeof rawMember === "string") return rawMember;
          if (!rawMember || typeof rawMember !== "object") return "";
          const member = rawMember as Record<string, unknown>;
          return String(member.user_id || member.id || "");
        })
        .filter(Boolean),
      score: Math.round((Number.isFinite(rawScore) ? rawScore : 0) * 100),
      reasons: rawReasons.filter(
        (reason): reason is string => typeof reason === "string",
      ),
      isLocked: Boolean(group.is_locked ?? group.isLocked),
    };
  });
}

export default useMatchingLogic;
