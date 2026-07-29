import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Notification } from "@/services/userApi";
import UserNotifications from "./UserNotifications";

const mocks = vi.hoisted(() => ({
  useNotifications: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  toastShow: vi.fn(),
  fetchBestMatches: vi.fn(),
}));

vi.mock("@/components/layout/UserLayout", () => ({
  UserLayout: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/features/user", () => ({
  useNotifications: mocks.useNotifications,
  useMarkNotificationRead: () => ({ mutate: mocks.markRead }),
  useMarkAllNotificationsRead: () => ({ mutate: mocks.markAllRead }),
}));

vi.mock("@/features/user/hooks/useBestMatches", () => ({
  fetchBestMatchesWithParticipants: mocks.fetchBestMatches,
}));

vi.mock("antd-mobile", () => ({
  Toast: { show: mocks.toastShow },
}));

vi.mock("./UserMatchResult", () => ({
  default: () => null,
}));

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
};

const renderPage = (notification: Notification) => {
  mocks.useNotifications.mockReturnValue({
    data: {
      success: true,
      data: {
        notifications: [notification],
        unreadCount: notification.isRead ? 0 : 1,
      },
    },
    isLoading: false,
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/u/notifications"]}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <UserNotifications />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const createNotification = (
  overrides: Partial<Notification>,
): Notification => ({
  id: "notification-1",
  title: "匹配结果已发布",
  content: "查看为你推荐的伙伴",
  type: "matching",
  isRead: false,
  createdAt: "2026-07-29T00:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  mocks.fetchBestMatches.mockResolvedValue([]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("UserNotifications", () => {
  it("preloads and opens the associated matching result, then marks the notification read", async () => {
    renderPage(
      createNotification({
        activityId: "event-1",
        activityName: "青年交流活动",
      }),
    );

    const notificationButton = screen.getByRole("button", {
      name: "匹配结果已发布，查看匹配结果",
    });
    fireEvent.pointerEnter(notificationButton);
    await waitFor(() =>
      expect(mocks.fetchBestMatches).toHaveBeenCalledWith("event-1"),
    );
    fireEvent.click(notificationButton);

    expect(mocks.markRead).toHaveBeenCalledWith("notification-1");
    expect(screen.getByTestId("location").textContent).toBe(
      "/u/activities/event-1/match-result",
    );
  });

  it("opens the approved activity history with feedback for a legacy notification", () => {
    renderPage(createNotification({ activityId: undefined }));

    fireEvent.click(
      screen.getByRole("button", {
        name: "匹配结果已发布，查看我的活动",
      }),
    );

    expect(screen.getByTestId("location").textContent).toBe(
      "/u/activities/history?status=approved",
    );
    expect(mocks.toastShow).toHaveBeenCalledWith({
      content: "这条历史通知缺少活动信息，已为你打开“我的活动”",
    });
  });
});
