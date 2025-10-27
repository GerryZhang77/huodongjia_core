import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ========================================
// 测试工具函数
// ========================================

/**
 * 创建测试用 QueryClient
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // 测试环境禁用重试
        gcTime: 0, // 禁用缓存
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * 自定义 render 函数（包含所有 Provider）
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const queryClient = createTestQueryClient();

  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: AllProviders, ...options }),
    queryClient,
  };
}

// ========================================
// 重新导出所有 testing-library 工具
// ========================================
export * from "@testing-library/react";
export { renderWithProviders as render };
