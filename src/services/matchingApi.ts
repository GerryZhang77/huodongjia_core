/**
 * Matching API - 智能匹配接口
 * 底层 API 调用，与后端接口 1:1 对应
 */

import { api } from "@/services/api";

// ============================================
// 类型定义
// ============================================

export type RuleType = "similarity" | "diversity" | "constraint" | "preference";

export interface MatchRule {
  id: string;
  name: string;
  description?: string;
  type: RuleType;
  weight: number; // 0-100
  config?: {
    field?: string;
    method?: "jaccard" | "cosine" | "custom";
    threshold?: number;
    penalty?: number;
  };
}

export interface MatchConstraint {
  minGroupSize: number;
  maxGroupSize: number;
  genderRatio?: { min: number; max: number };
  sameIndustryMax?: number;
  blacklist?: string[][];
  whitelist?: string[][];
}

export interface MatchGroup {
  id: string;
  members: string[];
  score: number;
  reasons?: string[];
  isLocked?: boolean;
  warnings?: string[];
}

export interface MatchResult {
  id: string;
  activityId: string;
  groups: MatchGroup[];
  algorithm?: string;
  rules?: MatchRule[];
  constraints?: MatchConstraint;
  executedAt?: string;
  stats?: {
    avgScore: number;
    minScore: number;
    maxScore: number;
    totalGroups: number;
  };
}

export interface ExecuteMatchRequest {
  rules: MatchRule[];
  constraints: MatchConstraint;
}

// ============================================
// API 函数
// ============================================

/**
 * 提取关键词
 * GET /api/matching/{activityId}/extract-keywords
 */
export async function extractKeywords(activityId: string): Promise<{
  success: boolean;
  keywords?: string[];
}> {
  return api.get(`/api/matching/${activityId}/extract-keywords`);
}

/**
 * 生成匹配规则 (NLP)
 * POST /api/matching/{activityId}/generate-rules
 */
export async function generateMatchRules(
  activityId: string,
  description: string
): Promise<{
  success: boolean;
  rules?: MatchRule[];
}> {
  return api.post(`/api/matching/${activityId}/generate-rules`, {
    description,
  });
}

/**
 * 保存匹配规则
 * POST /api/matching/{activityId}/rules
 */
export async function saveMatchRules(
  activityId: string,
  rules: MatchRule[]
): Promise<{ success: boolean }> {
  return api.post(`/api/matching/${activityId}/rules`, { rules });
}

/**
 * 获取已保存的匹配规则
 * GET /api/matching/{activityId}/rules
 */
export async function getMatchRules(activityId: string): Promise<{
  success: boolean;
  rules?: MatchRule[];
}> {
  return api.get(`/api/matching/${activityId}/rules`);
}

/**
 * 执行匹配
 * POST /api/matching/{activityId}/execute
 */
export async function executeMatching(
  activityId: string,
  request: ExecuteMatchRequest
): Promise<{
  success: boolean;
  result?: MatchResult;
}> {
  return api.post(`/api/matching/${activityId}/execute`, request);
}

/**
 * 获取匹配结果
 * GET /api/matching/{activityId}/result
 */
export async function getMatchResult(activityId: string): Promise<{
  success: boolean;
  result?: MatchResult;
}> {
  return api.get(`/api/matching/${activityId}/result`);
}

/**
 * 发布匹配结果
 * POST /api/matching/{activityId}/publish
 */
export async function publishMatchResult(activityId: string): Promise<{
  success: boolean;
}> {
  return api.post(`/api/matching/${activityId}/publish`);
}

/**
 * 更新分组
 * PUT /api/matching/{activityId}/groups/{groupId}
 */
export async function updateMatchGroup(
  activityId: string,
  groupId: string,
  data: Partial<MatchGroup>
): Promise<{ success: boolean }> {
  return api.put(`/api/matching/${activityId}/groups/${groupId}`, data);
}

/**
 * 锁定/解锁分组
 * POST /api/matching/{activityId}/groups/{groupId}/lock
 */
export async function toggleGroupLock(
  activityId: string,
  groupId: string,
  isLocked: boolean
): Promise<{ success: boolean }> {
  return api.post(`/api/matching/${activityId}/groups/${groupId}/lock`, {
    isLocked,
  });
}

/**
 * 获取词嵌入
 * POST /api/embedding/{activityId}/get-embedding
 */
export async function getEmbedding(
  activityId: string,
  texts: string[]
): Promise<{
  success: boolean;
  embeddings?: number[][];
}> {
  return api.post(`/api/embedding/${activityId}/get-embedding`, { texts });
}

/**
 * 计算相似度
 * POST /api/embedding/{activityId}/calculate-similarity
 */
export async function calculateSimilarity(
  activityId: string,
  embedding1: number[],
  embedding2: number[]
): Promise<{
  success: boolean;
  similarity?: number;
}> {
  return api.post(`/api/embedding/${activityId}/calculate-similarity`, {
    embedding1,
    embedding2,
  });
}
