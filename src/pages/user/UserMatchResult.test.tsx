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
  getMatchMessage: mocks.getMatchMessage,
}));

const compatibilityInsight = {
  kind: "zodiac" as const,
  title: "白羊座 × 天秤座",
  source_type: "白羊座",
  target_type: "天秤座",
  reason: "一方果断推进，一方善于协调，适合先确认共同节奏。",
};

const birthdayField = {
  rule_index: 0,
  source_field: "birthday",
  target_field: "birthday",
  source_label: "生日",
  target_label: "生日",
  operator: "similarity",
  operator_label: "相似",
};

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
  matchHighlights: index === 0 ? [birthdayField] : [],
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
      explanation: {
        fields: [
          {
            ...birthdayField,
            current_user_value: "1996.03.21",
            target_user_value: "2004.10.1",
            compatibility_insight: compatibilityInsight,
          },
        ],
      },
      schema: [],
      currentUserEnrollment: { form_data: {} },
      targetUserEnrollment: { form_data: {} },
    },
  });
  mocks.getMatchMessage.mockResolvedValue({ data: "欢迎认识" });
});

describe("UserMatchResult", () => {
  it("keeps the summary compact, hides ranking metadata, and expands all recommendations", async () => {
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
    expect(screen.queryByText("产品经理")).toBeNull();
    expect(screen.queryByText("活动家")).toBeNull();
    expect(screen.queryByText("互联网")).toBeNull();
    expect(screen.queryByText("上海")).toBeNull();
    expect(screen.queryByText(/契合度/)).toBeNull();
    expect(screen.queryByText("智能推荐")).toBeNull();
    expect(screen.queryByText("主办方推荐")).toBeNull();
    expect(screen.queryByText("相似")).toBeNull();
    expect(screen.queryByText(/分数|匹配度|契合度|权重/)).toBeNull();
    expect(screen.queryByText(/\d+%/)).toBeNull();
    expect(screen.queryByText("用户4")).toBeNull();

    fireEvent.mouseEnter(
      screen.getByRole("button", { name: "查看生日匹配说明" }),
    );
    expect(await screen.findByText(compatibilityInsight.reason)).not.toBeNull();

    fireEvent.click(
      screen.getAllByRole("button", { name: "查看匹配细节" })[0],
    );
    expect(await screen.findByText("1996.03.21")).not.toBeNull();
    expect(screen.queryByText("3月21日（白羊座）")).toBeNull();
    expect(screen.queryByText("相似")).toBeNull();

    fireEvent.click(
      screen.getAllByRole("button", { name: "查看匹配寄语" })[0],
    );
    expect(await screen.findByText("欢迎认识")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "查看全部 5 位" }));

    expect(screen.getByText("用户4")).not.toBeNull();
    expect(screen.getByText("用户5")).not.toBeNull();
    expect(
      screen.getByRole("img", { name: "用户4的头像" }).getAttribute("loading"),
    ).toBe("lazy");
    expect(screen.getByRole("button", { name: "收起推荐" })).not.toBeNull();
  });
});
