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
  /** 活动描述（可选） */
  description?: string;
  coverImage: string;
  /** 活动图片数组（用于轮播，可选） */
  images?: string[];
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
    images: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    ],
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
  // ============ 新增活动数据 ============
  {
    id: "ua_006",
    title: "周末户外徒步｜香山赏秋",
    coverImage:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    eventStartTime: "2026-01-11T08:00:00Z",
    eventEndTime: "2026-01-11T16:00:00Z",
    location: "北京市海淀区香山公园东门",
    maxParticipants: 30,
    currentParticipants: 18,
    tags: ["户外", "徒步", "运动"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_006",
      name: "户外探索家",
      avatar: "https://i.pravatar.cc/100?img=15",
    },
  },
  {
    id: "ua_007",
    title: "上海创业者交流晚宴",
    coverImage:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    eventStartTime: "2026-01-12T18:30:00Z",
    eventEndTime: "2026-01-12T21:30:00Z",
    location: "上海市黄浦区外滩 18 号",
    maxParticipants: 40,
    currentParticipants: 35,
    tags: ["创业", "社交", "商务"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_007",
      name: "创业邦上海",
      avatar: "https://i.pravatar.cc/100?img=16",
    },
  },
  {
    id: "ua_008",
    title: "广州摄影爱好者外拍活动",
    coverImage:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
    eventStartTime: "2026-01-11T14:00:00Z",
    eventEndTime: "2026-01-11T18:00:00Z",
    location: "广州市天河区珠江新城花城广场",
    maxParticipants: 20,
    currentParticipants: 12,
    tags: ["摄影", "艺术", "户外"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_008",
      name: "广州摄影协会",
      avatar: "https://i.pravatar.cc/100?img=17",
    },
  },
  {
    id: "ua_009",
    title: "深圳科技创新论坛",
    coverImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    eventStartTime: "2026-01-15T09:00:00Z",
    eventEndTime: "2026-01-15T17:00:00Z",
    location: "深圳市南山区科技园腾讯大厦",
    maxParticipants: 200,
    currentParticipants: 156,
    tags: ["技术", "AI", "创业"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_009",
      name: "深圳科技协会",
      avatar: "https://i.pravatar.cc/100?img=18",
    },
  },
  {
    id: "ua_010",
    title: "杭州西湖骑行活动",
    coverImage:
      "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800&q=80",
    eventStartTime: "2026-01-12T07:30:00Z",
    eventEndTime: "2026-01-12T11:30:00Z",
    location: "杭州市西湖区断桥残雪",
    maxParticipants: 25,
    currentParticipants: 22,
    tags: ["骑行", "运动", "户外"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_010",
      name: "杭州骑行俱乐部",
      avatar: "https://i.pravatar.cc/100?img=19",
    },
  },
  {
    id: "ua_011",
    title: "成都火锅美食探店",
    coverImage:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    eventStartTime: "2026-01-11T18:00:00Z",
    eventEndTime: "2026-01-11T21:00:00Z",
    location: "成都市锦江区春熙路太古里",
    maxParticipants: 15,
    currentParticipants: 15,
    tags: ["美食", "社交", "探店"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_011",
      name: "成都美食家",
      avatar: "https://i.pravatar.cc/100?img=20",
    },
  },
  {
    id: "ua_012",
    title: "免费公益跑步训练营",
    coverImage:
      "https://images.unsplash.com/photo-1461896836934- voices-walking-the-streets?w=800&q=80",
    eventStartTime: "2026-01-12T06:30:00Z",
    eventEndTime: "2026-01-12T08:00:00Z",
    location: "北京市朝阳区奥林匹克森林公园",
    maxParticipants: 100,
    currentParticipants: 45,
    tags: ["运动", "跑步", "免费"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_012",
      name: "跑步爱好者联盟",
      avatar: "https://i.pravatar.cc/100?img=21",
    },
  },
  {
    id: "ua_013",
    title: "上海爵士音乐之夜",
    coverImage:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80",
    eventStartTime: "2026-01-11T20:00:00Z",
    eventEndTime: "2026-01-11T23:00:00Z",
    location: "上海市静安区南京西路 JZ Club",
    maxParticipants: 80,
    currentParticipants: 68,
    tags: ["音乐", "爵士", "社交"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_013",
      name: "上海爵士俱乐部",
      avatar: "https://i.pravatar.cc/100?img=22",
    },
  },
  {
    id: "ua_014",
    title: "Python 编程入门工作坊",
    coverImage:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
    eventStartTime: "2026-01-18T14:00:00Z",
    eventEndTime: "2026-01-18T18:00:00Z",
    location: "深圳市福田区华强北赛格科技园",
    maxParticipants: 30,
    currentParticipants: 22,
    tags: ["技术", "编程", "Python"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_014",
      name: "深圳码农社区",
      avatar: "https://i.pravatar.cc/100?img=23",
    },
  },
  {
    id: "ua_015",
    title: "广州瑜伽冥想体验课",
    coverImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    eventStartTime: "2026-01-12T09:00:00Z",
    eventEndTime: "2026-01-12T11:00:00Z",
    location: "广州市越秀区北京路步行街瑜伽馆",
    maxParticipants: 20,
    currentParticipants: 16,
    tags: ["运动", "瑜伽", "健康"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_015",
      name: "广州瑜伽协会",
      avatar: "https://i.pravatar.cc/100?img=24",
    },
  },
  {
    id: "ua_016",
    title: "杭州电影观影会｜独立电影之夜",
    coverImage:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
    eventStartTime: "2026-01-11T19:00:00Z",
    eventEndTime: "2026-01-11T22:00:00Z",
    location: "杭州市拱墅区大运河电影院",
    maxParticipants: 50,
    currentParticipants: 38,
    tags: ["电影", "艺术", "文化"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_016",
      name: "杭州独立电影社",
      avatar: "https://i.pravatar.cc/100?img=25",
    },
  },
  {
    id: "ua_017",
    title: "武汉长江夜游交友活动",
    coverImage:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    eventStartTime: "2026-01-12T19:00:00Z",
    eventEndTime: "2026-01-12T21:30:00Z",
    location: "武汉市武昌区黄鹤楼码头",
    maxParticipants: 40,
    currentParticipants: 28,
    tags: ["社交", "交友", "旅行"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_017",
      name: "武汉单身俱乐部",
      avatar: "https://i.pravatar.cc/100?img=26",
    },
  },
  {
    id: "ua_018",
    title: "南京明城墙历史文化讲座",
    coverImage:
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80",
    eventStartTime: "2026-01-18T10:00:00Z",
    eventEndTime: "2026-01-18T12:00:00Z",
    location: "南京市玄武区中山门城墙博物馆",
    maxParticipants: 60,
    currentParticipants: 42,
    tags: ["文化", "历史", "读书"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_018",
      name: "南京历史文化研究会",
      avatar: "https://i.pravatar.cc/100?img=27",
    },
  },
  {
    id: "ua_019",
    title: "西安夜跑团周末活动",
    coverImage:
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80",
    eventStartTime: "2026-01-11T19:30:00Z",
    eventEndTime: "2026-01-11T21:00:00Z",
    location: "西安市雁塔区大雁塔广场",
    maxParticipants: 50,
    currentParticipants: 32,
    tags: ["运动", "跑步", "户外"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_019",
      name: "西安夜跑团",
      avatar: "https://i.pravatar.cc/100?img=28",
    },
  },
  {
    id: "ua_020",
    title: "重庆解放碑美食摄影活动",
    coverImage:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
    eventStartTime: "2026-01-12T11:00:00Z",
    eventEndTime: "2026-01-12T15:00:00Z",
    location: "重庆市渝中区解放碑步行街",
    maxParticipants: 15,
    currentParticipants: 10,
    tags: ["美食", "摄影", "探店"],
    userStatus: "recruiting",
    activityStatus: "recruiting",
    organizer: {
      id: "org_020",
      name: "重庆美食摄影团",
      avatar: "https://i.pravatar.cc/100?img=29",
    },
  },
];

// 根据状态筛选活动
export const getActivitiesByStatus = (
  status?: UserActivityStatus,
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
  currentId: string,
): UserActivity | undefined => {
  const currentIndex = mockUserActivities.findIndex((a) => a.id === currentId);
  if (currentIndex <= 0) return undefined;
  return mockUserActivities[currentIndex - 1];
};

// 获取下一个活动
export const getNextActivity = (
  currentId: string,
): UserActivity | undefined => {
  const currentIndex = mockUserActivities.findIndex((a) => a.id === currentId);
  if (currentIndex < 0 || currentIndex >= mockUserActivities.length - 1)
    return undefined;
  return mockUserActivities[currentIndex + 1];
};
