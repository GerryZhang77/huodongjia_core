import type { Notification } from "@/services/userApi";

export type NotificationActionKind =
  | "matching"
  | "activity"
  | "message"
  | "profile"
  | "fallback"
  | "none";

export interface NotificationAction {
  kind: NotificationActionKind;
  path?: string;
  label?: string;
  feedback?: string;
  activityId?: string;
}

const activityNotificationTypes = new Set<Notification["type"]>([
  "activity",
  "enrollment",
  "approval",
  "activity_change",
  "waitlist",
  "reminder",
]);

/**
 * 将通知的业务语义转换为唯一的站内去向。
 *
 * 新通知只依赖 type 和关联 id，不解析可能变化的文案；历史通知缺少活动 id
 * 时降级到活动记录页，确保点击始终有反馈。
 */
export const resolveNotificationAction = (
  notification: Notification,
): NotificationAction => {
  if (notification.type === "matching" || notification.type === "match") {
    if (notification.activityId) {
      return {
        kind: "matching",
        path: `/u/activities/${encodeURIComponent(notification.activityId)}/match-result`,
        label: "查看匹配结果",
        activityId: notification.activityId,
      };
    }

    return {
      kind: "fallback",
      path: "/u/activities/history?status=approved",
      label: "查看我的活动",
      feedback: "这条历史通知缺少活动信息，已为你打开“我的活动”",
    };
  }

  if (
    notification.type === "message" ||
    notification.type === "contact_request" ||
    notification.type === "greeting"
  ) {
    return notification.senderId
      ? {
          kind: "message",
          path: `/u/messages/${encodeURIComponent(notification.senderId)}`,
          label: "查看消息",
        }
      : {
          kind: "message",
          path: "/u/messages",
          label: "查看消息",
        };
  }

  if (notification.type === "follow") {
    return notification.senderId
      ? {
          kind: "profile",
          path: `/u/profile/${encodeURIComponent(notification.senderId)}`,
          label: "查看主页",
        }
      : {
          kind: "profile",
          path: "/u/friends",
          label: "查看关注",
        };
  }

  if (activityNotificationTypes.has(notification.type)) {
    if (notification.activityId) {
      return {
        kind: "activity",
        path: `/u/activities/${encodeURIComponent(notification.activityId)}`,
        label: "查看活动",
        activityId: notification.activityId,
      };
    }

    return {
      kind: "fallback",
      path: "/u/activities/history",
      label: "查看我的活动",
      feedback: "这条历史通知缺少活动信息，已为你打开“我的活动”",
    };
  }

  return { kind: "none" };
};
