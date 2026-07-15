import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "./utils";

const apiMocks = vi.hoisted(() => ({
  getPublicActivityList: vi.fn(),
  getRecommendedActivities: vi.fn(),
}));

vi.mock("../src/features/user/activity/services/userActivityApi", () => ({
  getPublicActivityList: apiMocks.getPublicActivityList,
  getRecommendedActivities: apiMocks.getRecommendedActivities,
}));

import { useRecommendedActivities } from "../src/features/user/activity/hooks/useRecommendedActivities";

const emptyResponse = {
  success: true,
  data: { activities: [], total: 0 },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useRecommendedActivities", () => {
  beforeEach(() => {
    apiMocks.getPublicActivityList.mockReset().mockResolvedValue(emptyResponse);
    apiMocks.getRecommendedActivities.mockReset().mockResolvedValue(emptyResponse);
  });

  it("游客只调用公开活动列表", async () => {
    const { result } = renderHook(
      () => useRecommendedActivities({ guest: true }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiMocks.getPublicActivityList).toHaveBeenCalledTimes(1);
    expect(apiMocks.getRecommendedActivities).not.toHaveBeenCalled();
  });

  it("登录态继续调用原推荐活动接口", async () => {
    const { result } = renderHook(() => useRecommendedActivities(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiMocks.getRecommendedActivities).toHaveBeenCalledTimes(1);
    expect(apiMocks.getPublicActivityList).not.toHaveBeenCalled();
  });
});
