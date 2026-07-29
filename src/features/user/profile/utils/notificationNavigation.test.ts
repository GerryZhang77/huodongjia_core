import { describe, expect, it } from "vitest";
import type { Notification } from "@/services/userApi";
import { resolveNotificationAction } from "./notificationNavigation";

const createNotification = (
  overrides: Partial<Notification>,
): Notification => ({
  id: "notification-1",
  title: "通知",
  content: "通知内容",
  type: "system",
  isRead: false,
  createdAt: "2026-07-29T00:00:00.000Z",
  ...overrides,
});

describe("resolveNotificationAction", () => {
  it("routes matching notifications directly to the published result", () => {
    expect(
      resolveNotificationAction(
        createNotification({
          type: "matching",
          activityId: "event/with space",
        }),
      ),
    ).toEqual({
      kind: "matching",
      path: "/u/activities/event%2Fwith%20space/match-result",
      label: "查看匹配结果",
      activityId: "event/with space",
    });
  });

  it("gives legacy matching notifications a visible safe fallback", () => {
    expect(
      resolveNotificationAction(createNotification({ type: "match" })),
    ).toEqual({
      kind: "fallback",
      path: "/u/activities/history?status=approved",
      label: "查看我的活动",
      feedback: "这条历史通知缺少活动信息，已为你打开“我的活动”",
    });
  });

  it("keeps activity and social notification destinations distinct", () => {
    expect(
      resolveNotificationAction(
        createNotification({
          type: "approval",
          activityId: "event-1",
        }),
      ).path,
    ).toBe("/u/activities/event-1");

    expect(
      resolveNotificationAction(
        createNotification({
          type: "message",
          senderId: "user-2",
        }),
      ).path,
    ).toBe("/u/messages/user-2");

    expect(
      resolveNotificationAction(
        createNotification({
          type: "follow",
          senderId: "user-3",
        }),
      ).path,
    ).toBe("/u/profile/user-3");
  });

  it("does not invent a destination for a generic system notification", () => {
    expect(resolveNotificationAction(createNotification({}))).toEqual({
      kind: "none",
    });
  });
});
