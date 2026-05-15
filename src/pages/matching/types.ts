/**
 * 匹配功能相关类型定义
 */

export type MatchOperator =
  | "similarity"
  | "complement"
  | "exact"
  | "distance_decay";

export interface RegistrationSchemaField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "multi-select" | "radio";
  required: boolean;
  preset: boolean;
  deletable?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface MatchingRule {
  id?: string; // 新增规则时可选
  name: string;
  description?: string;
  type?: "similarity" | "diversity" | "constraint" | "preference" | "custom";
  field?: string;
  source_field?: string;
  target_field?: string;
  operator?: MatchOperator;
  weight: number;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface MatchConstraints {
  minGroupSize?: number;
  maxGroupSize?: number;
  genderRatioMin?: number; // 0-100 百分比
  genderRatioMax?: number; // 0-100 百分比
  sameIndustryMax?: number;
}

export interface Participant {
  id: string;
  user_id?: string; // 兼容旧数据
  name: string;
  gender?: string;
  age?: number;
  phone?: string;
  email?: string;
  occupation?: string;
  company?: string;
  industry?: string;
  city?: string;
  tags?: string[];
  interests?: string[]; // 兴趣爱好
  skills?: string[]; // 技能
  bio?: string;
  avatar?: string;
  keywords?: string[];
  profile?: Record<string, unknown>;
  customFields?: Record<string, unknown>; // 自定义字段
}

export interface MatchingGroup {
  id: string;
  group_id?: string; // 兼容旧数据
  name: string;
  members: Participant[];
  score: number;
  similarity_score?: number; // 兼容旧数据
  reasons: string[];
  match_reasons?: string[]; // 兼容旧数据
  isLocked: boolean;
  is_locked?: boolean; // 兼容旧数据
}

export type MatchingStage =
  | "idle"
  | "extracting-keywords"
  | "calculating-embedding"
  | "calculating-similarity"
  | "matching"
  | "done";

export type TabKey = "rules" | "console" | "results";

// API 响应类型
export interface GenerateRulesResponse {
  success: boolean;
  message: string;
  data?: {
    rules: MatchingRule[];
    suggestedConstraints: {
      minGroupSize: number;
      maxGroupSize: number;
      genderRatioMin: number;
      genderRatioMax: number;
      sameIndustryMax: number;
    };
  };
  code?: string;
}

export interface SaveRulesResponse {
  success: boolean;
  message: string;
  data?: {
    created: number;
    updated: number;
    deleted: number;
  };
  code?: string;
}

export interface GetRulesResponse {
  success: boolean;
  message: string;
  data?: {
    rules: MatchingRule[];
    totalWeight: number;
    enabledCount: number;
    updatedAt: string;
  };
  code?: string;
}
