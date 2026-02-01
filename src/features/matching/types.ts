/**
 * 匹配模块类型定义 (重构版)
 * 与后端 API 保持一致
 */

// 匹配规则类型
export type RuleType =
  | "similarity" // 相似度匹配
  | "diversity" // 多样性匹配
  | "constraint" // 约束条件
  | "preference" // 偏好设置
  | "custom"; // 自定义规则

// 匹配规则
export interface MatchingRule {
  id?: string;
  name: string;
  description?: string;
  type: RuleType;
  field?: string; // 匹配字段 (interests, school, industry 等)
  weight: number; // 权重 0-100
  enabled: boolean;
  config?: {
    method?: "jaccard" | "cosine" | "custom";
    threshold?: number;
    penalty?: number;
  };
}

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

// 匹配分组
export interface MatchingGroup {
  id: string;
  name?: string;
  members: string[]; // 参与者 ID 列表
  score: number; // 匹配得分 0-100
  reasons?: string[]; // 匹配理由
  warnings?: string[]; // 警告信息
  isLocked: boolean; // 是否锁定
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
