/**
 * 用户端通知消息 Mock 数据
 * 支持多种通知类型和已读/未读状态
 */

// 通知类型
export type NotificationType =
  | "approval" // 报名审核通过
  | "matching" // 匹配结果发布
  | "greeting" // 收到打招呼
  | "activity_change" // 活动信息变更
  | "waitlist"; // 进入候补名单

// 通知优先级对应的图标颜色
export const notificationTypeConfig: Record<
  NotificationType,
  { icon: string; color: string; bgColor: string }
> = {
  approval: {
    icon: "CheckCircle",
    color: "#10B981",
    bgColor: "bg-accent-100",
  },
  matching: {
    icon: "Users",
    color: "#F59E0B",
    bgColor: "bg-warning-100",
  },
  greeting: {
    icon: "MessageCircle",
    color: "#FF7C9E",
    bgColor: "bg-secondary-100",
  },
  activity_change: {
    icon: "AlertCircle",
    color: "#EF4444",
    bgColor: "bg-error-100",
  },
  waitlist: {
    icon: "Clock",
    color: "#6B7280",
    bgColor: "bg-gray-100",
  },
};

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  /** 相关活动 ID（可选） */
  activityId?: string;
  /** 相关活动名称 */
  activityName?: string;
  /** 是否已读 */
  isRead: boolean;
  /** 创建时间 */
  createdAt: string;
}

export const mockNotifications: Notification[] = [
  {
    id: "notif_001",
    type: "approval",
    title: "报名审核通过",
    content: "恭喜！您报名的活动已通过审核，请准时参加",
    activityId: "ua_003",
    activityName: "Web3 开发者 Meetup",
    isRead: false,
    createdAt: "2025-12-20T10:30:00Z",
  },
  {
    id: "notif_002",
    type: "matching",
    title: "匹配结果已发布",
    content: "您参与的活动匹配结果已出炉，快去看看和谁一组吧",
    activityId: "ua_003",
    activityName: "Web3 开发者 Meetup",
    isRead: false,
    createdAt: "2025-12-20T09:15:00Z",
  },
  {
    id: "notif_003",
    type: "greeting",
    title: "收到新的打招呼",
    content: "张三向您发起了打招呼请求，点击查看详情",
    isRead: false,
    createdAt: "2025-12-19T18:45:00Z",
  },
  {
    id: "notif_004",
    type: "activity_change",
    title: "活动信息变更",
    content: "您报名的活动时间有调整，请注意查看最新信息",
    activityId: "ua_001",
    activityName: "创业者社交酒会",
    isRead: true,
    createdAt: "2025-12-19T14:20:00Z",
  },
  {
    id: "notif_005",
    type: "waitlist",
    title: "进入候补名单",
    content: "活动名额已满，您已进入候补名单，如有空位将第一时间通知",
    activityId: "ua_002",
    activityName: "硬科技投资人闭门会",
    isRead: true,
    createdAt: "2025-12-18T11:00:00Z",
  },
  {
    id: "notif_006",
    type: "approval",
    title: "报名审核通过",
    content: "您报名的活动已通过审核",
    activityId: "ua_004",
    activityName: "设计师作品交流展",
    isRead: true,
    createdAt: "2025-12-14T16:30:00Z",
  },
  {
    id: "notif_007",
    type: "matching",
    title: "匹配结果已发布",
    content: "读书会的分组结果已公布，请查看您的组员信息",
    activityId: "ua_005",
    activityName: "读书会｜《人类简史》深度解读",
    isRead: true,
    createdAt: "2025-12-18T20:00:00Z",
  },
];

// 获取未读通知数量
export const getUnreadCount = (): number => {
  return mockNotifications.filter((n) => !n.isRead).length;
};

// 获取所有通知（按时间倒序）
export const getAllNotifications = (): Notification[] => {
  return [...mockNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// 标记通知为已读
export const markAsRead = (id: string): void => {
  const notification = mockNotifications.find((n) => n.id === id);
  if (notification) {
    notification.isRead = true;
  }
};

// 标记所有为已读
export const markAllAsRead = (): void => {
  mockNotifications.forEach((n) => {
    n.isRead = true;
  });
};
