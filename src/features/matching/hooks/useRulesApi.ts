/**
 * 规则设置模块 React Hooks
 * 基于 TanStack Query 的数据管理
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rulesApi } from "../services/rulesApi";
import type {
  GenerateRulesRequest,
  SaveRulesRequest,
  SaveConstraintsRequest,
  ExecuteMatchingRequest,
  MatchingRule,
  MatchConstraints,
} from "../types/rules.types";

// ========================================
// Query Keys
// ========================================

export const rulesQueryKeys = {
  /** 所有规则相关查询 */
  all: ["match-rules"] as const,

  /** 规则列表查询 */
  rules: (activityId: string) => ["match-rules", activityId, "rules"] as const,

  /** 约束条件查询 */
  constraints: (activityId: string) =>
    ["match-rules", activityId, "constraints"] as const,

  /** 任务状态查询 */
  taskStatus: (taskId: string) => ["match-rules", "task", taskId] as const,
};

// ========================================
// Hooks - 规则管理
// ========================================

/**
 * 获取活动的规则列表
 * @param activityId - 活动 ID
 * @param options - Query 配置选项
 */
export function useRules(activityId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: rulesQueryKeys.rules(activityId),
    queryFn: () => rulesApi.getRules(activityId),
    enabled: options?.enabled !== false && !!activityId,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

/**
 * AI 生成匹配规则
 */
export function useGenerateRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      request,
    }: {
      activityId: string;
      request: GenerateRulesRequest;
    }) => rulesApi.generateRules(activityId, request),

    onSuccess: (data, variables) => {
      // 更新规则列表缓存（假设生成后自动保存）
      queryClient.invalidateQueries({
        queryKey: rulesQueryKeys.rules(variables.activityId),
      });
    },
  });
}

/**
 * 批量保存规则配置
 */
export function useSaveRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      request,
    }: {
      activityId: string;
      request: SaveRulesRequest;
    }) => rulesApi.saveRules(activityId, request),

    onSuccess: (data, variables) => {
      // 更新规则列表缓存
      queryClient.setQueryData(
        rulesQueryKeys.rules(variables.activityId),
        data
      );

      // 可选: 同时刷新其他相关数据
      queryClient.invalidateQueries({
        queryKey: rulesQueryKeys.rules(variables.activityId),
      });
    },
  });
}

/**
 * 快捷 Hook：直接传入规则数组保存
 */
export function useSaveRulesArray() {
  const saveMutation = useSaveRules();

  return {
    ...saveMutation,
    mutateAsync: async (activityId: string, rules: MatchingRule[]) => {
      return saveMutation.mutateAsync({ activityId, request: { rules } });
    },
    mutate: (activityId: string, rules: MatchingRule[]) => {
      return saveMutation.mutate({ activityId, request: { rules } });
    },
  };
}

// ========================================
// Hooks - 约束条件管理
// ========================================

/**
 * 获取匹配约束条件
 * @param activityId - 活动 ID
 * @param options - Query 配置选项
 */
export function useConstraints(
  activityId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: rulesQueryKeys.constraints(activityId),
    queryFn: () => rulesApi.getConstraints(activityId),
    enabled: options?.enabled !== false && !!activityId,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

/**
 * 保存匹配约束条件
 */
export function useSaveConstraints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      request,
    }: {
      activityId: string;
      request: SaveConstraintsRequest;
    }) => rulesApi.saveConstraints(activityId, request),

    onSuccess: (data, variables) => {
      // 更新约束条件缓存
      queryClient.setQueryData(
        rulesQueryKeys.constraints(variables.activityId),
        data
      );

      queryClient.invalidateQueries({
        queryKey: rulesQueryKeys.constraints(variables.activityId),
      });
    },
  });
}

/**
 * 快捷 Hook：直接传入约束条件对象保存
 */
export function useSaveConstraintsObject() {
  const saveMutation = useSaveConstraints();

  return {
    ...saveMutation,
    mutateAsync: async (activityId: string, constraints: MatchConstraints) => {
      return saveMutation.mutateAsync({
        activityId,
        request: { constraints },
      });
    },
    mutate: (activityId: string, constraints: MatchConstraints) => {
      return saveMutation.mutate({ activityId, request: { constraints } });
    },
  };
}

// ========================================
// Hooks - 匹配执行与任务管理
// ========================================

/**
 * 执行匹配算法（异步任务）
 */
export function useExecuteMatching() {
  return useMutation({
    mutationFn: ({
      activityId,
      request,
    }: {
      activityId: string;
      request?: ExecuteMatchingRequest;
    }) => rulesApi.executeMatching(activityId, request),

    onSuccess: (data) => {
      // 匹配开始后，可能需要刷新匹配结果列表
      // 这里不立即刷新，等任务完成后再刷新
      console.log(
        `[Rules Hook] Matching task started: ${data.data.taskId}, status: ${data.data.status}`
      );
    },
  });
}

/**
 * 查询匹配任务进度（带轮询）
 * @param taskId - 任务 ID
 * @param options - Query 配置选项
 */
export function useTaskStatus(
  taskId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
    onCompleted?: (resultId: string) => void;
    onFailed?: (error: string) => void;
  }
) {
  return useQuery({
    queryKey: rulesQueryKeys.taskStatus(taskId),
    queryFn: () => rulesApi.getTaskStatus(taskId),
    enabled: options?.enabled !== false && !!taskId,

    // 轮询配置: 默认每 2 秒轮询一次
    refetchInterval: (query) => {
      // 任务完成或失败时停止轮询
      const status = query.state.data?.data.status;
      if (status === "completed" || status === "failed") {
        // 调用回调
        if (status === "completed" && options?.onCompleted) {
          const resultId = query.state.data?.data.resultId;
          if (resultId) options.onCompleted(resultId);
        }
        if (status === "failed" && options?.onFailed) {
          const error = query.state.data?.data.error;
          if (error) options.onFailed(error);
        }
        return false; // 停止轮询
      }

      // 自定义轮询间隔，默认 2000ms
      return options?.refetchInterval ?? 2000;
    },

    // 持续轮询，即使在后台
    refetchIntervalInBackground: false,
    // 窗口聚焦时不自动刷新（避免中断轮询节奏）
    refetchOnWindowFocus: false,
  });
}

/**
 * 快捷 Hook：执行匹配并自动跟踪进度
 * @returns 执行函数和任务状态
 */
export function useMatchingWithProgress() {
  const executeMutation = useExecuteMatching();

  return {
    execute: executeMutation.mutateAsync,
    isExecuting: executeMutation.isPending,
    executionError: executeMutation.error,
  };
}
