/**
 * Matching Module - API Service
 * 匹配模块 - API 服务
 */

import type {
  MatchingRule,
  MatchingGroup,
  GenerateRulesRequest,
  GenerateRulesResponse,
  ExecuteMatchRequest,
  ExecuteMatchResponse,
} from "../types";

// 兼容别名
type MatchRule = MatchingRule;
type MatchGroup = MatchingGroup;

/**
 * 获取 token
 */
const getToken = (): string | null => {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    return null;
  }
};

/**
 * 获取活动的匹配规则列表
 * 后端返回 match_rules_detail.rules，是 string[] 或 MatchingRule[]
 * 统一转换为 MatchingRule[]
 */
export const getMatchRules = async (
  activityId: string,
): Promise<MatchRule[]> => {
  const token = getToken();

  const response = await fetch(`/api/match/${activityId}/rules`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取匹配规则失败");
  }

  // 后端返回 { success: true, rules: { rules: string[] | MatchingRule[], weights?: number[] } }
  const rawRules = data.rules?.rules ?? data.rules ?? [];

  if (!Array.isArray(rawRules) || rawRules.length === 0) return [];

  // 如果是字符串数组（AI 生成后保存的格式），转换为 MatchingRule[]
  if (typeof rawRules[0] === "string") {
    const weights: number[] = data.rules?.weights ?? [];
    return (rawRules as string[]).map((name, i) => ({
      id: `rule-${i}`,
      name,
      type: "similarity" as const,
      weight: weights[i] ?? Math.round(100 / rawRules.length),
      enabled: true,
    }));
  }

  return rawRules as MatchRule[];
};

/**
 * 保存匹配规则到后端
 * 后端期望: { rules: MatchingRule[], weights?: number[] }
 */
export const saveMatchRules = async (
  activityId: string,
  rules: MatchRule[],
): Promise<void> => {
  const token = getToken();

  const enabledRules = rules.filter((r) => r.enabled);
  const totalWeight = enabledRules.reduce((s, r) => s + r.weight, 0);
  const weights = rules.map((r) =>
    r.enabled && totalWeight > 0 ? Math.round((r.weight / totalWeight) * 100) : 0
  );

  const response = await fetch(`/api/match/${activityId}/rules`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rules, weights }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "保存匹配规则失败");
  }
};

/**
 * 更新匹配规则
 */
export const updateMatchRule = async (
  ruleId: string,
  updates: Partial<MatchRule>,
): Promise<MatchRule> => {
  const token = getToken();

  const response = await fetch(`/api/match-rules/${ruleId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "更新匹配规则失败");
  }

  return data.rule;
};

/**
 * 删除匹配规则
 */
export const deleteMatchRule = async (ruleId: string): Promise<void> => {
  const token = getToken();

  const response = await fetch(`/api/match-rules/${ruleId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "删除匹配规则失败");
  }
};

/**
 * 使用 AI 生成匹配规则
 */
export const generateMatchRules = async (
  request: GenerateRulesRequest,
): Promise<GenerateRulesResponse> => {
  const token = getToken();

  const response = await fetch(
    `/api/generate-match-rules/${request.activityId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: request.description,
      }),
    },
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "生成匹配规则失败");
  }

  return {
    rules: data.rules || [],
  };
};

/**
 * 执行智能匹配
 * 后端期望: { rules: "规则1,规则2,...", weights: [30, 40, 30] }
 */
export const executeMatching = async (
  request: ExecuteMatchRequest,
): Promise<ExecuteMatchResponse> => {
  const token = getToken();

  const enabledRules = request.rules.filter((r) => r.enabled);
  const rulesStr = enabledRules.map((r) => r.name).join(",");
  const totalWeight = enabledRules.reduce((s, r) => s + r.weight, 0);
  const weights = enabledRules.map((r) =>
    totalWeight > 0 ? Math.round((r.weight / totalWeight) * 100) : Math.round(100 / enabledRules.length)
  );

  const response = await fetch(`/api/match/${request.activityId}/execute`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rules: rulesStr, weights }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "执行匹配失败");
  }

  return {
    groups: data.groups || [],
    totalParticipants: data.total_participants || 0,
    groupedParticipants: data.grouped_participants || 0,
    averageScore: data.average_score || 0,
  };
};

/**
 * 获取匹配结果
 */
export const getMatchGroups = async (
  activityId: string,
): Promise<MatchGroup[]> => {
  const token = getToken();

  const response = await fetch(`/api/match/${activityId}/results`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取匹配结果失败");
  }

  const rawGroups = data.data?.groups || data.groups || [];

  // 转换后端数据格式到前端期望格式
  return rawGroups.map((g: any, index: number) => ({
    id: g.group_id || g.id || `group_${index}`,
    name: g.group_name || g.name || `第${index + 1}组`,
    members: Array.isArray(g.members)
      ? g.members.map((m: any) =>
          typeof m === "string" ? m : m.user_id || m.id,
        )
      : [],
    score: Math.round(
      (g.similarity_score ?? g.score ?? 0) *
        (g.similarity_score !== undefined && g.similarity_score <= 1 ? 100 : 1),
    ),
    reasons: g.match_reasons || g.reasons || [],
    warnings: g.warnings || [],
    isLocked: g.is_locked ?? g.isLocked ?? false,
  }));
};

/**
 * 锁定/解锁匹配组
 */
export const toggleGroupLock = async (
  groupId: string,
  isLocked: boolean,
): Promise<void> => {
  const token = getToken();

  const response = await fetch(`/api/match/groups/${groupId}/lock`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_locked: isLocked }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "操作失败");
  }
};

/**
 * 获取活动参与者列表 (从报名数据)
 */
export const getParticipants = async (activityId: string): Promise<any[]> => {
  const token = getToken();

  const response = await fetch(`/api/match/${activityId}/participants`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取参与者列表失败");
  }

  return data.data?.participants || [];
};

/**
 * 获取匹配历史记录
 */
export const getMatchingHistory = async (
  activityId: string,
): Promise<any[]> => {
  const token = getToken();

  const response = await fetch(`/api/match/${activityId}/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取历史记录失败");
  }

  return data.data?.history || [];
};

/**
 * 发布匹配结果
 */
export const publishMatchingResult = async (
  activityId: string,
  historyId: string,
): Promise<void> => {
  const token = getToken();

  const response = await fetch(`/api/match/${activityId}/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ historyId }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "发布失败");
  }
};

/**
 * 提交匹配任务（调用 execute 接口，后端异步执行）
 * 返回 activityId 作为 taskId，用于后续轮询进度
 */
export const submitMatchingTask = async (
  activityId: string,
  rules: MatchingRule[],
): Promise<{ taskId: string }> => {
  await executeMatching({ activityId, rules });
  // 后端立即返回 success，异步执行匹配；用 activityId 作为轮询 key
  return { taskId: activityId };
};

/**
 * 查询匹配任务状态（轮询 /api/match/:eventId/progress）
 */
export const getMatchingTaskStatus = async (
  eventId: string,
): Promise<{
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
}> => {
  const token = getToken();

  const response = await fetch(`/api/match/${eventId}/progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取匹配进度失败");
  }

  // 后端返回 status 字段，映射到前端期望的格式
  const statusMap: Record<string, "pending" | "processing" | "completed" | "failed"> = {
    pending: "pending",
    matching_extract: "processing",
    matching_embed: "processing",
    matching_cal_similarity: "processing",
    matching_totalScore: "processing",
    matching_calBestMatch: "processing",
    completed: "completed",
    failed: "failed",
  };

  const progressMap: Record<string, number> = {
    pending: 5,
    matching_extract: 20,
    matching_embed: 40,
    matching_cal_similarity: 60,
    matching_totalScore: 75,
    matching_calBestMatch: 90,
    completed: 100,
    failed: 0,
  };

  const backendStatus = data.status || "pending";
  return {
    status: statusMap[backendStatus] ?? "processing",
    progress: progressMap[backendStatus] ?? 50,
    message: data.message,
  };
};
