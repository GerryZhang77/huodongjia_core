/**
 * Matching Module - API Service
 * 匹配模块 - API 服务
 */

import type {
  MatchRule,
  MatchGroup,
  GenerateRulesRequest,
  GenerateRulesResponse,
  ExecuteMatchRequest,
  ExecuteMatchResponse,
} from "../types";

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
  activityId: string
): Promise<MatchRule[]> => {
  const token = getToken();

  const response = await fetch(`/api/match-rules/${activityId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取匹配规则失败");
  }

  return data.rules || [];
};

/**
 * 添加匹配规则
 */
export const createMatchRule = async (
  rule: Omit<MatchRule, "id" | "createdAt">
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
  updates: Partial<MatchRule>
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
  request: GenerateRulesRequest
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
    }
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
  request: ExecuteMatchRequest
): Promise<ExecuteMatchResponse> => {
  const token = getToken();

  const response = await fetch(`/api/execute-matching/${request.activityId}`, {
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
  activityId: string
): Promise<MatchGroup[]> => {
  const token = getToken();

  const response = await fetch(`/api/match-groups/${activityId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "获取匹配结果失败");
  }

  return data.groups || [];
};

/**
 * 锁定/解锁匹配组
 */
export const toggleGroupLock = async (
  groupId: string,
  isLocked: boolean
): Promise<void> => {
  const token = getToken();

  const response = await fetch(`/api/match-groups/${groupId}/lock`, {
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
