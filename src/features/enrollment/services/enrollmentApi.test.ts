import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  api: {
    get: apiMocks.get,
    patch: apiMocks.patch,
  },
}));

import { getEnrollmentsDetailed, updateEnrollmentStatus } from "./enrollmentApi";

describe("updateEnrollmentStatus", () => {
  beforeEach(() => {
    apiMocks.patch.mockReset();
    apiMocks.patch.mockResolvedValue({ success: true });
    apiMocks.get.mockReset();
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

  it("silently cancels an approved enrollment to release capacity", async () => {
    await updateEnrollmentStatus({
      activityId: "event-1",
      enrollmentIds: ["enrollment-2"],
      status: "cancelled",
      notificationPolicy: "silent",
    });

    expect(apiMocks.patch).toHaveBeenCalledWith(
      "/api/enrollments/event-1/status",
      {
        enrollment_ids: ["enrollment-2"],
        status: "cancelled",
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

describe("getEnrollmentsDetailed", () => {
  it("accepts the new gender contract and keeps legacy form fallbacks", async () => {
    apiMocks.get.mockResolvedValue({
      success: true,
      data: {
        total: 2,
        enrollments: [
          {
            id: "enrollment-1",
            eventId: "event-1",
            name: "资料姓名",
            profileName: "资料姓名",
            formName: "报名姓名",
            gender: "female",
            status: "approved",
            formData: { 姓名: "报名姓名", 性别: "女" },
            formAnswers: { name: "报名姓名", gender: "女" },
            formSchemaSnapshot: [
              { key: "name", label: "姓名", type: "text" },
              { key: "gender", label: "性别", type: "radio" },
            ],
          },
          {
            id: "enrollment-2",
            eventId: "event-1",
            name: "",
            status: "pending",
            formData: { 姓名: "历史姓名", 性别: "男" },
          },
        ],
      },
    });

    const result = await getEnrollmentsDetailed("event-1");

    expect(result.enrollments[0]).toMatchObject({
      name: "资料姓名",
      formName: "报名姓名",
      gender: "female",
    });
    expect(result.enrollments[1]).toMatchObject({
      name: "历史姓名",
      formName: "历史姓名",
      gender: "male",
    });
  });
});
