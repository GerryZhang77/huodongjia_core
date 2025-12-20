/**
 * 规则设置模块 API 服务
 * Phase 2 & 3: 匹配规则配置 + 匹配执行
 */

import { api } from "@/lib/api";
import type {
  GenerateRulesRequest,
  GenerateRulesResponse,
  GetRulesResponse,
  SaveRulesRequest,
  SaveRulesResponse,
  GetConstraintsResponse,
  SaveConstraintsRequest,
  SaveConstraintsResponse,
  ExecuteMatchingRequest,
  ExecuteMatchingResponse,
  GetTaskStatusResponse,
  MatchingRule,
  MatchConstraints,
} from "../types/rules.types";

/**
 * 规则设置 API 服务
 */
export const rulesApi = {
  /**
   * AI 生成匹配规则
   * @param activityId - 活动 ID
   * @param request - 生成规则请求
   */
  async generateRules(
    activityId: string,
    request: GenerateRulesRequest
  ): Promise<GenerateRulesResponse> {
    // 注意: api 响应拦截器已返回 response.data (即完整响应体 { success, message, data })
    return api.post<GenerateRulesResponse>(
      `/api/match-rules/${activityId}/generate`,
      request
    );
  },

  /**
   * 获取活动的规则列表
   * @param activityId - 活动 ID
   */
  async getRules(activityId: string): Promise<GetRulesResponse> {
    return api.get<GetRulesResponse>(`/api/match-rules/${activityId}`);
  },

  /**
   * 批量保存规则配置（创建/更新/删除）
   * @param activityId - 活动 ID
   * @param request - 保存规则请求
   *
   * @remarks
   * 批量操作规则：
   * - 创建: 规则没有 id 字段
   * - 更新: 规则有 id 字段且存在于后端
   * - 删除: 原有规则不在新数组中
   */
  async saveRules(
    activityId: string,
    request: SaveRulesRequest
  ): Promise<SaveRulesResponse> {
    return api.post<SaveRulesResponse>(
      `/api/match-rules/${activityId}`,
      request
    );
  },

  /**
   * 快捷方法：仅传入规则数组
   * @param activityId - 活动 ID
   * @param rules - 规则数组
   */
  async saveRulesArray(
    activityId: string,
    rules: MatchingRule[]
  ): Promise<SaveRulesResponse> {
    return this.saveRules(activityId, { rules });
  },

  /**
   * 获取匹配约束条件
   * @param activityId - 活动 ID
   */
  async getConstraints(activityId: string): Promise<GetConstraintsResponse> {
    return api.get<GetConstraintsResponse>(
      `/api/match-rules/${activityId}/constraints`
    );
  },

  /**
   * 保存匹配约束条件
   * @param activityId - 活动 ID
   * @param request - 保存约束条件请求
   */
  async saveConstraints(
    activityId: string,
    request: SaveConstraintsRequest
  ): Promise<SaveConstraintsResponse> {
    return api.post<SaveConstraintsResponse>(
      `/api/match-rules/${activityId}/constraints`,
      request
    );
  },

  /**
   * 快捷方法：仅传入约束条件对象
   * @param activityId - 活动 ID
   * @param constraints - 约束条件
   */
  async saveConstraintsObject(
    activityId: string,
    constraints: MatchConstraints
  ): Promise<SaveConstraintsResponse> {
    return this.saveConstraints(activityId, { constraints });
  },

  /**
   * 执行匹配算法（异步任务）
   * @param activityId - 活动 ID
   * @param request - 执行匹配请求
   */
  async executeMatching(
    activityId: string,
    request?: ExecuteMatchingRequest
  ): Promise<ExecuteMatchingResponse> {
    return api.post<ExecuteMatchingResponse>(
      `/api/match-rules/${activityId}/execute`,
      request || {}
    );
  },

  /**
   * 快捷方法：执行匹配（默认不保留锁定分组）
   * @param activityId - 活动 ID
   */
  async executeMatchingDefault(
    activityId: string
  ): Promise<ExecuteMatchingResponse> {
    return this.executeMatching(activityId);
  },

  /**
   * 快捷方法：执行匹配（保留锁定分组）
   * @param activityId - 活动 ID
   */
  async executeMatchingPreserveLocked(
    activityId: string
  ): Promise<ExecuteMatchingResponse> {
    return this.executeMatching(activityId, { preserveLockedGroups: true });
  },

  /**
   * 查询匹配任务进度
   * @param taskId - 任务 ID
   */
  async getTaskStatus(taskId: string): Promise<GetTaskStatusResponse> {
    return api.get<GetTaskStatusResponse>(`/api/match-rules/task/${taskId}`);
  },
};

// 导出类型供外部使用
export type RulesApiService = typeof rulesApi;
