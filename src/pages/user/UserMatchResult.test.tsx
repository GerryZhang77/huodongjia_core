import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserMatchResult from "./UserMatchResult";

const mocks = vi.hoisted(() => ({
  useActivityDetail: vi.fn(),
  useBestMatches: vi.fn(),
  getBestMatchDetail: vi.fn(),
  getExistingMatchMessage: vi.fn(),
  getMatchMessage: vi.fn(),
}));

vi.mock("@/components/layout/UserLayout", () => ({
  UserLayout: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/business/NFCTouchModal", () => ({
  NFCTouchModal: () => null,
}));

vi.mock("@/features/user", () => ({
  useActivityDetail: mocks.useActivityDetail,
}));

vi.mock("@/features/user/hooks/useBestMatches", () => ({
  useBestMatches: mocks.useBestMatches,
}));

vi.mock("@/features/user/services/matchApi", () => ({
  getBestMatchDetail: mocks.getBestMatchDetail,
  getExistingMatchMessage: mocks.getExistingMatchMessage,
  getMatchMessage: mocks.getMatchMessage,
}));

const bestMatches = Array.from({ length: 5 }, (_, index) => ({
  id: `enrollment-${index + 1}`,
  user_id: `user-${index + 1}`,
  name: `用户${index + 1}`,
  avatar: `https://example.com/avatar-${index + 1}.png`,
  occupation: "产品经理",
  company: "活动家",
  industry: "互联网",
  city: "上海",
  tags: [],
  matchScore: 95 - index,
  rank: index + 1,
  scoreDetail: null,
  isManualRecommendation: false,
}));

beforeEach(() => {
  mocks.useActivityDetail.mockReturnValue({
    data: {
      data: {
        id: "event-1",
        title: "青年交流活动",
        eventStartTime: "2026-08-01T10:00:00.000Z",
        enableNfc: false,
      },
    },
    isLoading: false,
  });
  mocks.useBestMatches.mockReturnValue({
    data: bestMatches,
    loading: false,
    error: null,
  });
  mocks.getBestMatchDetail.mockResolvedValue({
    data: {
      score: { fields: [] },
      schema: [],
      currentUserEnrollment: { form_data: {} },
      targetUserEnrollment: { form_data: {} },
    },
  });
  mocks.getExistingMatchMessage.mockResolvedValue({ data: "" });
  mocks.getMatchMessage.mockResolvedValue({ data: "欢迎认识" });
});

describe("UserMatchResult", () => {
  it("keeps the summary compact, renders avatars, and expands all recommendations", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/u/activities/event-1/match-result"]}>
          <Routes>
            <Route
              path="/u/activities/:id/match-result"
              element={<UserMatchResult />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("5")).not.toBeNull();
    expect(screen.getByText("用户1")).not.toBeNull();
    expect(screen.getByRole("img", { name: "用户1的头像" })).not.toBeNull();
    expect(screen.queryByText("用户4")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "查看全部 5 位" }));

    expect(screen.getByText("用户4")).not.toBeNull();
    expect(screen.getByText("用户5")).not.toBeNull();
    expect(
      screen.getByRole("img", { name: "用户4的头像" }).getAttribute("loading"),
    ).toBe("lazy");
    expect(screen.getByRole("button", { name: "收起推荐" })).not.toBeNull();
  });
});
