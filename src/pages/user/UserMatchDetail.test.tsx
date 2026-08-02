import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserMatchDetail from "./UserMatchDetail";

const mocks = vi.hoisted(() => ({
  useActivityDetail: vi.fn(),
  getBestMatchDetail: vi.fn(),
  getExistingMatchMessage: vi.fn(),
  getMatchMessage: vi.fn(),
}));

vi.mock("@/components/layout/UserLayout", () => ({
  UserLayout: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/features/user", () => ({
  useActivityDetail: mocks.useActivityDetail,
}));

vi.mock("@/features/user/services/matchApi", () => ({
  getBestMatchDetail: mocks.getBestMatchDetail,
  getExistingMatchMessage: mocks.getExistingMatchMessage,
  getMatchMessage: mocks.getMatchMessage,
}));

const reason = "一方果断推进，一方善于协调，适合先确认共同节奏。";

beforeEach(() => {
  mocks.useActivityDetail.mockReturnValue({
    data: { data: { id: "event-1", title: "青年交流活动" } },
  });
  mocks.getExistingMatchMessage.mockResolvedValue({
    success: false,
    data: "",
  });
  mocks.getMatchMessage.mockResolvedValue({ success: true, data: "欢迎认识" });
  mocks.getBestMatchDetail.mockResolvedValue({
    success: true,
    data: {
      event: { id: "event-1", title: "青年交流活动" },
      schema: [],
      currentUserEnrollment: {
        id: "enrollment-me",
        user_id: "user-me",
        name: "我",
        status: "approved",
        created_at: "2026-08-01T00:00:00.000Z",
        form_data: {},
      },
      targetUserEnrollment: {
        id: "enrollment-target",
        user_id: "user-target",
        name: "伙伴A",
        avatar: null,
        status: "approved",
        created_at: "2026-08-01T00:00:00.000Z",
        form_data: {},
      },
      explanation: {
        fields: [
          {
            rule_index: 0,
            source_field: "birthday",
            target_field: "birthday",
            source_label: "生日",
            target_label: "生日",
            operator: "similarity",
            operator_label: "相似",
            semantic_type: "birthday",
            current_user_value: "1996.03.21",
            target_user_value: "2004.10.1",
            compatibility_insight: {
              kind: "zodiac",
              title: "白羊座 × 天秤座",
              source_type: "白羊座",
              target_type: "天秤座",
              reason,
            },
          },
        ],
      },
    },
  });
});

describe("UserMatchDetail", () => {
  it("shows qualitative fields without scores or operator labels and reveals zodiac insight", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={["/u/activities/event-1/match-result/user-target"]}
        >
          <Routes>
            <Route
              path="/u/activities/:id/match-result/:userId"
              element={<UserMatchDetail />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("伙伴A")).not.toBeNull();
    expect(screen.getByText("1996.03.21")).not.toBeNull();
    expect(screen.getByText("2004.10.1")).not.toBeNull();
    expect(screen.queryByText("3月21日（白羊座）")).toBeNull();
    expect(screen.queryByText("相似")).toBeNull();
    expect(screen.queryByText(/分数|匹配度|契合度|权重/)).toBeNull();
    expect(screen.queryByText(/\d+%/)).toBeNull();

    fireEvent.focus(
      screen.getByRole("button", { name: "查看生日匹配说明" }),
    );
    expect(await screen.findByText(reason)).not.toBeNull();
    expect(screen.queryByText("类型分析仅作交流与破冰参考")).toBeNull();
  });
});
