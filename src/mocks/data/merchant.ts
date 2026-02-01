/**
 * 商家端 Mock 数据
 * 用于商家后台页面展示
 */

// ========================================
// 类型定义
// ========================================

/**
 * 商家活动统计数据
 */
export interface MerchantActivityStats {
  totalActivities: number;
  activeActivities: number;
  totalParticipants: number;
  pendingEnrollments: number;
  thisMonthActivities: number;
  completedActivities: number;
}

/**
 * 商家活动列表项
 */
export interface MerchantActivity {
  id: string;
  title: string;
  coverImage: string | null;
  images?: string[]; // 活动图片数组（支持多图轮播）
  status:
    | "draft"
    | "recruiting"
    | "full"
    | "ongoing"
    | "completed"
    | "cancelled";
  registrationStartTime: string;
  registrationEndTime: string;
  eventStartTime: string;
  eventEndTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  pendingCount: number;
  approvedCount: number;
  hasMatchResult: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 商家通知
 */
export interface MerchantNotification {
  id: string;
  type: "enrollment" | "match" | "system" | "reminder";
  title: string;
  content: string;
  activityId?: string;
  activityTitle?: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * 商家资料
 */
export interface MerchantProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  avatar?: string;
  description?: string;
  totalActivities: number;
  totalParticipants: number;
  createdAt: string;
}

// ========================================
// Mock 数据
// ========================================

/**
 * 商家统计数据
 */
export const mockMerchantStats: MerchantActivityStats = {
  totalActivities: 12,
  activeActivities: 3,
  totalParticipants: 856,
  pendingEnrollments: 15,
  thisMonthActivities: 4,
  completedActivities: 8,
};

/**
 * 商家活动列表
 */
export const mockMerchantActivities: MerchantActivity[] = [
  {
    id: "ma_001",
    title: "2025 新年跨年派对",
    coverImage:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    images: [
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    ],
    status: "recruiting",
    registrationStartTime: "2025-01-01T00:00:00Z",
    registrationEndTime: "2025-01-20T23:59:59Z",
    eventStartTime: "2025-01-25T19:00:00Z",
    eventEndTime: "2025-01-25T23:59:59Z",
    location: "北京市朝阳区某酒吧",
    maxParticipants: 100,
    currentParticipants: 67,
    pendingCount: 8,
    approvedCount: 59,
    hasMatchResult: false,
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2025-01-15T14:30:00Z",
  },
  {
    id: "ma_002",
    title: "周末户外徒步 - 香山红叶季",
    coverImage:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    status: "full",
    registrationStartTime: "2025-01-05T00:00:00Z",
    registrationEndTime: "2025-01-18T23:59:59Z",
    eventStartTime: "2025-01-20T08:00:00Z",
    eventEndTime: "2025-01-20T17:00:00Z",
    location: "香山公园东门集合",
    maxParticipants: 30,
    currentParticipants: 30,
    pendingCount: 5,
    approvedCount: 30,
    hasMatchResult: true,
    createdAt: "2024-12-25T09:00:00Z",
    updatedAt: "2025-01-18T16:00:00Z",
  },
  {
    id: "ma_003",
    title: "技术沙龙：AI 编程助手实践分享",
    coverImage:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
    status: "recruiting",
    registrationStartTime: "2025-01-10T00:00:00Z",
    registrationEndTime: "2025-01-28T18:00:00Z",
    eventStartTime: "2025-01-30T19:00:00Z",
    eventEndTime: "2025-01-30T21:30:00Z",
    location: "中关村创业大街 3W咖啡",
    maxParticipants: 50,
    currentParticipants: 23,
    pendingCount: 2,
    approvedCount: 21,
    hasMatchResult: false,
    createdAt: "2025-01-08T11:00:00Z",
    updatedAt: "2025-01-20T10:00:00Z",
  },
  {
    id: "ma_004",
    title: "读书会：《纳瓦尔宝典》深度解读",
    coverImage:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    status: "completed",
    registrationStartTime: "2024-12-15T00:00:00Z",
    registrationEndTime: "2024-12-28T18:00:00Z",
    eventStartTime: "2024-12-30T14:00:00Z",
    eventEndTime: "2024-12-30T17:00:00Z",
    location: "望京 SOHO 某会议室",
    maxParticipants: 25,
    currentParticipants: 22,
    pendingCount: 0,
    approvedCount: 22,
    hasMatchResult: true,
    createdAt: "2024-12-10T15:00:00Z",
    updatedAt: "2024-12-30T17:30:00Z",
  },
  {
    id: "ma_005",
    title: "城市骑行：长安街日落线",
    coverImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    status: "draft",
    registrationStartTime: "2025-02-01T00:00:00Z",
    registrationEndTime: "2025-02-10T23:59:59Z",
    eventStartTime: "2025-02-15T16:00:00Z",
    eventEndTime: "2025-02-15T19:00:00Z",
    location: "天安门广场西侧",
    maxParticipants: 20,
    currentParticipants: 0,
    pendingCount: 0,
    approvedCount: 0,
    hasMatchResult: false,
    createdAt: "2025-01-20T09:00:00Z",
    updatedAt: "2025-01-20T09:00:00Z",
  },
  {
    id: "ma_006",
    title: "桌游之夜：狼人杀主题",
    coverImage:
      "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800",
    status: "cancelled",
    registrationStartTime: "2025-01-01T00:00:00Z",
    registrationEndTime: "2025-01-08T23:59:59Z",
    eventStartTime: "2025-01-10T19:00:00Z",
    eventEndTime: "2025-01-10T22:00:00Z",
    location: "朝阳区某桌游吧",
    maxParticipants: 16,
    currentParticipants: 6,
    pendingCount: 0,
    approvedCount: 6,
    hasMatchResult: false,
    createdAt: "2024-12-28T14:00:00Z",
    updatedAt: "2025-01-09T10:00:00Z",
  },
];

/**
 * 商家通知列表
 */
export const mockMerchantNotifications: MerchantNotification[] = [
  {
    id: "mn_001",
    type: "enrollment",
    title: "新的报名申请",
    content: "有 3 位用户申请参加「2025 新年跨年派对」，请及时审核。",
    activityId: "ma_001",
    activityTitle: "2025 新年跨年派对",
    isRead: false,
    createdAt: "2025-01-25T10:30:00Z",
  },
  {
    id: "mn_002",
    type: "reminder",
    title: "活动即将开始",
    content: "「周末户外徒步 - 香山红叶季」将于明天 08:00 开始，请做好准备。",
    activityId: "ma_002",
    activityTitle: "周末户外徒步 - 香山红叶季",
    isRead: false,
    createdAt: "2025-01-19T18:00:00Z",
  },
  {
    id: "mn_003",
    type: "match",
    title: "匹配完成",
    content: "「周末户外徒步 - 香山红叶季」的智能匹配已完成，共分成 6 个小组。",
    activityId: "ma_002",
    activityTitle: "周末户外徒步 - 香山红叶季",
    isRead: true,
    createdAt: "2025-01-18T16:30:00Z",
  },
  {
    id: "mn_004",
    type: "system",
    title: "系统通知",
    content: "您的商家认证已通过，现在可以使用全部功能。",
    isRead: true,
    createdAt: "2025-01-10T09:00:00Z",
  },
  {
    id: "mn_005",
    type: "enrollment",
    title: "报名人数已满",
    content: "「周末户外徒步 - 香山红叶季」报名人数已达上限，已自动关闭报名。",
    activityId: "ma_002",
    activityTitle: "周末户外徒步 - 香山红叶季",
    isRead: true,
    createdAt: "2025-01-18T14:00:00Z",
  },
];

/**
 * 商家资料
 */
export const mockMerchantProfile: MerchantProfile = {
  id: "merchant_001",
  name: "张三（商家）",
  phone: "13800138001",
  email: "merchant@example.com",
  company: "活动家文化传媒有限公司",
  avatar: "https://i.pravatar.cc/150?img=1",
  description: "专注于组织高质量的线下社交活动，帮助人们建立真实的连接。",
  totalActivities: 12,
  totalParticipants: 856,
  createdAt: "2024-06-15T10:00:00Z",
};

// ========================================
// 辅助函数
// ========================================

/**
 * 获取活动状态文本
 */
export function getActivityStatusText(
  status: MerchantActivity["status"],
): string {
  const statusMap: Record<MerchantActivity["status"], string> = {
    draft: "草稿",
    recruiting: "报名中",
    full: "已满员",
    ongoing: "进行中",
    completed: "已结束",
    cancelled: "已取消",
  };
  return statusMap[status] || status;
}

/**
 * 获取活动状态颜色
 */
export function getActivityStatusColor(
  status: MerchantActivity["status"],
): string {
  const colorMap: Record<MerchantActivity["status"], string> = {
    draft: "gray",
    recruiting: "primary",
    full: "warning",
    ongoing: "accent",
    completed: "success",
    cancelled: "error",
  };
  return colorMap[status] || "gray";
}

/**
 * 获取通知类型图标名称
 */
export function getNotificationTypeIcon(
  type: MerchantNotification["type"],
): string {
  const iconMap: Record<MerchantNotification["type"], string> = {
    enrollment: "user-plus",
    match: "git-merge",
    system: "settings",
    reminder: "bell",
  };
  return iconMap[type] || "bell";
}

/**
 * 获取未读通知数量
 */
export function getMerchantUnreadCount(): number {
  return mockMerchantNotifications.filter((n) => !n.isRead).length;
}

/**
 * 根据ID获取活动
 */
export function getMerchantActivityById(
  id: string,
): MerchantActivity | undefined {
  return mockMerchantActivities.find((a) => a.id === id);
}
