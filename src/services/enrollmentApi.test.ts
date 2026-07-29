import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  api: {
    post: apiMocks.post,
  },
}));

import { sendNotification } from "./enrollmentApi";

describe("sendNotification", () => {
  beforeEach(() => {
    apiMocks.post.mockReset();
    apiMocks.post.mockResolvedValue({ success: true });
  });

  it("preserves matching semantics and activity context", async () => {
    await sendNotification("event-1", {
      enrollmentIds: ["enrollment-1", "enrollment-2"],
      title: "匹配结果已发布",
      type: "matching",
      message: "查看为你推荐的伙伴",
    });

    expect(apiMocks.post).toHaveBeenCalledWith("/api/notification/notify", {
      enrollment_ids: ["enrollment-1", "enrollment-2"],
      message: "查看为你推荐的伙伴",
      title: "匹配结果已发布",
      type: "matching",
      event_id: "event-1",
    });
  });

  it("also attaches activity context to ordinary activity notifications", async () => {
    await sendNotification("event-2", {
      enrollmentIds: ["enrollment-3"],
      message: "活动信息有更新",
    });

    expect(apiMocks.post).toHaveBeenCalledWith("/api/notification/notify", {
      enrollment_ids: ["enrollment-3"],
      message: "活动信息有更新",
      title: "活动通知",
      type: "enrollment",
      event_id: "event-2",
    });
  });
});
