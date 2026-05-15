/**
 * 匹配模块类型定义 (重构版)
 * 与后端 API 保持一致
 */

import type { RegistrationFormField } from "@/features/activities/types";

// 后端支持的匹配算子
export type MatchOperator =
  | "similarity"
  | "complement"
  | "exact"
  | "distance_decay";

// 兼容旧页面保留的规则类型别名
export type RuleType =
  | MatchOperator
  | "diversity"
  | "constraint"
  | "preference"
  | "custom";

// 匹配规则
export interface MatchingRule {
  id?: string;
  name: string;
  description?: string;
  type?: RuleType;
  field?: string;
  source_field?: string;
  target_field?: string;
  operator?: MatchOperator;
  weight: number;
  enabled: boolean;
  config?: {
    method?: "jaccard" | "cosine" | "custom";
    threshold?: number;
    penalty?: number;
  };
}

export type MatchingSchemaField = RegistrationFormField;

// 边界条件/约束
export interface MatchConstraints {
  minGroupSize?: number;
  maxGroupSize?: number;
  genderRatioMin?: number; // 性别比例最小值 (%)
  genderRatioMax?: number; // 性别比例最大值 (%)
  sameIndustryMax?: number; // 同行业最大人数
  blacklist?: string[][]; // 互斥名单
  whitelist?: string[][]; // 固定分组
}

// 参与者信息
export interface Participant {
  id: string;
  name: string;
  gender?: "male" | "female" | "other";
  age?: number;
  ageGroup?: string;
  occupation?: string;
  industry?: string;
  school?: string;
  city?: string;
  interests?: string[];
  tags?: string[];
  bio?: string;
  matchingNeeds?: string;
  email?: string;
  phone?: string;
  customFields?: Record<string, any>;
}

// 匹配分组（旧模型保留给历史数据/兼容）
export interface MatchingGroup {
  id: string;
  name?: string;
  members: string[]; // 参与者 ID 列表
  score: number; // 匹配得分 0-100
  reasons?: string[]; // 匹配理由
  warnings?: string[]; // 警告信息
  isLocked: boolean; // 是否锁定
}

/**
 * 参与者 top5 匹配结果
 * 当前后端模型：每个参与者对应一组 top5 候选用户（来自 best_matches 表）
 */
export interface ParticipantMatchResult {
  /** best_matches 记录主键 */
  id: string;
  /** 参与者本人 ID（即 user_id） */
  userId: string;
  /** 所属 match 任务 ID */
  matchId: string;
  /** top5 候选用户 ID（按相似度降序） */
  bestMatchUserIds: string[];
  /** 记录创建时间 */
  createdAt: string;
}

// 匹配结果
export interface MatchingResult {
  id: string;
  activityId: string;
  groups: MatchingGroup[];
  algorithm: string;
  rules: MatchingRule[];
  constraints: MatchConstraints;
  executedAt: string;
  executedBy?: string;
  stats: {
    avgScore: number;
    minScore: number;
    maxScore: number;
    totalGroups: number;
    totalParticipants: number;
  };
  isPublished: boolean;
  publishedAt?: string;
}

// 匹配阶段
export type MatchingStage =
  | "idle" // 空闲
  | "configuring" // 配置中
  | "matching" // 匹配中
  | "completed" // 完成
  | "published"; // 已发布

// Tab 类型
export type TabKey = "rules" | "results";

// 匹配状态 (用于 Hook)
export interface MatchingState {
  stage: MatchingStage;
  activeTab: TabKey;

  // 规则相关
  naturalLanguageInput: string;
  rules: MatchingRule[];
  constraints: MatchConstraints;

  // 数据
  participants: Participant[];
  groups: MatchingGroup[];

  // 进度
  isGenerating: boolean;
  isMatching: boolean;
  isPublishing: boolean;
  matchingProgress: number;

  // 统计
  matchingStats?: {
    avgScore: number;
    minScore: number;
    maxScore: number;
  };
}

// === 匹配历史记录类型 ===

/**
 * 匹配任务状态
 */
export type MatchingTaskStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

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

// === API 请求/响应类型 ===

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
