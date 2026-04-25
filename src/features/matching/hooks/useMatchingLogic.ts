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
import { Toast } from "@/components/ui/Toast";

// API 服务函数
import {
  getMatchRules,
  saveMatchRules,
  executeMatching,
  getMatchGroups,
  getParticipants,
  getMatchingHistory,
  submitMatchingTask,
  getMatchingTaskStatus,
} from "../services/matchingApi";

// 使用重构版类型定义
import type {
  MatchingRule as MatchRule,
  MatchingGroup as MatchGroup,
  MatchConstraints,
  MatchingHistory,
  ParticipantMatchResult,
} from "../types";

// === 模块级缓存（stale-while-revalidate） ===
// 在 SPA tab 生命周期内存活；组件卸载重挂载时命中缓存秒开，后台静默刷新
// 注意：浏览器硬刷新（F5）会清空缓存，回到正常加载流程
interface MatchingCacheEntry {
  rules: MatchRule[];
  participants: Participant[];
  history: MatchingHistory[];
  matchResults: ParticipantMatchResult[];
  stage: MatchingStage;
  activeTab: TabKey;
  matchingStats: MatchingStats | null;
  savedAt: number;
}
const matchingCache = new Map<string, MatchingCacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/** 外部可显式失效某活动的缓存（例如切换账号或明显的数据变更后） */
export function invalidateMatchingCache(activityId?: string) {
  if (activityId) matchingCache.delete(activityId);
  else matchingCache.clear();
}

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
}

export interface MatchingStats {
  avgScore: number;
  minScore: number;
  maxScore: number;
  totalGroups?: number;
  totalParticipants?: number;
}

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

export function useMatchingLogic({ activityId }: UseMatchingLogicOptions) {
  // === 状态定义 ===
  const [stage, setStage] = useState<MatchingStage>("idle");
  const [activeTab, setActiveTab] = useState<TabKey>("rules");

  // 规则相关
  const [rules, setRules] = useState<MatchRule[]>([]);
  const [constraints, setConstraints] = useState<MatchConstraints>({
    minGroupSize: 3,
    maxGroupSize: 8,
    genderRatioMin: 40,
    genderRatioMax: 60,
    sameIndustryMax: 2,
  });

  // 数据
  const [participants, setParticipants] = useState<Participant[]>([]);
  // per-user top5 匹配结果（新模型）
  const [matchResults, setMatchResults] = useState<ParticipantMatchResult[]>([]);
  // 旧分组结果（历史记录回放用，当前匹配流程不再使用）
  const [groups, setGroups] = useState<MatchGroup[]>([]);
  const [history, setHistory] = useState<MatchingHistory[]>([]);

  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [isGeneratingRules, setIsGeneratingRules] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [matchingMessage, setMatchingMessage] = useState<string>("");

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

  // 统计
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(
    null,
  );

  // === 清理轮询 ===
  useEffect(() => {
    return () => {
      if (taskPollingRef.current) {
        clearInterval(taskPollingRef.current);
      }
    };
  }, []);

  // === 初始化加载（stale-while-revalidate） ===
  useEffect(() => {
    if (!activityId) return;

    // 用 ref 把本次挂载与之前的请求隔离，避免卸载后的 setState
    let aborted = false;

    /** 真正的拉取逻辑，复用给首次加载和后台静默刷新 */
    const fetchAll = async (silent: boolean) => {
      if (!silent) setIsLoading(true);
      try {
        const [rulesData, participantsData, historyData] = await Promise.all([
          getMatchRules(activityId).catch(() => [] as MatchRule[]),
          getParticipants(activityId).catch(() => [] as Participant[]),
          getMatchingHistory(activityId).catch(() => [] as MatchingHistory[]),
        ]);
        if (aborted) return;

        if (rulesData && rulesData.length > 0) {
          setRules(rulesData);
          setStage((prev) => (prev === "idle" ? "configuring" : prev));
        }
        if (participantsData && participantsData.length > 0) {
          setParticipants(participantsData);
        }

        let publishedResolved = false;
        if (historyData && historyData.length > 0) {
          setHistory(historyData);
          const publishedHistory = historyData.find((h) => h.isPublished);
          if (publishedHistory && publishedHistory.groups.length > 0) {
            const convertedGroups = convertHistoryGroups(publishedHistory.groups);
            setGroups(convertedGroups);
            setStage("published");
            setActiveTab("results");
            setMatchingStats({
              avgScore: publishedHistory.statistics.avgScore,
              minScore: publishedHistory.statistics.minScore,
              maxScore: publishedHistory.statistics.maxScore,
              totalGroups: publishedHistory.statistics.totalGroups,
              totalParticipants: publishedHistory.statistics.totalParticipants,
            });
            publishedResolved = true;
          }
        }

        if (!publishedResolved) {
          const matchResult = await getMatchGroups(activityId).catch(() => ({
            results: [] as ParticipantMatchResult[],
            participants: [] as any[],
            stats: null,
          }));
          if (aborted) return;
          if (matchResult.results.length > 0) {
            setMatchResults(matchResult.results);
            if (matchResult.participants.length > 0) {
              setParticipants(matchResult.participants);
            }
            setStage("completed");
            setActiveTab("results");
            // 后端返回了 stats 才写入真实分数；没有则留 null，UI 会显示 "—"
            if (matchResult.stats) {
              setMatchingStats({
                avgScore: matchResult.stats.averageScore,
                minScore: matchResult.stats.minScore,
                maxScore: matchResult.stats.maxScore,
                totalGroups: matchResult.results.length,
                totalParticipants:
                  matchResult.stats.totalParticipants ||
                  matchResult.participants.length,
              });
            } else {
              setMatchingStats(null);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        if (!silent) Toast.show({ content: "加载数据失败", icon: "fail" });
      } finally {
        if (!aborted && !silent) setIsLoading(false);
      }
    };

    // SWR: 命中缓存则立即 hydrate 状态并跳过 loading，再后台静默刷新
    const cached = matchingCache.get(activityId);
    const fresh = cached && Date.now() - cached.savedAt < CACHE_TTL_MS;
    if (cached) {
      setRules(cached.rules);
      setParticipants(cached.participants);
      setHistory(cached.history);
      setMatchResults(cached.matchResults);
      setStage(cached.stage);
      setActiveTab(cached.activeTab);
      setMatchingStats(cached.matchingStats);
      setIsLoading(false);
      if (!fresh) fetchAll(true);
    } else {
      fetchAll(false);
    }

    return () => {
      aborted = true;
    };
  }, [activityId]);

  // === 状态同步到缓存（只在加载完成且拿到数据时写入） ===
  useEffect(() => {
    if (!activityId || isLoading) return;
    // 空数据时不要覆盖掉可能尚未返回的真实数据
    if (
      rules.length === 0 &&
      participants.length === 0 &&
      matchResults.length === 0 &&
      history.length === 0
    ) {
      return;
    }
    matchingCache.set(activityId, {
      rules,
      participants,
      history,
      matchResults,
      stage,
      activeTab,
      matchingStats,
      savedAt: Date.now(),
    });
  }, [
    activityId,
    isLoading,
    rules,
    participants,
    history,
    matchResults,
    stage,
    activeTab,
    matchingStats,
  ]);

  // === 从报名表派生匹配规则 ===
  // 规则直接来源于商家在发布活动时配置的报名表字段（表头）
  const handleGenerateRules = useCallback(
    async () => {
      setIsGeneratingRules(true);
      try {
        const token = (() => {
          try {
            const raw = localStorage.getItem("auth-storage");
            return raw ? JSON.parse(raw)?.state?.token ?? null : null;
          } catch { return null; }
        })();

        const response = await fetch(`/api/match/${activityId}/generate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.message || "生成失败");

        // 后端返回 MatchingRule[]（优先），兼容旧 string[]
        const rawRules: unknown[] = data.rules || [];
        if (rawRules.length === 0) {
          Toast.show({
            content: data.message || "报名表暂无可用字段",
            icon: "fail",
          });
          return;
        }

        const generatedRules: MatchRule[] = rawRules.map((r, i) => {
          if (typeof r === "string") {
            return {
              id: `rule-${Date.now()}-${i}`,
              name: r,
              type: "similarity" as const,
              weight: (data.weights as number[])?.[i] ?? Math.round(100 / rawRules.length),
              enabled: true,
            };
          }
          const obj = r as MatchRule;
          return {
            id: obj.id || `rule-${Date.now()}-${i}`,
            name: obj.name,
            field: obj.field,
            type: obj.type || "similarity",
            weight: obj.weight ?? Math.round(100 / rawRules.length),
            enabled: obj.enabled ?? true,
          };
        });

        setRules(generatedRules);
        setStage("configuring");
        Toast.show({ content: `已从报名表生成 ${generatedRules.length} 条规则`, icon: "success" });
      } catch (error) {
        Toast.show({ content: error instanceof Error ? error.message : "生成规则失败", icon: "fail" });
      } finally {
        setIsGeneratingRules(false);
      }
    },
    [activityId],
  );

  // === 保存所有规则配置到后端 ===
  const handleSaveRules = useCallback(
    async (configName: string) => {
      try {
        await saveMatchRules(activityId, rules);

        const newConfig = {
          id: `config_${Date.now()}`,
          name: configName,
          rules: [...rules],
          savedAt: new Date().toISOString(),
        };
        setSavedConfigs((prev) => [newConfig, ...prev]);
        Toast.show({ content: `配置"${configName}"已保存`, icon: "success" });
      } catch (error) {
        console.error("Failed to save rules:", error);
        Toast.show({ content: "保存失败", icon: "fail" });
        throw error;
      }
    },
    [activityId, rules],
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
      setRules([...config.rules]);
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
          if (taskPollingRef.current) {
            clearInterval(taskPollingRef.current);
            taskPollingRef.current = null;
          }
          currentTaskIdRef.current = null;

          // 重新加载数据（per-user top5 + 历史）
          const [matchData, historyData] = await Promise.all([
            getMatchGroups(activityId).catch(() => ({
              results: [] as ParticipantMatchResult[],
              participants: [] as any[],
              stats: null,
            })),
            getMatchingHistory(activityId).catch(() => [] as MatchingHistory[]),
          ]);

          if (matchData.results.length > 0) {
            setMatchResults(matchData.results);
            if (matchData.participants.length > 0) {
              setParticipants(matchData.participants);
            }
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
                  matchData.participants.length ||
                  participants.length,
              });
            } else {
              setMatchingStats(null);
            }
          }

          if (historyData) {
            setHistory(historyData);
          }

          setIsMatching(false);
          setIsRulesLocked(false);
          Toast.show({ content: "匹配完成", icon: "success" });
        } else if (status.status === "failed") {
          // 任务失败
          if (taskPollingRef.current) {
            clearInterval(taskPollingRef.current);
            taskPollingRef.current = null;
          }
          currentTaskIdRef.current = null;
          setIsMatching(false);
          setIsRulesLocked(false);
          setStage("configuring");
          Toast.show({ content: status.message || "匹配失败", icon: "fail" });
        }
      } catch (error) {
        console.error("Failed to poll task status:", error);
      }
    },
    [activityId, participants.length],
  );

  // === 开始匹配 (异步任务) ===
  const handleStartMatching = useCallback(async () => {
    const enabledRules = rules.filter((r) => r.enabled);
    if (enabledRules.length === 0) {
      Toast.show({ content: "请至少启用一条匹配规则", icon: "fail" });
      return;
    }

    if (participants.length === 0) {
      Toast.show({ content: "暂无参与者数据", icon: "fail" });
      return;
    }

    setIsMatching(true);
    setMatchingProgress(0);
    setMatchingMessage("正在提交匹配任务...");
    setStage("matching");
    setIsRulesLocked(true);

    try {
      const { taskId } = await submitMatchingTask(activityId, enabledRules);
      currentTaskIdRef.current = taskId;

      taskPollingRef.current = setInterval(() => {
        pollTaskStatus(activityId);
      }, 2000);

      pollTaskStatus(activityId);
    } catch (error) {
      console.error("Failed to start matching:", error);
      Toast.show({ content: "提交匹配任务失败", icon: "fail" });
      setIsMatching(false);
      setIsRulesLocked(false);
      setStage("configuring");
    }
  }, [activityId, rules, participants, pollTaskStatus]);

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
    async (historyId?: string) => {
      if (matchResults.length === 0 && !historyId) {
        Toast.show({ content: "暂无匹配结果", icon: "fail" });
        return;
      }

      setIsPublishing(true);
      try {
        // 所有已匹配参与者的 userId（即 best_matches 表中 user_id 的去重集合）
        const allMemberIds = Array.from(
          new Set(matchResults.map((r) => r.userId).filter(Boolean)),
        );

        if (allMemberIds.length === 0) {
          Toast.show({ content: "没有可通知的参与者", icon: "fail" });
          return;
        }

        // 调用通知接口发送匹配结果通知
        const token = (() => {
          try {
            const raw = localStorage.getItem("auth-storage");
            return raw ? JSON.parse(raw)?.state?.token ?? null : null;
          } catch { return null; }
        })();

        const response = await fetch(`/api/notification/notify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: 'enrollment',
            message: '您的匹配结果已出炉，快来查看您的分组信息吧！',
            enrollment_ids: allMemberIds,
            title: '匹配结果通知',
            event_id: activityId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStage("published");
          Toast.show({
            content: `结果发布成功，已通知 ${allMemberIds.length} 位参与者`,
            icon: "success"
          });

          // 刷新历史记录
          const historyData = await getMatchingHistory(activityId).catch(
            () => [],
          );
          setHistory(historyData);
        } else {
          throw new Error(data.message || "发布失败");
        }
      } catch (error) {
        console.error("Publish failed:", error);
        Toast.show({
          content: error instanceof Error ? error.message : "发布失败，请重试",
          icon: "fail"
        });
      } finally {
        setIsPublishing(false);
      }
    },
    [groups, activityId],
  );

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
    setIsLoading(true);
    try {
      const [participantsData, historyData] = await Promise.all([
        getParticipants(activityId).catch(() => []),
        getMatchingHistory(activityId).catch(() => []),
      ]);

      if (participantsData.length > 0) {
        setParticipants(participantsData);
      }
      if (historyData.length > 0) {
        setHistory(historyData);
      }

      Toast.show({ content: "数据已刷新", icon: "success" });
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activityId]);

  // === 返回状态和方法 ===
  return {
    // 状态
    stage,
    activeTab,
    isLoading,
    isMatching,
    isPublishing,
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

    // 设置方法
    setActiveTab,
    setRules,
    setConstraints,
    setGroups,

    // 规则操作
    handleGenerateRules,
    isGeneratingRules,
    handleSaveRules,
    handleLoadConfig,
    handleDeleteConfig,

    // 匹配操作
    handleStartMatching,
    handlePublish,
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
function convertHistoryGroups(historyGroups: any[]): MatchGroup[] {
  return historyGroups.map((g, index) => ({
    id: g.group_id || g.id || `group_${index}`,
    name: g.group_name || g.name || `第${index + 1}组`,
    members: (g.members || []).map((m: any) => m.user_id || m.id),
    score: Math.round((g.similarity_score || g.score || 0) * 100),
    reasons: g.match_reasons || g.reasons || [],
    isLocked: g.is_locked || g.isLocked || false,
  }));
}

export default useMatchingLogic;
