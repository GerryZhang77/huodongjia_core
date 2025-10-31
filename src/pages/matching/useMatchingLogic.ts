import { useState, useCallback } from "react";
import { Toast } from "antd-mobile";
import { api } from "@/lib/api";
import {
  MatchingRule,
  MatchConstraints,
  MatchingGroup,
  Participant,
  MatchingStage,
  TabKey,
} from "./types";

interface UseMatchingLogicProps {
  eventId: string;
}

/**
 * 匹配功能核心业务逻辑 Hook
 * 集中管理所有状态和 API 调用
 */
export const useMatchingLogic = ({ eventId }: UseMatchingLogicProps) => {
  // ==================== 状态管理 ====================
  const [activeTab, setActiveTab] = useState<TabKey>("rules");
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [rules, setRules] = useState<MatchingRule[]>([]);
  const [constraints, setConstraints] = useState<MatchConstraints>({
    minGroupSize: 3,
    maxGroupSize: 8,
    genderRatioMin: 40,
    genderRatioMax: 60,
    sameIndustryMax: 2,
  });

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matchingGroups, setMatchingGroups] = useState<MatchingGroup[]>([]);
  const [ungroupedParticipants, setUngroupedParticipants] = useState<
    Participant[]
  >([]);

  const [isGeneratingRules, setIsGeneratingRules] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [matchingStage, setMatchingStage] = useState<MatchingStage>("idle");
  const [hasMatchResult, setHasMatchResult] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasPublished, setHasPublished] = useState(false);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0); // 预计剩余时间（秒）
  const [matchingError, setMatchingError] = useState<string | null>(null); // 匹配错误信息

  // ==================== API 调用函数 ====================

  /**
   * 获取参与者数据（从报名信息获取）
   */
  const fetchParticipants = useCallback(async () => {
    console.log("=".repeat(60));
    console.log("[获取参与者] 函数被调用");
    console.log("[获取参与者] 时间:", new Date().toISOString());
    console.log("[获取参与者] eventId:", eventId);
    console.log("[获取参与者] eventId 类型:", typeof eventId);
    console.log("[获取参与者] API 路径:", `/api/events/${eventId}/enrollments`);

    try {
      console.log("[获取参与者] 开始发送 API 请求...");
      const response = await api.get(`/api/events/${eventId}/enrollments`);

      console.log("[获取参与者] ✅ API 响应成功");
      console.log("[获取参与者] 响应类型:", typeof response);
      console.log("[获取参与者] 响应数据:", JSON.stringify(response, null, 2));

      // 因为 axios 拦截器返回 response.data，所以这里的 response 就是业务数据
      const apiResponse = response as unknown as {
        success: boolean;
        total: number;
        enrollments: Array<{
          id: string;
          name: string;
          gender: string;
          age: number;
          phone: string;
          email: string;
          occupation: string;
          company: string;
          industry: string;
          city: string;
          tags: string[];
          customFields: Record<string, unknown>;
          status: string;
        }>;
      };

      console.log("[获取参与者] success:", apiResponse.success);
      console.log("[获取参与者] total:", apiResponse.total);
      console.log(
        "[获取参与者] enrollments 数组长度:",
        apiResponse.enrollments?.length || 0
      );

      // 将 enrollments 转换为 Participant 格式
      const participantList: Participant[] = (
        apiResponse.enrollments || []
      ).map((enrollment) => ({
        id: enrollment.id,
        name: enrollment.name,
        gender: enrollment.gender,
        age: enrollment.age,
        phone: enrollment.phone,
        email: enrollment.email,
        occupation: enrollment.occupation,
        company: enrollment.company,
        industry: enrollment.industry,
        city: enrollment.city,
        tags: enrollment.tags || [],
        interests: enrollment.tags || [], // 使用 tags 作为 interests
        skills: [], // 如果有技能字段可以从 customFields 提取
      }));

      console.log(
        `[获取参与者] ✅ 成功转换 ${participantList.length} 名参与者`
      );
      console.log("[获取参与者] 第一个参与者:", participantList[0]);

      setParticipants(participantList);
      setUngroupedParticipants(participantList);

      console.log("[获取参与者] ✅ State 已更新");

      if (participantList.length === 0) {
        console.warn("[获取参与者] ⚠️  参与者列表为空");
        Toast.show({ content: "暂无报名数据", icon: "fail" });
      }

      console.log("=".repeat(60));
    } catch (error) {
      console.log("=".repeat(60));
      console.error("[获取参与者] ❌ 发生错误");
      console.error("[获取参与者] 错误类型:", error?.constructor?.name);
      console.error("[获取参与者] 错误信息:", error);
      console.error("[获取参与者] 错误堆栈:", (error as Error)?.stack);
      console.log("=".repeat(60));
      Toast.show({ content: "获取参与者数据失败", icon: "fail" });
    }
  }, [eventId]);

  /**
   * 获取已保存的规则配置
   */
  const fetchRules = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/match-rules/${eventId}`);

      if (data.success && data.data) {
        setRules(data.data.rules || []);
        return true;
      } else if (data.code === "RULES_NOT_FOUND") {
        // 规则未配置，这是正常情况
        return false;
      }
    } catch (error) {
      console.error("Fetch rules error:", error);
      // 不显示错误提示，因为首次访问可能没有规则
    }
    return false;
  }, [eventId]);

  /**
   * 生成匹配规则 (AI)
   * 🔥 临时修改：Mock 生产环境专用，使用简化的请求体结构
   */
  const handleGenerateRules = useCallback(async () => {
    if (!naturalLanguageInput.trim()) {
      Toast.show({ content: "请输入匹配需求描述", icon: "fail" });
      return;
    }

    setIsGeneratingRules(true);
    try {
      // 🔥 临时修改：真实后端返回结构与 Mock 不同
      // 真实后端: { success: boolean, message: string, rules: string[] }
      // Mock: { success: boolean, data: { rules: MatchingRule[], suggestedConstraints?: {...} } }

      // 🔥 临时修改：Mock 生产环境专用，使用简化的请求体
      // 根据真实后端测试验证，字段名为 expectation（不是 description）
      const requestBody = {
        expectation: naturalLanguageInput, // 匹配期望描述（必填）
        // 可选字段（暂时不传，后端可能未实现）：
        // participantCount: participants.length,
        // expectedGroupSize: 5,
      };

      const response = await api.post(
        `/api/match/${eventId}/generate`,
        requestBody
      );

      console.log("[生成规则] API 响应:", response);

      // 🔥 临时修改：适配真实后端返回结构
      // 真实后端返回: { success: true, message: '...', rules: [...] }
      // Mock 返回: { success: true, data: { rules: [...], suggestedConstraints: {...} } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response as any;

      // 判断是真实后端还是 Mock
      const isRealBackend = apiResponse.rules && !apiResponse.data;
      const businessData = isRealBackend
        ? { rules: apiResponse.rules, suggestedConstraints: undefined } // 真实后端：rules 在顶层
        : apiResponse.data; // Mock：rules 在 data 内

      console.log("[生成规则] 业务数据:", businessData);

      // 检查业务数据
      if (businessData && businessData.rules && businessData.rules.length > 0) {
        // 🔥 临时修改：适配真实后端返回的字符串数组
        // 真实后端返回 rules: ['规则1', '规则2', ...]
        // 需要转换为 MatchingRule[] 对象数组
        const formattedRules: MatchingRule[] = businessData.rules.map(
          (rule: string | MatchingRule, index: number) => {
            if (typeof rule === "string") {
              // 真实后端返回字符串，转换为 MatchingRule 对象
              return {
                id: `rule-${Date.now()}-${index}`,
                name: rule,
                weight: 1, // 默认权重
                type: "similarity" as const,
                field: "tags",
              };
            }
            // Mock 返回的已经是对象格式
            return rule;
          }
        );

        setRules(formattedRules);

        // 如果有建议的约束条件，更新约束条件
        if (businessData.suggestedConstraints) {
          const suggested = businessData.suggestedConstraints;
          setConstraints((prev) => ({
            minGroupSize: suggested.minGroupSize || prev.minGroupSize,
            maxGroupSize: suggested.maxGroupSize || prev.maxGroupSize,
            genderRatioMin: suggested.genderRatioMin || prev.genderRatioMin,
            genderRatioMax: suggested.genderRatioMax || prev.genderRatioMax,
            sameIndustryMax: suggested.sameIndustryMax || prev.sameIndustryMax,
          }));
        }

        Toast.show({
          content: `已生成 ${businessData.rules.length} 条匹配规则${
            !apiResponse.success ? " (Mock数据)" : ""
          }`,
          icon: "success",
        });
      } else {
        console.error("[生成规则] 数据格式错误，response:", response);
        Toast.show({
          content: apiResponse.message || "规则生成失败",
          icon: "fail",
        });
      }
    } catch (error) {
      console.error("Generate rules error:", error);
      Toast.show({ content: "网络错误，请重试", icon: "fail" });
    } finally {
      setIsGeneratingRules(false);
    }
  }, [eventId, naturalLanguageInput]); // 🔥 移除 participants 依赖

  /**
   * 保存规则配置
   */
  const handleSaveRules = useCallback(async () => {
    if (rules.length === 0) {
      Toast.show({ content: "请先生成或添加规则", icon: "fail" });
      return;
    }

    // 验证启用规则的权重总和
    const enabledRules = rules.filter((r) => r.enabled);
    const totalWeight = enabledRules.reduce((sum, r) => sum + r.weight, 0);

    if (enabledRules.length > 0 && totalWeight !== 100) {
      Toast.show({
        content: `启用规则权重总和为 ${totalWeight}%，将自动归一化为 100%`,
        icon: "info",
      });
    }

    try {
      const { data } = await api.post(`/api/match-rules/${eventId}`, {
        rules: rules.map((rule) => ({
          ...rule,
          // 移除前端临时字段
          id: rule.id?.startsWith("temp-") ? undefined : rule.id,
        })),
      });

      if (data.success) {
        Toast.show({
          content: `保存成功：新增 ${data.data?.created || 0} 条，更新 ${
            data.data?.updated || 0
          } 条`,
          icon: "success",
        });
      } else {
        Toast.show({ content: data.message || "保存失败", icon: "fail" });
      }
    } catch (error) {
      console.error("Save rules error:", error);
      Toast.show({ content: "网络错误，请重试", icon: "fail" });
    }
  }, [eventId, rules]);

  /**
   * 执行匹配 (5 个 API 调用)
   */
  const handleStartMatching = useCallback(async () => {
    console.log("[开始匹配] 触发，当前参与者数量:", participants.length);
    console.log("[开始匹配] 参与者数据:", participants);

    // 验证参与者数据
    if (participants.length === 0) {
      console.error("[开始匹配] 错误: 参与者数量为 0");
      Toast.show({
        content: "暂无参与者数据，无法执行匹配",
        icon: "fail",
      });
      return;
    }

    // 验证规则
    const enabledRules = rules.filter((r) => r.enabled);
    if (enabledRules.length === 0) {
      console.error("[开始匹配] 错误: 没有启用的规则");
      Toast.show({
        content: "请先启用至少一条匹配规则",
        icon: "fail",
      });
      return;
    }

    console.log(
      `[开始匹配] 验证通过，开始匹配 ${participants.length} 名参与者`
    );

    setIsMatching(true);
    setMatchingProgress(0);
    setMatchingStage("matching");
    setMatchingError(null);

    // 根据参与人数估算总时间（秒）
    const estimatedTotal = Math.max(10, participants.length * 0.5);
    setEstimatedTimeRemaining(estimatedTotal);

    try {
      // 执行匹配算法（后端会自动完成：提取关键词 → 计算词嵌入 → 计算相似度 → 匹配分组）
      setMatchingProgress(10);
      setMatchingStage("matching");

      const matchData = await api.post(`/api/match/${eventId}/execute`, {
        rules: rules.filter((rule) => rule.enabled),
        constraints,
      });

      if (!matchData.success) {
        throw new Error(matchData.message || "匹配失败");
      }

      setMatchingProgress(80);
      setEstimatedTimeRemaining(estimatedTotal * 0.2);

      // 获取匹配结果
      const resultData = await api.get(`/api/match-groups/${eventId}`);

      if (resultData?.success) {
        setMatchingProgress(100);
        setMatchingStage("done");
        setEstimatedTimeRemaining(0);

        // 处理匹配结果
        const groups: MatchingGroup[] = (
          (resultData.groups as Array<Record<string, unknown>>) || []
        ).map((group: Record<string, unknown>) => ({
          id: (group.group_id as string) || (group.id as string),
          name: (group.name as string) || `分组 ${group.group_id}`,
          members: (
            (group.members as Array<Record<string, unknown>>) || []
          ).map((member: Record<string, unknown>) => ({
            id: (member.user_id as string) || (member.id as string),
            name: member.name as string,
            gender: member.gender as string,
            age: member.age as number,
            occupation: member.occupation as string,
            industry: member.industry as string,
            tags: (member.tags || member.keywords || []) as string[],
            bio: member.bio as string,
          })),
          score:
            (group.similarity_score as number) || (group.score as number) || 0,
          reasons: (group.match_reasons || group.reasons || []) as string[],
          isLocked: (group.is_locked as boolean) || false,
        }));

        setMatchingGroups(groups);
        setHasMatchResult(true);

        // 计算未分组成员
        const groupedMemberIds = new Set(
          groups.flatMap((g) => g.members.map((m) => m.id))
        );
        const ungrouped = participants.filter(
          (p) => !groupedMemberIds.has(p.id)
        );
        setUngroupedParticipants(ungrouped);

        // 自动切换到结果 Tab
        setActiveTab("results");

        Toast.show({ content: "匹配完成", icon: "success" });
      } else {
        throw new Error(resultData.message || "获取结果失败");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "匹配失败，请重试";
      console.error("Execute matching error:", error);
      setMatchingError(errorMessage);
      Toast.show({
        content: errorMessage,
        icon: "fail",
        duration: 3000,
      });
      setMatchingStage("idle");
    } finally {
      setIsMatching(false);
      setEstimatedTimeRemaining(0);
      setTimeout(() => setMatchingProgress(0), 1000);
    }
  }, [eventId, rules, constraints, participants]);

  /**
   * 重新匹配
   */
  const handleRematch = useCallback(async () => {
    // 保留已锁定的分组，重新匹配未锁定的成员
    const lockedGroups = matchingGroups.filter((g) => g.isLocked);
    const lockedMemberIds = new Set(
      lockedGroups.flatMap((g) => g.members.map((m) => m.id))
    );

    // 未锁定的成员重新进入参与者池
    const unlockedParticipants = participants.filter(
      (p) => !lockedMemberIds.has(p.id)
    );

    setUngroupedParticipants(unlockedParticipants);
    await handleStartMatching();
  }, [matchingGroups, participants, handleStartMatching]);

  /**
   * 切换分组锁定状态
   */
  const handleToggleGroupLock = useCallback((groupId: string) => {
    setMatchingGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, isLocked: !group.isLocked } : group
      )
    );
  }, []);

  /**
   * 处理拖拽结束事件
   * 支持 4 种场景：
   * 1. 未分组 → 已分组
   * 2. 组 A → 组 B
   * 3. 已分组 → 未分组
   * 4. 组内排序
   */
  const handleDragEnd = useCallback(
    (
      activeMemberId: string,
      activeGroupId: string | undefined,
      targetGroupId: string
    ) => {
      // 检查源组和目标组的锁定状态
      const sourceGroup = matchingGroups.find((g) => g.id === activeGroupId);
      if (sourceGroup?.isLocked) {
        Toast.show({ content: "该组已锁定，无法移动成员", icon: "fail" });
        return;
      }

      const targetGroup = matchingGroups.find((g) => g.id === targetGroupId);
      if (targetGroup?.isLocked && targetGroupId !== "ungrouped") {
        Toast.show({ content: "目标组已锁定，无法添加成员", icon: "fail" });
        return;
      }

      // 找到要移动的成员
      let memberToMove: Participant | undefined;

      if (activeGroupId) {
        // 从分组中查找
        const group = matchingGroups.find((g) => g.id === activeGroupId);
        memberToMove = group?.members.find((m) => m.id === activeMemberId);
      } else {
        // 从未分组中查找
        memberToMove = ungroupedParticipants.find(
          (m) => m.id === activeMemberId
        );
      }

      if (!memberToMove) {
        Toast.show({ content: "未找到要移动的成员", icon: "fail" });
        return;
      }

      // 场景 1: 未分组 → 已分组
      if (!activeGroupId && targetGroupId !== "ungrouped") {
        setUngroupedParticipants((prev) =>
          prev.filter((m) => m.id !== activeMemberId)
        );
        setMatchingGroups((prev) =>
          prev.map((g) =>
            g.id === targetGroupId
              ? { ...g, members: [...g.members, memberToMove!] }
              : g
          )
        );
        Toast.show({
          content: `已将 ${memberToMove.name} 添加到分组`,
          icon: "success",
        });
        return;
      }

      // 场景 2: 组 A → 组 B
      if (
        activeGroupId &&
        targetGroupId !== "ungrouped" &&
        activeGroupId !== targetGroupId
      ) {
        setMatchingGroups((prev) =>
          prev.map((g) => {
            if (g.id === activeGroupId) {
              return {
                ...g,
                members: g.members.filter((m) => m.id !== activeMemberId),
              };
            }
            if (g.id === targetGroupId) {
              return { ...g, members: [...g.members, memberToMove!] };
            }
            return g;
          })
        );
        Toast.show({
          content: `已将 ${memberToMove.name} 移动到新分组`,
          icon: "success",
        });
        return;
      }

      // 场景 3: 已分组 → 未分组
      if (activeGroupId && targetGroupId === "ungrouped") {
        setMatchingGroups((prev) =>
          prev.map((g) =>
            g.id === activeGroupId
              ? {
                  ...g,
                  members: g.members.filter((m) => m.id !== activeMemberId),
                }
              : g
          )
        );
        setUngroupedParticipants((prev) => [...prev, memberToMove!]);
        Toast.show({
          content: `已将 ${memberToMove.name} 移出分组`,
          icon: "success",
        });
        return;
      }

      // 场景 4: 组内排序（可选实现，暂不处理）
    },
    [matchingGroups, ungroupedParticipants]
  );

  /**
   * 手动添加成员到分组（拖拽备选方案）
   * 适合移动端或拖拽失败时使用
   */
  const handleAddMemberToGroup = useCallback(
    (memberId: string, targetGroupId: string) => {
      const member = ungroupedParticipants.find((m) => m.id === memberId);
      if (!member) {
        Toast.show({ content: "未找到该成员", icon: "fail" });
        return;
      }

      const targetGroup = matchingGroups.find((g) => g.id === targetGroupId);
      if (!targetGroup) {
        Toast.show({ content: "目标分组不存在", icon: "fail" });
        return;
      }

      if (targetGroup.isLocked) {
        Toast.show({ content: "该组已锁定，无法添加成员", icon: "fail" });
        return;
      }

      // 从未分组中移除
      setUngroupedParticipants((prev) => prev.filter((m) => m.id !== memberId));

      // 添加到目标组
      setMatchingGroups((prev) =>
        prev.map((g) =>
          g.id === targetGroupId ? { ...g, members: [...g.members, member] } : g
        )
      );

      Toast.show({
        content: `已将 ${member.name} 添加到 ${targetGroup.name}`,
        icon: "success",
      });
    },
    [ungroupedParticipants, matchingGroups]
  );

  /**
   * 发布匹配结果
   */
  const handlePublishResults = useCallback(
    async (sendNotification: boolean) => {
      setIsPublishing(true);
      try {
        const { data } = await api.post(
          `/api/match-groups/${eventId}/publish`,
          {
            groups: matchingGroups,
            send_notification: sendNotification,
          }
        );

        if (data.success) {
          setHasPublished(true);
          Toast.show({
            content: sendNotification ? "结果已发布并通知参与者" : "结果已发布",
            icon: "success",
          });
        } else {
          Toast.show({ content: data.message || "发布失败", icon: "fail" });
        }
      } catch (error) {
        console.error("Publish results error:", error);
        Toast.show({ content: "网络错误，请重试", icon: "fail" });
      } finally {
        setIsPublishing(false);
      }
    },
    [eventId, matchingGroups]
  );

  // ==================== 返回值 ====================
  return {
    // Tab 状态
    activeTab,
    setActiveTab,

    // 规则设置相关
    naturalLanguageInput,
    setNaturalLanguageInput,
    rules,
    setRules,
    constraints,
    setConstraints,
    isGeneratingRules,
    handleGenerateRules,
    handleSaveRules,
    fetchRules,

    // 匹配控制台相关
    participants,
    isMatching,
    matchingProgress,
    matchingStage,
    estimatedTimeRemaining,
    matchingError,
    hasMatchResult,
    handleStartMatching,
    handleRematch,

    // 匹配结果相关
    matchingGroups,
    ungroupedParticipants,
    handleToggleGroupLock,
    handleDragEnd,
    handleAddMemberToGroup,
    isPublishing,
    hasPublished,
    handlePublishResults,

    // 初始化函数
    fetchParticipants,
  };
};
