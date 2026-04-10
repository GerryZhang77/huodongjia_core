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
import { Toast } from "antd-mobile";

// API 服务函数
import {
  getMatchRules,
  saveMatchRules,
  executeMatching,
  getMatchGroups,
  toggleGroupLock,
  getParticipants,
  getMatchingHistory,
  publishMatchingResult,
  submitMatchingTask,
  getMatchingTaskStatus,
} from "../services/matchingApi";

// 使用重构版类型定义
import type {
  MatchingRule as MatchRule,
  MatchingGroup as MatchGroup,
  MatchConstraints,
  MatchingHistory,
} from "../types";

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

  // 重新匹配模式 - 标记是否处于重新匹配流程
  const [isRematchMode, setIsRematchMode] = useState(false);

  // 后台执行状态 - 匹配是否在后台执行
  const [isBackgroundMatching, setIsBackgroundMatching] = useState(false);

  // 锁定分组信息 - 重新匹配时保留的分组
  const [lockedGroupsForRematch, setLockedGroupsForRematch] = useState<
    MatchGroup[]
  >([]);

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

  // === 初始化加载 ===
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // 并行加载规则、参与者、历史记录
        const [rulesData, participantsData, historyData] = await Promise.all([
          getMatchRules(activityId).catch(() => [] as MatchRule[]),
          getParticipants(activityId).catch(() => [] as Participant[]),
          getMatchingHistory(activityId).catch(() => [] as MatchingHistory[]),
        ]);

        // 设置规则
        if (rulesData && rulesData.length > 0) {
          setRules(rulesData);
          setStage("configuring");
        }

        // 设置参与者
        if (participantsData && participantsData.length > 0) {
          setParticipants(participantsData);
        }

        // 设置历史记录
        if (historyData && historyData.length > 0) {
          setHistory(historyData);

          // 如果有已发布的结果，显示最新的
          const publishedHistory = historyData.find((h) => h.isPublished);
          if (publishedHistory && publishedHistory.groups.length > 0) {
            // 转换历史记录中的 groups 到当前格式
            const convertedGroups = convertHistoryGroups(
              publishedHistory.groups,
            );
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
          }
        }

        // 如果没有已发布结果，尝试加载最新的未发布匹配结果
        if (stage !== "published") {
          const matchResult = await getMatchGroups(activityId).catch(
            () => ({ groups: [] as MatchGroup[], participants: [] }),
          );
          if (matchResult.groups && matchResult.groups.length > 0) {
            setGroups(matchResult.groups);
            // 合并参与者数据：优先使用匹配结果中的参与者信息
            if (matchResult.participants.length > 0) {
              setParticipants(matchResult.participants);
            }
            setStage("completed");
            setActiveTab("results");

            const scores = matchResult.groups.map((g) => g.score || 0);
            if (scores.length > 0) {
              setMatchingStats({
                avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
                minScore: Math.min(...scores),
                maxScore: Math.max(...scores),
                totalGroups: matchResult.groups.length,
                totalParticipants: matchResult.participants.length,
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        Toast.show({ content: "加载数据失败", icon: "fail" });
      } finally {
        setIsLoading(false);
      }
    };

    if (activityId) {
      loadInitialData();
    }
  }, [activityId]);

  // === AI 生成匹配规则 ===
  const handleGenerateRules = useCallback(
    async (description: string) => {
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
          body: JSON.stringify({ description }),
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.message || "生成失败");

        const rawRules: string[] = data.rules || [];
        const rawWeights: number[] = data.weights || [];
        if (rawRules.length === 0) throw new Error("未生成任何规则");
        const generatedRules: MatchRule[] = rawRules.map((name, i) => ({
          id: `rule-${Date.now()}-${i}`,
          name,
          type: "similarity" as const,
          weight: rawWeights[i] ?? Math.round(100 / rawRules.length),
          enabled: true,
        }));

        setRules(generatedRules);
        setStage("configuring");
        Toast.show({ content: `已生成 ${generatedRules.length} 条规则`, icon: "success" });
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

          // 重新加载数据
          const [groupsData, historyData] = await Promise.all([
            getMatchGroups(activityId).catch(() => [] as MatchGroup[]),
            getMatchingHistory(activityId).catch(() => [] as MatchingHistory[]),
          ]);

          if (groupsData && groupsData.length > 0) {
            // 如果是重新匹配模式，需要合并锁定的分组
            const finalGroups =
              isRematchMode && lockedGroupsForRematch.length > 0
                ? [...lockedGroupsForRematch, ...groupsData]
                : groupsData;

            setGroups(finalGroups);
            setStage("completed");
            setActiveTab("results");

            const scores = finalGroups.map((g) => g.score || 0);
            setMatchingStats({
              avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
              minScore: Math.min(...scores),
              maxScore: Math.max(...scores),
              totalGroups: finalGroups.length,
              totalParticipants: participants.length,
            });
          }

          if (historyData) {
            setHistory(historyData);
          }

          // 退出重新匹配模式
          if (isRematchMode) {
            setIsRematchMode(false);
            setLockedGroupsForRematch([]);
          }

          setIsMatching(false);
          setIsRulesLocked(false); // 解锁规则编辑
          Toast.show({
            content: isRematchMode ? "重新匹配完成" : "匹配完成",
            icon: "success",
          });
        } else if (status.status === "failed") {
          // 任务失败
          if (taskPollingRef.current) {
            clearInterval(taskPollingRef.current);
            taskPollingRef.current = null;
          }
          currentTaskIdRef.current = null;
          setIsMatching(false);
          setIsRulesLocked(false); // 解锁规则编辑
          setStage("configuring");

          // 退出重新匹配模式
          if (isRematchMode) {
            setIsRematchMode(false);
            setLockedGroupsForRematch([]);
          }

          Toast.show({ content: status.message || "匹配失败", icon: "fail" });
        }
      } catch (error) {
        console.error("Failed to poll task status:", error);
      }
    },
    [activityId, participants.length, isRematchMode, lockedGroupsForRematch],
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

    // 如果处于重新匹配模式，需要处理锁定分组
    const isRematch = isRematchMode;
    const lockedGroups = isRematch ? lockedGroupsForRematch : [];

    setIsMatching(true);
    setMatchingProgress(0);
    setMatchingMessage(isRematch ? "正在重新匹配..." : "正在提交匹配任务...");
    setStage("matching");
    setIsRulesLocked(true); // 锁定规则编辑

    try {
      // 提交异步匹配任务（内部调用 execute，返回 activityId 作为 taskId）
      const { taskId } = await submitMatchingTask(activityId, enabledRules);
      currentTaskIdRef.current = taskId;

      // 开始轮询任务状态（用 activityId 轮询 /progress）
      taskPollingRef.current = setInterval(() => {
        pollTaskStatus(activityId);
      }, 2000);

      // 立即执行一次
      pollTaskStatus(activityId);
    } catch (error) {
      console.error("Failed to start matching:", error);
      Toast.show({ content: "提交匹配任务失败", icon: "fail" });
      setIsMatching(false);
      setIsRulesLocked(false); // 解锁规则编辑
      setStage("configuring");

      // 如果是重新匹配模式，退出该模式
      if (isRematch) {
        setIsRematchMode(false);
        setLockedGroupsForRematch([]);
      }
    }
  }, [
    activityId,
    rules,
    participants,
    pollTaskStatus,
    isRematchMode,
    lockedGroupsForRematch,
  ]);

  // === 最小化匹配进度到后台 ===
  const handleMinimizeMatching = useCallback(() => {
    setIsBackgroundMatching(true);
  }, []);

  // === 展开匹配进度 ===
  const handleExpandMatching = useCallback(() => {
    setIsBackgroundMatching(false);
  }, []);

  // === 切换分组锁定状态 ===
  const handleToggleGroupLock = useCallback(
    async (groupId: string) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;

      try {
        await toggleGroupLock(groupId, !group.isLocked);
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId ? { ...g, isLocked: !g.isLocked } : g,
          ),
        );
        Toast.show({
          content: group.isLocked ? "已解锁分组" : "已锁定分组",
          icon: "success",
        });
      } catch (error) {
        console.error("Failed to toggle group lock:", error);
        Toast.show({ content: "操作失败", icon: "fail" });
      }
    },
    [groups],
  );

  // === 进入重新匹配模式 ===
  // 保存当前结果为历史记录，切换到规则Tab让用户调整规则
  const handleEnterRematchMode = useCallback(() => {
    const lockedGroups = groups.filter((g) => g.isLocked);
    const lockedMemberIds = new Set(lockedGroups.flatMap((g) => g.members));
    const unlockParticipants = participants.filter(
      (p) => !lockedMemberIds.has(p.id),
    );

    if (unlockParticipants.length === 0) {
      Toast.show({ content: "所有分组都已锁定，无法重新匹配", icon: "fail" });
      return;
    }

    // 保存锁定的分组信息
    setLockedGroupsForRematch(lockedGroups);
    // 进入重新匹配模式
    setIsRematchMode(true);
    // 切换到规则设置 Tab
    setActiveTab("rules");

    Toast.show({
      content: `已保留 ${lockedGroups.length} 个锁定分组，请调整规则后开始匹配`,
      icon: "success",
    });
  }, [groups, participants]);

  // === 取消重新匹配模式 ===
  const handleCancelRematchMode = useCallback(() => {
    setIsRematchMode(false);
    setLockedGroupsForRematch([]);
    setActiveTab("results");
  }, []);

  // === 执行重新匹配 (在规则Tab中点击开始匹配时调用) ===
  const handleRematch = useCallback(async () => {
    if (!isRematchMode) {
      // 非重新匹配模式，走正常匹配流程
      return;
    }

    const enabledRules = rules.filter((r) => r.enabled);
    if (enabledRules.length === 0) {
      Toast.show({ content: "请至少启用一条匹配规则", icon: "fail" });
      return;
    }

    setIsMatching(true);
    setMatchingProgress(0);
    setMatchingMessage("正在重新匹配...");
    setIsRulesLocked(true);

    try {
      const progressInterval = setInterval(() => {
        setMatchingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      const result = await executeMatching({
        activityId,
        rules: enabledRules,
      });

      clearInterval(progressInterval);
      setMatchingProgress(100);

      if (result.groups) {
        // 合并锁定的分组和新匹配的分组
        const newGroups = [...lockedGroupsForRematch, ...result.groups];
        setGroups(newGroups);

        // 更新统计
        const scores = newGroups.map((g) => g.score || 0);
        if (scores.length > 0) {
          setMatchingStats({
            avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
            minScore: Math.min(...scores),
            maxScore: Math.max(...scores),
            totalGroups: newGroups.length,
            totalParticipants: participants.length,
          });
        }

        // 退出重新匹配模式
        setIsRematchMode(false);
        setLockedGroupsForRematch([]);
        setStage("completed");
        setActiveTab("results");

        // 刷新历史记录
        const historyData = await getMatchingHistory(activityId).catch(
          () => [],
        );
        if (historyData.length > 0) {
          setHistory(historyData);
          setCurrentHistoryId(historyData[0]?.id || null);
        }

        Toast.show({ content: "重新匹配完成", icon: "success" });
      }
    } catch (error) {
      console.error("Rematch failed:", error);
      Toast.show({ content: "重新匹配失败", icon: "fail" });
    } finally {
      setIsMatching(false);
      setMatchingProgress(0);
      setIsRulesLocked(false);
    }
  }, [activityId, rules, participants, isRematchMode, lockedGroupsForRematch]);

  // === 发布结果 ===
  const handlePublish = useCallback(
    async (historyId?: string) => {
      if (groups.length === 0 && !historyId) {
        Toast.show({ content: "暂无匹配结果", icon: "fail" });
        return;
      }

      setIsPublishing(true);
      try {
        // 获取所有参与者的 ID（从 groups.members 中提取）
        const allMemberIds = groups.flatMap((g) => g.members);

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
    isRulesLocked, // 规则锁定状态
    matchingProgress,
    matchingMessage,

    // 重新匹配相关状态
    isRematchMode,
    isBackgroundMatching,
    lockedGroupsForRematch,
    currentHistoryId,

    // 数据
    rules,
    constraints,
    participants,
    groups,
    history,
    matchingStats,
    savedConfigs, // 已保存的规则配置列表

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
    handleRematch,
    handleToggleGroupLock,
    handlePublish,
    handleViewHistory,
    handleRestoreHistory,
    handleRefresh,

    // 重新匹配操作
    handleEnterRematchMode,
    handleCancelRematchMode,

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
