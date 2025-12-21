/**
 * TanStack Query 客户端配置
 * 提供全局的 Query 配置和 QueryClient 实例
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * 创建 QueryClient 实例
 * 配置默认的查询和变更选项
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据保持新鲜的时间（5分钟）
      staleTime: 5 * 60 * 1000,
      // 缓存时间（10分钟）
      gcTime: 10 * 60 * 1000,
      // 失败后重试次数
      retry: 1,
      // 失败后重试延迟
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 窗口聚焦时自动重新获取
      refetchOnWindowFocus: false,
      // 网络重连时自动重新获取
      refetchOnReconnect: true,
    },
    mutations: {
      // 变更失败后重试次数
      retry: 0,
    },
  },
});
