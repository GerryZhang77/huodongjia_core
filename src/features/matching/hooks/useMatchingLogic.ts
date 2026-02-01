/**
 * 匹配模块状态管理 Hook (重构版)
 * 简化逻辑，整合规则设置和匹配执行
 */

import { useState, useCallback, useEffect } from "react";
import { Toast } from "antd-mobile";

// API 服务函数
import {
  getMatchRules,
  createMatchRule,
  updateMatchRule,
  deleteMatchRule,
  generateMatchRules,
  executeMatching,
  getMatchGroups,
  toggleGroupLock,
} from "../services/matchingApi";

// 使用 API 服务中导入的类型
import type { MatchRule, MatchGroup } from "../types";

// === 本地类型定义 ===
export type MatchingStage =
  | "idle"
  | "configuring"
  | "matching"
  | "completed"
  | "published";
export type TabKey = "rules" | "results";

export interface MatchConstraints {
  minGroupSize: number;
  maxGroupSize: number;
  genderRatioMin: number;
  genderRatioMax: number;
  sameIndustryMax: number;
}

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
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
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

  // 加载状态
  const [isLoading, setIsLoading] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);

  // 统计
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(
    null,
  );

  // === 初始化加载 ===
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // 加载规则和分组结果
        const [rulesData, groupsData] = await Promise.all([
          getMatchRules(activityId).catch(() => [] as MatchRule[]),
          getMatchGroups(activityId).catch(() => [] as MatchGroup[]),
        ]);

        if (rulesData && rulesData.length > 0) {
          setRules(rulesData);
          setStage("configuring");
        }

        if (groupsData && groupsData.length > 0) {
          setGroups(groupsData);
          setStage("completed");
          setActiveTab("results");

          // 计算统计信息
          const scores = groupsData.map((g) => g.score || 0);
          if (scores.length > 0) {
            setMatchingStats({
              avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
              minScore: Math.min(...scores),
              maxScore: Math.max(...scores),
              totalGroups: groupsData.length,
            });
          }
        }

        // 生成模拟参与者数据 (实际项目中应从报名数据获取)
        setParticipants(generateMockParticipants(20));
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

  // === AI 生成规则 ===
  const handleGenerateRules = useCallback(async () => {
    if (!naturalLanguageInput.trim()) {
      Toast.show({ content: "请输入匹配需求描述", icon: "fail" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMatchRules({
        activityId,
        description: naturalLanguageInput,
      });

      if (result.rules && result.rules.length > 0) {
        setRules(result.rules);
        setStage("configuring");
        Toast.show({
          content: `已生成 ${result.rules.length} 条规则`,
          icon: "success",
        });
      } else {
        Toast.show({ content: "未能生成规则，请重试", icon: "fail" });
      }
    } catch (error) {
      console.error("Failed to generate rules:", error);
      Toast.show({ content: "生成规则失败", icon: "fail" });
    } finally {
      setIsGenerating(false);
    }
  }, [activityId, naturalLanguageInput]);

  // === 添加规则 ===
  const handleAddRule = useCallback(
    async (rule: Omit<MatchRule, "id" | "createdAt">) => {
      try {
        const newRule = await createMatchRule(rule);
        setRules((prev) => [...prev, newRule]);
        Toast.show({ content: "规则已添加", icon: "success" });
        return newRule;
      } catch (error) {
        console.error("Failed to add rule:", error);
        Toast.show({ content: "添加规则失败", icon: "fail" });
        throw error;
      }
    },
    [],
  );

  // === 更新规则 ===
  const handleUpdateRule = useCallback(
    async (ruleId: string, updates: Partial<MatchRule>) => {
      try {
        const updatedRule = await updateMatchRule(ruleId, updates);
        setRules((prev) =>
          prev.map((r) => (r.id === ruleId ? { ...r, ...updatedRule } : r)),
        );
        return updatedRule;
      } catch (error) {
        console.error("Failed to update rule:", error);
        Toast.show({ content: "更新规则失败", icon: "fail" });
        throw error;
      }
    },
    [],
  );

  // === 删除规则 ===
  const handleDeleteRule = useCallback(async (ruleId: string) => {
    try {
      await deleteMatchRule(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      Toast.show({ content: "规则已删除", icon: "success" });
    } catch (error) {
      console.error("Failed to delete rule:", error);
      Toast.show({ content: "删除规则失败", icon: "fail" });
    }
  }, []);

  // === 保存所有规则配置 ===
  const handleSaveRules = useCallback(async () => {
    try {
      // 这里可以批量保存规则
      Toast.show({ content: "配置已保存", icon: "success" });
    } catch (error) {
      console.error("Failed to save rules:", error);
      Toast.show({ content: "保存失败", icon: "fail" });
    }
  }, []);

  // === 开始匹配 ===
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
    setStage("matching");

    try {
      // 模拟进度
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

      if (result.groups && result.groups.length > 0) {
        setGroups(result.groups);
        setMatchingStats({
          avgScore: result.averageScore || 0,
          minScore: 0,
          maxScore: 100,
          totalGroups: result.groups.length,
          totalParticipants: result.totalParticipants || participants.length,
        });
        setStage("completed");
        setActiveTab("results");
        Toast.show({
          content: `匹配完成，共 ${result.groups.length} 个分组`,
          icon: "success",
        });
      } else {
        throw new Error("匹配结果为空");
      }
    } catch (error) {
      console.error("Matching failed:", error);
      Toast.show({ content: "匹配失败，请重试", icon: "fail" });
      setStage("configuring");
    } finally {
      setIsMatching(false);
      setMatchingProgress(0);
    }
  }, [activityId, rules, participants]);

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

  // === 重新匹配 ===
  const handleRematch = useCallback(async () => {
    const lockedGroups = groups.filter((g) => g.isLocked);
    const lockedMemberIds = new Set(
      lockedGroups.flatMap((g) => g.members.map((m: LocalGroupMember) => m.id)),
    );
    const unlockParticipants = participants.filter(
      (p) => !lockedMemberIds.has(p.id),
    );

    if (unlockParticipants.length === 0) {
      Toast.show({ content: "所有分组都已锁定", icon: "fail" });
      return;
    }

    setIsMatching(true);
    setMatchingProgress(0);

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

      const enabledRules = rules.filter((r) => r.enabled);
      const result = await executeMatching({
        activityId,
        rules: enabledRules,
      });

      clearInterval(progressInterval);
      setMatchingProgress(100);

      if (result.groups) {
        // 合并锁定的分组和新匹配的分组
        const newGroups = [...lockedGroups, ...result.groups];
        setGroups(newGroups);
        Toast.show({ content: "重新匹配完成", icon: "success" });
      }
    } catch (error) {
      console.error("Rematch failed:", error);
      Toast.show({ content: "重新匹配失败", icon: "fail" });
    } finally {
      setIsMatching(false);
      setMatchingProgress(0);
    }
  }, [activityId, rules, participants, groups]);

  // === 发布结果 ===
  const handlePublish = useCallback(async () => {
    if (groups.length === 0) {
      Toast.show({ content: "暂无匹配结果", icon: "fail" });
      return;
    }

    setIsPublishing(true);
    try {
      // 发布逻辑 - 实际项目中调用 API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStage("published");
      Toast.show({ content: "结果发布成功", icon: "success" });
    } catch (error) {
      console.error("Publish failed:", error);
      Toast.show({ content: "发布失败，请重试", icon: "fail" });
    } finally {
      setIsPublishing(false);
    }
  }, [groups]);

  // === 返回状态和方法 ===
  return {
    // 状态
    stage,
    activeTab,
    isLoading,
    isGenerating,
    isMatching,
    isPublishing,
    matchingProgress,

    // 数据
    naturalLanguageInput,
    rules,
    constraints,
    participants,
    groups,
    matchingStats,

    // 设置方法
    setActiveTab,
    setNaturalLanguageInput,
    setRules,
    setConstraints,
    setGroups,

    // 规则操作
    handleGenerateRules,
    handleAddRule,
    handleUpdateRule,
    handleDeleteRule,
    handleSaveRules,

    // 匹配操作
    handleStartMatching,
    handleRematch,
    handleToggleGroupLock,
    handlePublish,
  };
}

// === 辅助函数：生成模拟参与者数据 ===
function generateMockParticipants(count: number): Participant[] {
  const names = [
    "张伟",
    "李娜",
    "王芳",
    "刘强",
    "陈明",
    "杨丽",
    "赵敏",
    "周杰",
    "吴婷",
    "徐磊",
    "孙静",
    "马超",
    "朱艳",
    "胡亮",
    "郭燕",
    "林峰",
    "何梅",
    "高远",
    "罗琳",
    "谢军",
  ];

  const occupations = [
    "工程师",
    "设计师",
    "产品经理",
    "运营",
    "市场",
    "销售",
    "HR",
  ];
  const industries = ["互联网", "金融", "教育", "医疗", "制造", "零售"];
  const tags = ["技术", "创业", "投资", "社交", "旅行", "音乐", "运动"];

  return Array.from({ length: count }, (_, i) => ({
    id: `p_${i + 1}`,
    name: names[i % names.length],
    gender: i % 2 === 0 ? "male" : "female",
    age: 25 + Math.floor(Math.random() * 15),
    occupation: occupations[Math.floor(Math.random() * occupations.length)],
    industry: industries[Math.floor(Math.random() * industries.length)],
    tags: Array.from(
      { length: 2 + Math.floor(Math.random() * 2) },
      () => tags[Math.floor(Math.random() * tags.length)],
    ),
    bio: `热爱${tags[Math.floor(Math.random() * tags.length)]}，希望结识志同道合的朋友。`,
  }));
}

export default useMatchingLogic;
