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
  return localStorage.getItem("token");
};

/**
 * 获取活动的匹配规则列表
 */
export const getMatchRules = async (
  activityId: string,
): Promise<MatchRule[]> => {
  const token = getToken();

  const response = await fetch(`/api/matching/${activityId}/rules`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取匹配规则失败");
  }

  return data.data?.rules || data.rules || [];
};

/**
 * 添加匹配规则
 */
export const createMatchRule = async (
  rule: Omit<MatchRule, "id" | "createdAt">,
): Promise<MatchRule> => {
  const token = getToken();

  const response = await fetch("/api/match-rules", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rule),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "创建匹配规则失败");
  }

  return data.rule;
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
 */
export const executeMatching = async (
  request: ExecuteMatchRequest,
): Promise<ExecuteMatchResponse> => {
  const token = getToken();

  const response = await fetch(`/api/matching/${request.activityId}/execute`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rules: request.rules,
    }),
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

  const response = await fetch(`/api/matching/${activityId}/results`, {
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

  const response = await fetch(`/api/matching/groups/${groupId}/lock`, {
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

  const response = await fetch(`/api/matching/${activityId}/participants`, {
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

  const response = await fetch(`/api/matching/${activityId}/history`, {
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

  const response = await fetch(`/api/matching/${activityId}/publish`, {
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
 * 提交异步匹配任务
 */
export const submitMatchingTask = async (
  activityId: string,
  rules: MatchingRule[],
): Promise<{ taskId: string }> => {
  const token = getToken();

  const response = await fetch(`/api/matching/${activityId}/task`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rules }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "提交任务失败");
  }

  return { taskId: data.data?.taskId };
};

/**
 * 查询匹配任务状态
 */
export const getMatchingTaskStatus = async (
  taskId: string,
): Promise<{
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
  resultId?: string;
}> => {
  const token = getToken();

  const response = await fetch(`/api/matching/task/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取任务状态失败");
  }

  return data.data;
};
