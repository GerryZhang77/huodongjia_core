/**
 * Matching Module - API Service
 * 匹配模块 - API 服务
 */

import { api } from "@/services/api";
import type {
  MatchingRule,
  ParticipantMatchResult,
  Participant,
  GenerateRulesRequest,
  GenerateRulesResponse,
  ExecuteMatchRequest,
  ExecuteMatchResponse,
} from "../types";

// 兼容别名
type MatchRule = MatchingRule;

const DEFAULT_OPERATOR = "similarity" as const;

const buildRuleName = (rule: Partial<MatchRule>, fallbackIndex?: number) => {
  if (rule.name) return rule.name;
  if (rule.source_field && rule.target_field && rule.operator) {
    return `${rule.source_field} ${rule.operator} ${rule.target_field}`;
  }
  return `规则 ${typeof fallbackIndex === "number" ? fallbackIndex + 1 : ""}`.trim();
};

const normalizeRule = (
  rule: Partial<MatchRule>,
  fallbackIndex?: number,
): MatchRule => ({
  id: rule.id || `rule-${fallbackIndex ?? Date.now()}`,
  name: buildRuleName(rule, fallbackIndex),
  source_field: rule.source_field || rule.field || "",
  target_field: rule.target_field || rule.field || "",
  operator: rule.operator || (rule.type as MatchRule["operator"]) || DEFAULT_OPERATOR,
  type: rule.type || rule.operator || DEFAULT_OPERATOR,
  field: rule.field,
  weight: typeof rule.weight === "number" ? rule.weight : 1,
  enabled: rule.enabled ?? true,
  description: rule.description,
  config: rule.config,
});

const serializeRulesForBackend = (rules: MatchRule[]) =>
  rules
    .filter(
      (rule) =>
        rule.enabled &&
        rule.source_field &&
        rule.target_field &&
        rule.operator &&
        typeof rule.weight === "number",
    )
    .map((rule) => ({
      source_field: rule.source_field,
      target_field: rule.target_field,
      operator: rule.operator,
      weight: rule.weight,
    }));

const mapSchemaFieldsToRules = (
  fields: Array<{ key?: string; label?: string }>,
): MatchRule[] =>
  fields.map((field, index) =>
    normalizeRule(
      {
        id: `rule-${index}`,
        name: field.label || field.key || `规则 ${index + 1}`,
        source_field: field.key || "",
        target_field: field.key || "",
        operator: DEFAULT_OPERATOR,
        weight: 1,
        enabled: true,
      },
      index,
    ),
  );

interface EnrollmentParticipant {
  id?: string;
  userId?: string;
  name?: string;
  status?: string;
  industry?: string;
  interests?: string | string[];
  department?: string;
  skills?: string;
  expertise?: string;
  formData?: Record<string, unknown>;
}

type MatchingParticipant = Participant & {
  enrollmentId?: string;
  company?: string;
  department?: string;
  skills?: string;
  expertise?: string;
  status?: string;
  formData?: Record<string, unknown>;
};

const asString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return undefined;
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const asGender = (
  value: unknown,
): MatchingParticipant["gender"] | undefined => {
  return value === "male" || value === "female" || value === "other"
    ? value
    : undefined;
};

const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => asString(item))
      .filter((item): item is string => Boolean(item));
  }
  const single = asString(value);
  return single ? [single] : [];
};

const mapEnrollmentToParticipant = (
  e: EnrollmentParticipant,
): MatchingParticipant => {
  const f = e.formData || {};
  return {
    id: e.userId,
    enrollmentId: e.id,
    name: asString(e.name) || asString(f["姓名"]) || asString(f.name) || "未知用户",
    phone: asString(f["手机号"]) || asString(f.phone),
    gender: asGender(f["性别"]) || asGender(f.gender),
    age: asNumber(f["年龄"]) ?? asNumber(f.age),
    occupation: asString(f["职业"]) || asString(f.occupation),
    company: asString(f["公司"]) || asString(f.company),
    industry:
      asString(e.industry) ||
      asString(f["行业"]) ||
      asString(f["关注/从事的行业方向"]),
    city: asString(f["城市"]) || asString(f.city),
    bio: asString(f["个人简介"]) || asString(f.bio),
    interests: asStringArray(e.interests).length
      ? asStringArray(e.interests)
      : asStringArray(f["兴趣爱好"]),
    department: asString(e.department) || asString(f["所在职能部门"]),
    skills: asString(e.skills) || asString(f["软件技能"]),
    expertise: asString(e.expertise) || asString(f["擅长领域"]),
    tags: asStringArray(f["标签"]),
    status: e.status,
    formData: f,
  };
};

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

  // 后端返回 { success: true, rules: { rules: MatchingRule[] } }
  const rawRules = data.rules?.rules ?? data.rules ?? [];

  if (!Array.isArray(rawRules) || rawRules.length === 0) return [];

  if (typeof rawRules[0] === "string") {
    return (rawRules as string[]).map((name, i) =>
      normalizeRule(
        {
          name,
          source_field: name,
          target_field: name,
          operator: DEFAULT_OPERATOR,
          weight: 1,
          enabled: true,
        },
        i,
      ),
    );
  }

  return (rawRules as Partial<MatchRule>[]).map((rule, index) =>
    normalizeRule(rule, index),
  );
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
  const payloadRules = serializeRulesForBackend(rules);

  const response = await fetch(`/api/match/${activityId}/rules`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rules: payloadRules }),
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
 * 从活动 schema 派生默认规则
 * 保留兼容导出，但不再调用旧的 /generate 接口
 */
export const generateMatchRules = async (
  request: GenerateRulesRequest,
): Promise<GenerateRulesResponse> => {
  const token = getToken();

  const response = await fetch(`/api/events/organizer/${request.activityId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "获取报名表字段失败");
  }

  const schema =
    data.event?.registrationFormSchema ||
    data.event?.registration_form_schema ||
    [];

  return {
    rules: mapSchemaFieldsToRules(schema),
  };
};

/**
 * 执行智能匹配
 * 后端期望: { rules: [{ source_field, target_field, operator, weight }] }
 */
export const executeMatching = async (
  request: ExecuteMatchRequest,
): Promise<ExecuteMatchResponse> => {
  const token = getToken();
  const payloadRules = serializeRulesForBackend(request.rules);

  const response = await fetch(`/api/match/${request.activityId}/execute`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rules: payloadRules }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
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
 * 获取匹配结果（商家视图）
 *
 * 后端返回：
 *   { success, message, groups: [{ id, event_id, user_id, match_id, best_match_users: [uuid×5], created_at }],
 *     stats?: { totalParticipants, averageScore, minScore, maxScore, topK } }
 * 每条 group 记录代表"某个参与者的 top5 匹配"。同时并行拉取 /api/enrollments/:eventId
 * 获取所有参与者的详情用于渲染。stats 为可选字段，老版本后端可能不返回。
 */
export interface MatchStatsResponse {
  /** 参与者（= 收到推荐的独立用户）数量 */
  totalParticipants: number;
  /** 平均匹配分（0-1 的 cosine 相似度） */
  averageScore: number;
  minScore: number;
  maxScore: number;
  /** 每人推荐候选数（通常为 5） */
  topK: number;
}

export const getMatchGroups = async (
  activityId: string,
): Promise<{
  results: ParticipantMatchResult[];
  participants: any[];
  stats: MatchStatsResponse | null;
}> => {
  const token = getToken();

  const [resultsResp, enrollResp] = await Promise.all([
    fetch(`/api/match/${activityId}/results`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
    fetch(`/api/enrollments/${activityId}?page=1&pageSize=1000`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
  ]);

  const data = await resultsResp.json();
  if (!data.success) {
    throw new Error(data.message || "获取匹配结果失败");
  }

  // 后端新 shape：data.groups 是 per-user top5 数组
  const rawRecords: any[] = data.groups || data.data?.groups || [];

  const results: ParticipantMatchResult[] = rawRecords.map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    matchId: r.match_id,
    bestMatchUserIds: Array.isArray(r.best_match_users) ? r.best_match_users : [],
    createdAt: r.created_at,
  }));

  // 并行拉参与者详情
  let participants: any[] = [];
  if (enrollResp.ok) {
    const enrollData = await enrollResp.json();
    const enrollments: any[] = enrollData?.data?.enrollments || [];
    participants = enrollments.map(mapEnrollmentToParticipant);
  }

  // 解析后端返回的 stats（可选字段，老版本后端不返回时为 null）
  let stats: MatchStatsResponse | null = null;
  const rawStats = data.stats || data.data?.stats;
  if (rawStats && typeof rawStats === "object") {
    const avg = Number(rawStats.averageScore ?? rawStats.average_score);
    const min = Number(rawStats.minScore ?? rawStats.min_score);
    const max = Number(rawStats.maxScore ?? rawStats.max_score);
    const total = Number(
      rawStats.totalParticipants ?? rawStats.total_participants,
    );
    const topK = Number(rawStats.topK ?? rawStats.top_k);
    // 至少有一项分数有效才认为 stats 可用
    if (Number.isFinite(avg) || Number.isFinite(min) || Number.isFinite(max)) {
      stats = {
        totalParticipants: Number.isFinite(total) ? total : results.length,
        averageScore: Number.isFinite(avg) ? avg : 0,
        minScore: Number.isFinite(min) ? min : 0,
        maxScore: Number.isFinite(max) ? max : 0,
        topK: Number.isFinite(topK) && topK > 0 ? topK : 5,
      };
    }
  }

  return { results, participants, stats };
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
export const getParticipants = async (
  activityId: string,
): Promise<MatchingParticipant[]> => {
  const data = await api.get(`/api/enrollments/${activityId}`, {
    params: { page: 1, pageSize: 1000 },
  });

  if (!data.success) {
    throw new Error(data.message || "获取参与者列表失败");
  }

  const enrollments = (data.data?.enrollments || []) as EnrollmentParticipant[];
  return enrollments.map(mapEnrollmentToParticipant);
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
