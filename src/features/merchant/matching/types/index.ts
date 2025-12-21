/**
 * B端智能匹配 - 类型定义
 */

/**
 * 匹配规则类型
 */
export type MatchRuleType =
  | "similarity" // 相似度匹配
  | "diversity" // 多样性匹配
  | "constraint" // 约束条件
  | "preference"; // 偏好设置

/**
 * 匹配规则
 */
export interface MatchRule {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100
  type: MatchRuleType;
  field?: string;
  config?: Record<string, unknown>;
}

/**
 * 匹配约束条件
 */
export interface MatchConstraints {
  minGroupSize: number;
  maxGroupSize: number;
  genderRatio?: { min: number; max: number };
  sameIndustryMax?: number;
  blacklist?: string[][];
  whitelist?: string[][];
}

/**
 * 匹配分组
 */
export interface MatchGroup {
  id: string;
  groupIndex: number;
  members: string[]; // enrollment IDs
  score: number;
  reasons: string[];
  isLocked: boolean;
  warnings: string[];
}

/**
 * 匹配结果
 */
export interface MatchResult {
  id: string;
  activityId: string;
  groups: MatchGroup[];
  algorithm: string;
  rules: MatchRule[];
  constraints: MatchConstraints;
  executedAt: string;
  stats: {
    avgScore: number;
    minScore: number;
    maxScore: number;
    totalGroups: number;
  };
  isPublished: boolean;
}

/**
 * 执行匹配请求
 */
export interface ExecuteMatchRequest {
  rules: MatchRule[];
  constraints: MatchConstraints;
}
