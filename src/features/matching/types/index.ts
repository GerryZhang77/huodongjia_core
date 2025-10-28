/**
 * Matching Module - Type Definitions
 * 匹配模块 - 类型定义
 */

// 导出匹配结果相关类型
export * from "./matchResult";

/**
 * 匹配规则类型
 */
export type MatchRuleType =
  | "age"
  | "gender"
  | "interests"
  | "location"
  | "skill"
  | "custom";

/**
 * 规则优先级
 */
export type RulePriority = "high" | "medium" | "low";

/**
 * 匹配规则
 */
export interface MatchRule {
  id: string;
  activityId: string;
  name: string;
  description: string;
  type: MatchRuleType;
  priority: RulePriority;
  weight: number;
  enabled: boolean;
  conditions?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 匹配组成员
 */
export interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  age?: number;
  gender?: string;
  interests?: string[];
  keywords?: string[];
  profile?: Record<string, unknown>;
}

/**
 * 匹配组
 */
export interface MatchGroup {
  id: string;
  activityId: string;
  name: string;
  members: GroupMember[];
  matchScore: number;
  matchReasons: string[];
  isLocked: boolean;
  createdAt: string;
  updatedAt?: string;
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
  rules: MatchRule[];
}

/**
 * 执行匹配请求
 */
export interface ExecuteMatchRequest {
  activityId: string;
  rules: MatchRule[];
}

/**
 * 执行匹配响应
 */
export interface ExecuteMatchResponse {
  groups: MatchGroup[];
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
 * Matching Store 状态
 */
export interface MatchingState {
  rules: MatchRule[];
  groups: MatchGroup[];
  bubbleData: BubbleData[];
  loading: boolean;
  matchingProgress: number;
  setRules: (rules: MatchRule[]) => void;
  addRule: (rule: MatchRule) => void;
  updateRule: (ruleId: string, updates: Partial<MatchRule>) => void;
  removeRule: (ruleId: string) => void;
  setGroups: (groups: MatchGroup[]) => void;
  addGroup: (group: MatchGroup) => void;
  updateGroup: (groupId: string, updates: Partial<MatchGroup>) => void;
  setBubbleData: (data: BubbleData[]) => void;
  setLoading: (loading: boolean) => void;
  setMatchingProgress: (progress: number) => void;
  clearMatching: () => void;
}
