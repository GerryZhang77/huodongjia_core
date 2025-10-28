/**
 * 规则设置模块类型定义
 * Phase 2 & 3: 匹配规则配置 + 匹配执行
 */

// ========================================
// 规则类型枚举
// ========================================

/**
 * 规则类型
 * - similarity: 相似度匹配（如兴趣、年龄相近）
 * - diversity: 多样性匹配（如职业背景互补）
 * - constraint: 约束条件（如性别比例）
 * - preference: 偏好设置（如地域偏好）
 */
export type RuleType = "similarity" | "diversity" | "constraint" | "preference";

/**
 * 任务状态
 */
export type TaskStatus = "pending" | "running" | "completed" | "failed";

// ========================================
// 规则相关接口
// ========================================

/**
 * 匹配规则配置
 */
export interface MatchingRule {
  /** 规则唯一标识（创建时可不传，由后端生成） */
  id?: string;

  /** 规则名称 */
  name: string;

  /** 规则描述 */
  description?: string;

  /** 规则类型 */
  type: RuleType;

  /** 匹配字段（如: tags, age, occupation） */
  field?: string;

  /** 权重 (0-100) */
  weight: number;

  /** 是否启用 */
  enabled: boolean;

  /** 规则配置参数 */
  config?: {
    /** 匹配方法（如: jaccard, cosine, numeric_distance） */
    method?: string;
    /** 阈值 */
    threshold?: number;
    /** 惩罚系数 */
    penalty?: number;
  };
}

/**
 * 匹配约束条件
 */
export interface MatchConstraints {
  /** 最小组人数 */
  minGroupSize?: number;

  /** 最大组人数 */
  maxGroupSize?: number;

  /** 性别比例下限 (0-1) */
  genderRatioMin?: number;

  /** 性别比例上限 (0-1) */
  genderRatioMax?: number;

  /** 同行业最大人数 */
  sameIndustryMax?: number;

  /** 同年龄段最大人数 */
  sameAgeGroupMax?: number;
}

// ========================================
// API 请求/响应类型
// ========================================

/**
 * AI 生成规则 - 请求
 */
export interface GenerateRulesRequest {
  /** 自然语言描述匹配需求 */
  description: string;

  /** 参与者数量（可选，用于优化规则） */
  participantCount?: number;

  /** 期望每组人数（可选，默认4-6人） */
  expectedGroupSize?: number;
}

/**
 * AI 生成规则 - 响应
 */
export interface GenerateRulesResponse {
  success: boolean;
  message: string;
  data: {
    /** 生成的规则列表 */
    rules: MatchingRule[];
    /** 建议的约束条件 */
    suggestedConstraints: MatchConstraints;
  };
}

/**
 * 获取规则列表 - 响应
 */
export interface GetRulesResponse {
  success: boolean;
  message: string;
  data: {
    /** 规则列表 */
    rules: MatchingRule[];
    /** 总权重（应始终为100） */
    totalWeight: number;
    /** 启用规则数量 */
    enabledCount: number;
    /** 最后更新时间 */
    updatedAt: string;
  };
}

/**
 * 批量保存规则 - 请求
 */
export interface SaveRulesRequest {
  /** 完整的规则数组 */
  rules: MatchingRule[];
}

/**
 * 批量保存规则 - 响应
 */
export interface SaveRulesResponse {
  success: boolean;
  message: string;
  data: {
    /** 保存的规则数量 */
    savedCount: number;
    /** 保存后的完整规则列表（含服务端生成的 ID） */
    rules: MatchingRule[];
    /** 保存时间 */
    savedAt: string;
  };
}

/**
 * 获取约束条件 - 响应
 */
export interface GetConstraintsResponse {
  success: boolean;
  message: string;
  data: {
    /** 当前配置的约束条件 */
    constraints: MatchConstraints;
    /** 默认约束条件（供参考） */
    defaultConstraints: MatchConstraints;
    /** 最后更新时间 */
    updatedAt: string;
  };
}

/**
 * 保存约束条件 - 请求
 */
export interface SaveConstraintsRequest {
  /** 约束条件配置 */
  constraints: MatchConstraints;
}

/**
 * 保存约束条件 - 响应
 */
export interface SaveConstraintsResponse {
  success: boolean;
  message: string;
  data: {
    /** 保存后的约束条件 */
    constraints: MatchConstraints;
    /** 保存时间 */
    savedAt: string;
  };
}

/**
 * 执行匹配 - 请求
 */
export interface ExecuteMatchingRequest {
  /** 是否保留已锁定的分组 */
  preserveLockedGroups?: boolean;
}

/**
 * 执行匹配 - 响应
 */
export interface ExecuteMatchingResponse {
  success: boolean;
  message: string;
  data: {
    /** 任务 ID */
    taskId: string;
    /** 任务状态 */
    status: TaskStatus;
  };
}

/**
 * 查询任务进度 - 响应
 */
export interface GetTaskStatusResponse {
  success: boolean;
  message: string;
  data: {
    /** 任务 ID */
    taskId: string;
    /** 任务状态 */
    status: TaskStatus;
    /** 进度百分比 (0-100) */
    progress: number;
    /** 匹配结果 ID（completed 状态时返回） */
    resultId?: string;
    /** 错误信息（failed 状态时返回） */
    error?: string;
  };
}
