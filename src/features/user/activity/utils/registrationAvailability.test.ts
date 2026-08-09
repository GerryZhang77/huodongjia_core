import { describe, expect, it } from "vitest";
import type { UserActivity } from "@/services/userApi";
import { getRegistrationAvailability } from "./registrationAvailability";

const baseActivity: UserActivity = {
  id: "event-1",
  title: "活动",
  coverImage: "",
  eventStartTime: "2099-08-10T10:00:00Z",
  eventEndTime: "2099-08-10T18:00:00Z",
  location: "上海",
  maxParticipants: 30,
  currentParticipants: 20,
  tags: [],
  userStatus: "recruiting",
  activityStatus: "recruiting",
  organizer: { id: "organizer-1", name: "主办方", avatar: "" },
};

describe("getRegistrationAvailability", () => {
  it("allows registration after rejected applications release capacity", () => {
    expect(getRegistrationAvailability({
      ...baseActivity,
      capacitySummary: {
        maxParticipants: 30,
        totalApplications: 40,
        occupiedParticipants: 20,
        pendingParticipants: 12,
        approvedParticipants: 8,
        rejectedParticipants: 20,
        waitlistParticipants: 0,
        cancelledParticipants: 0,
        remainingParticipants: 10,
        isUnlimited: false,
        isFull: false,
        overLimit: false,
      },
    })).toEqual({ canRegister: true });
  });

  it("uses the authoritative backend summary when capacity is full", () => {
    expect(getRegistrationAvailability({
      ...baseActivity,
      currentParticipants: 0,
      capacitySummary: {
        maxParticipants: 30,
        totalApplications: 40,
        occupiedParticipants: 30,
        pendingParticipants: 20,
        approvedParticipants: 10,
        rejectedParticipants: 10,
        waitlistParticipants: 0,
        cancelledParticipants: 0,
        remainingParticipants: 0,
        isUnlimited: false,
        isFull: true,
        overLimit: false,
      },
    })).toEqual({ canRegister: false, reason: "报名人数已满" });
  });
});
