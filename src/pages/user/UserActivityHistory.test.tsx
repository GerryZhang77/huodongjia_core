import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import UserActivityHistory from "./UserActivityHistory";

vi.mock("@/components/layout/UserLayout", () => ({
  UserLayout: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/business/ActivityCard", () => ({
  ActivityCard: ({ activity }: { activity: { title: string } }) => (
    <article>{activity.title}</article>
  ),
}));

vi.mock("@/features/user", () => ({
  useUserActivities: () => ({
    data: {
      data: {
        activities: [
          {
            id: "approved-event",
            title: "已通过的活动",
            userStatus: "approved",
          },
          {
            id: "recruiting-event",
            title: "报名中的活动",
            userStatus: "recruiting",
          },
        ],
      },
    },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/useSeedFavoriteStatus", () => ({
  useSeedFavoriteStatus: vi.fn(),
}));

describe("UserActivityHistory", () => {
  it("honors the approved status deep link used by legacy notifications", () => {
    render(
      <MemoryRouter
        initialEntries={["/u/activities/history?status=approved"]}
      >
        <UserActivityHistory />
      </MemoryRouter>,
    );

    expect(screen.getByText("已通过的活动")).not.toBeNull();
    expect(screen.queryByText("报名中的活动")).toBeNull();
  });
});
