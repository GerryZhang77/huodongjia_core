/**
 * Matching Module - Type Definitions
 * 匹配模块 - 类型定义
 *
 * 重新导出 types.ts (重构版) 的类型，并提供兼容别名
 */

// 从 matchResult 导出特定类型（避免与本文件同名类型冲突）
export type {
  MatchResultData,
  MatchStatistics,
  UngroupedMember,
} from "./matchResult";

// 从重构版 types.ts 重新导出所有类型
export {
  type MatchOperator,
  type MatchRuleInvalidReason,
  type MatchRuleFieldStatus,
  type MatchingSchemaField,
  type RuleType,
  type MatchingRule,
  type MatchConstraints,
  type Participant,
  type MatchingGroup,
  type MatchingResult,
  type MatchingStage,
  type TabKey,
  type MatchingState,
} from "../types";

// === 兼容别名 ===
// 为旧代码提供别名，逐步迁移后可删除

import type { RuleType, MatchingRule, MatchingGroup } from "../types";

/**
 * @deprecated 请使用 RuleType
 */
export type MatchRuleType =
  | RuleType
  | "age"
  | "gender"
  | "interests"
  | "location"
  | "skill";

/**
 * @deprecated 请使用 MatchingRule
 */
export type MatchRule = MatchingRule & {
  activityId?: string;
  priority?: "high" | "medium" | "low";
  conditions?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * @deprecated 请使用 MatchingGroup
 */
export type MatchGroup = MatchingGroup & {
  activityId?: string;
  matchScore?: number;
  matchReasons?: string[];
  createdAt?: string;
  updatedAt?: string;
};

/**
 * 规则优先级
 * @deprecated 使用 weight (0-100) 代替
 */
export type RulePriority = "high" | "medium" | "low";

/**
 * 匹配组成员 (已废弃，members 现在是 string[] ID 列表)
 * @deprecated 使用 Participant 和 members: string[] 代替
 */
export interface GroupMember {
  id: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  age?: number;
  gender?: string;
  interests?: string[];
  keywords?: string[];
  profile?: Record<string, unknown>;
}

/**
 * 生成规则请求
 */
export interface GenerateRulesRequest {
  activityId: string;
  description: string;
}

/**
 * 生成规则响应
 */
export interface GenerateRulesResponse {
  rules: MatchingRule[];
}

/**
 * 执行匹配请求
 */
export interface ExecuteMatchRequest {
  activityId: string;
  rules: MatchingRule[];
}

/**
 * 执行匹配响应
 */
export interface ExecuteMatchResponse {
  groups: MatchingGroup[];
  totalParticipants: number;
  groupedParticipants: number;
  averageScore: number;
}

/**
 * 匹配可视化数据(气泡图)
 */
export interface BubbleData {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
  connections: string[];
}

/**
 * 匹配历史记录
 */
export interface MatchingHistory {
  id: string;
  activityId: string;
  /** 匹配执行时间 */
  executedAt: string;
  /** 使用的规则配置 */
  rules: MatchingRule[];
  /** 匹配结果分组 */
  groups: MatchingGroup[];
  /** 统计信息 */
  statistics: {
    totalParticipants: number;
    totalGroups: number;
    avgScore: number;
    minScore: number;
    maxScore: number;
  };
  /** 是否已发布 */
  isPublished: boolean;
  /** 创建人 */
  createdBy?: string;
  /** 备注 */
  note?: string;
}

/**
 * 匹配任务状态
 */
export type MatchingTaskStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

/**
 * 匹配任务
 */
export interface MatchingTask {
  id: string;
  activityId: string;
  status: MatchingTaskStatus;
  progress: number; // 0-100
  message?: string;
  /** 开始时间 */
  startedAt: string;
  /** 完成时间 */
  completedAt?: string;
  /** 匹配结果 ID (完成后) */
  resultId?: string;
}
