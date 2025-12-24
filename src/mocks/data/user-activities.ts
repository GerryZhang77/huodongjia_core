/**
 * 用户端活动数据 Mock
 * 用于 C 端用户查看已报名/参与的活动列表
 */

// 用户活动状态
export type UserActivityStatus =
  | "recruiting" // 报名中
  | "pending" // 待审核
  | "approved" // 已通过
  | "completed"; // 已结束

export interface UserActivity {
  id: string;
  title: string;
  coverImage: string;
  eventStartTime: string;
  eventEndTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  tags: string[];
  /** 用户在此活动中的状态 */
  userStatus: UserActivityStatus;
  /** 活动本身状态 */
  activityStatus: "recruiting" | "ongoing" | "completed";
  organizer: {
    id: string;
    name: string;
    avatar: string;
  };
}

export const mockUserActivities: UserActivity[] = [
  {
    id: "ua_001",
    title: "创业者社交酒会｜与 50 位创业者面对面",
    coverImage:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    eventStartTime: "2025-12-28T19:00:00Z",
    eventEndTime: "2025-12-28T22:00:00Z",
    location: "北京市朝阳区三里屯 SOHO A座 15F",
    maxParticipants: 50,
    currentParticipants: 42,
    tags: ["创业", "社交", "投资"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_001",
      name: "创业邦",
      avatar: "https://i.pravatar.cc/100?img=10",
    },
  },
  {
    id: "ua_002",
    title: "硬科技投资人闭门会",
    coverImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    eventStartTime: "2025-12-30T14:00:00Z",
    eventEndTime: "2025-12-30T18:00:00Z",
    location: "北京市海淀区中关村创业大街 3W 咖啡",
    maxParticipants: 30,
    currentParticipants: 28,
    tags: ["投资", "硬科技", "AI"],
    userStatus: "pending",
    activityStatus: "recruiting",
    organizer: {
      id: "org_002",
      name: "36氪",
      avatar: "https://i.pravatar.cc/100?img=11",
    },
  },
  {
    id: "ua_003",
    title: "Web3 开发者 Meetup",
    coverImage:
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    eventStartTime: "2025-12-25T18:30:00Z",
    eventEndTime: "2025-12-25T21:00:00Z",
    location: "上海市浦东新区陆家嘴环路 1000 号",
    maxParticipants: 80,
    currentParticipants: 65,
    tags: ["Web3", "区块链", "技术"],
    userStatus: "approved",
    activityStatus: "recruiting",
    organizer: {
      id: "org_003",
      name: "Web3 Club",
      avatar: "https://i.pravatar.cc/100?img=12",
    },
  },
  {
    id: "ua_004",
    title: "设计师作品交流展",
    coverImage:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80",
    eventStartTime: "2025-12-15T10:00:00Z",
    eventEndTime: "2025-12-15T17:00:00Z",
    location: "杭州市西湖区文三路 477 号华星时代",
    maxParticipants: 100,
    currentParticipants: 100,
    tags: ["设计", "艺术", "创意"],
    userStatus: "completed",
    activityStatus: "completed",
    organizer: {
      id: "org_004",
      name: "站酷",
      avatar: "https://i.pravatar.cc/100?img=13",
    },
  },
  {
    id: "ua_005",
    title: "读书会｜《人类简史》深度解读",
    coverImage:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    eventStartTime: "2025-12-20T19:30:00Z",
    eventEndTime: "2025-12-20T21:30:00Z",
    location: "北京市东城区美术馆东街 22 号三联书店",
    maxParticipants: 25,
    currentParticipants: 25,
    tags: ["读书", "文化", "历史"],
    userStatus: "completed",
    activityStatus: "completed",
    organizer: {
      id: "org_005",
      name: "樊登读书会",
      avatar: "https://i.pravatar.cc/100?img=14",
    },
  },
];

// 根据状态筛选活动
export const getActivitiesByStatus = (
  status?: UserActivityStatus
): UserActivity[] => {
  if (!status) return mockUserActivities;
  return mockUserActivities.filter((a) => a.userStatus === status);
};

// 获取活动详情
export const getActivityById = (id: string): UserActivity | undefined => {
  return mockUserActivities.find((a) => a.id === id);
};

// 获取上一个活动
export const getPreviousActivity = (
  currentId: string
): UserActivity | undefined => {
  const currentIndex = mockUserActivities.findIndex((a) => a.id === currentId);
  if (currentIndex <= 0) return undefined;
  return mockUserActivities[currentIndex - 1];
};

// 获取下一个活动
export const getNextActivity = (
  currentId: string
): UserActivity | undefined => {
  const currentIndex = mockUserActivities.findIndex((a) => a.id === currentId);
  if (currentIndex < 0 || currentIndex >= mockUserActivities.length - 1)
    return undefined;
  return mockUserActivities[currentIndex + 1];
};
