import type { UserActivity } from "@/services/userApi";

export interface RegistrationAvailability {
  canRegister: boolean;
  reason?: string;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const normalized =
    value.includes("+") || value.endsWith("Z") ? value : `${value}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getRegistrationAvailability(
  activity?: UserActivity | null,
  now = new Date(),
): RegistrationAvailability {
  if (!activity) {
    return { canRegister: false, reason: "活动不存在" };
  }

  if (activity.userStatus === "pending") {
    return { canRegister: false, reason: "报名审核中" };
  }
  if (activity.userStatus === "approved") {
    return { canRegister: false, reason: "已报名通过" };
  }
  if (activity.userStatus === "rejected") {
    return { canRegister: false, reason: "审核已结束" };
  }
  if (activity.userStatus === "waitlist") {
    return { canRegister: false, reason: "候补中" };
  }
  if (activity.userStatus === "cancelled") {
    return { canRegister: false, reason: "已取消报名" };
  }
  if (activity.userStatus === "completed") {
    return { canRegister: false, reason: "活动已结束" };
  }

  const activityStatus = String(activity.activityStatus || "");
  if (["completed", "cancelled", "ended"].includes(activityStatus)) {
    return { canRegister: false, reason: "活动已结束" };
  }

  const registrationStart = parseDate(activity.registrationStart);
  if (registrationStart && registrationStart.getTime() > now.getTime()) {
    return { canRegister: false, reason: "报名尚未开始" };
  }

  const registrationEnd = parseDate(activity.registrationEnd);
  if (registrationEnd && registrationEnd.getTime() < now.getTime()) {
    return { canRegister: false, reason: "报名已截止" };
  }

  const eventEnd = parseDate(activity.eventEndTime || activity.activityEnd);
  if (eventEnd && eventEnd.getTime() < now.getTime()) {
    return { canRegister: false, reason: "活动已结束" };
  }

  const isFull =
    activity.capacitySummary?.isFull ??
    (activity.maxParticipants > 0 &&
      activity.currentParticipants >= activity.maxParticipants);
  if (isFull) {
    return { canRegister: false, reason: "报名人数已满" };
  }

  return { canRegister: true };
}
