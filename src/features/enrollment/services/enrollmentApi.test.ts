import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  patch: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  api: {
    patch: apiMocks.patch,
  },
}));

import { updateEnrollmentStatus } from "./enrollmentApi";

describe("updateEnrollmentStatus", () => {
  beforeEach(() => {
    apiMocks.patch.mockReset();
    apiMocks.patch.mockResolvedValue({ success: true });
  });

  it("sends the explicit silent policy when ending enrollment reviews", async () => {
    await updateEnrollmentStatus({
      activityId: "event-1",
      enrollmentIds: ["enrollment-1"],
      status: "rejected",
      notificationPolicy: "silent",
    });

    expect(apiMocks.patch).toHaveBeenCalledWith(
      "/api/enrollments/event-1/status",
      {
        enrollment_ids: ["enrollment-1"],
        status: "rejected",
        notification_policy: "silent",
      },
    );
  });

  it("keeps the request compatible when no policy is specified", async () => {
    await updateEnrollmentStatus({
      activityId: "event-1",
      enrollmentIds: ["enrollment-1"],
      status: "approved",
    });

    expect(apiMocks.patch).toHaveBeenCalledWith(
      "/api/enrollments/event-1/status",
      {
        enrollment_ids: ["enrollment-1"],
        status: "approved",
      },
    );
  });
});
