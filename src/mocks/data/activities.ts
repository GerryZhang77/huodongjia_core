// ========================================
// Mock 活动数据
// ========================================

export interface MockActivity {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  category: string;
  tags: string[];
  registration_start_time: string;
  registration_end_time: string;
  event_start_time: string;
  event_end_time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  status:
    | "draft"
    | "recruiting"
    | "full"
    | "ongoing"
    | "completed"
    | "cancelled";
  is_public: boolean;
  allow_waitlist: boolean;
  fee: number;
  organizer: {
    id: string;
    name: string;
    avatar: string | null;
  };
  created_at: string;
  updated_at: string;
}

export const mockActivities: MockActivity[] = [
  {
    id: "event_001",
    title: "周末户外徒步活动",
    description: "探索大自然，结交新朋友。路线：香山公园 → 碧云寺 → 鬼见愁",
    cover_image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    category: "户外运动",
    tags: ["徒步", "户外", "周末"],
    registration_start_time: "2025-10-20T00:00:00Z",
    registration_end_time: "2025-10-27T23:59:59Z",
    event_start_time: "2025-10-28T09:00:00Z",
    event_end_time: "2025-10-28T17:00:00Z",
    location: "香山公园东门",
    max_participants: 50,
    current_participants: 32,
    status: "recruiting",
    is_public: true,
    allow_waitlist: true,
    fee: 0,
    organizer: {
      id: "merchant_456",
      name: "测试商家",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    created_at: "2025-10-15T10:30:00Z",
    updated_at: "2025-10-25T14:20:00Z",
  },
  {
    id: "event_002",
    title: "周五读书分享会",
    description: "本期主题：《人类简史》，欢迎爱读书的朋友参加",
    cover_image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    category: "文化学习",
    tags: ["读书", "分享会", "文化"],
    registration_start_time: "2025-10-18T00:00:00Z",
    registration_end_time: "2025-10-24T18:00:00Z",
    event_start_time: "2025-10-25T19:00:00Z",
    event_end_time: "2025-10-25T21:00:00Z",
    location: "朝阳区某咖啡厅",
    max_participants: 20,
    current_participants: 15,
    status: "recruiting",
    is_public: true,
    allow_waitlist: false,
    fee: 0,
    organizer: {
      id: "merchant_456",
      name: "测试商家",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    created_at: "2025-10-12T09:00:00Z",
    updated_at: "2025-10-23T16:45:00Z",
  },
  {
    id: "event_003",
    title: "篮球友谊赛",
    description: "3v3 篮球赛，不限水平，重在参与",
    cover_image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    category: "体育运动",
    tags: ["篮球", "运动", "友谊赛"],
    registration_start_time: "2025-10-10T00:00:00Z",
    registration_end_time: "2025-10-20T23:59:59Z",
    event_start_time: "2025-10-26T14:00:00Z",
    event_end_time: "2025-10-26T18:00:00Z",
    location: "海淀体育馆",
    max_participants: 12,
    current_participants: 12,
    status: "full",
    is_public: true,
    allow_waitlist: true,
    fee: 0,
    organizer: {
      id: "merchant_789",
      name: "体育爱好者",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    created_at: "2025-10-08T15:20:00Z",
    updated_at: "2025-10-20T10:15:00Z",
  },
  {
    id: "event_004",
    title: "技术沙龙：React 19 新特性",
    description: "深入探讨 React 19 的 Server Components、Actions 等新特性",
    cover_image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    category: "技术交流",
    tags: ["技术", "React", "前端"],
    registration_start_time: "2025-10-22T00:00:00Z",
    registration_end_time: "2025-10-29T18:00:00Z",
    event_start_time: "2025-10-30T19:00:00Z",
    event_end_time: "2025-10-30T21:30:00Z",
    location: "中关村创业大街",
    max_participants: 80,
    current_participants: 45,
    status: "recruiting",
    is_public: true,
    allow_waitlist: false,
    fee: 0,
    organizer: {
      id: "merchant_456",
      name: "测试商家",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    created_at: "2025-10-20T11:00:00Z",
    updated_at: "2025-10-25T09:30:00Z",
  },
  {
    id: "event_005",
    title: "周末骑行活动",
    description: "沿着京杭大运河骑行，全程约 40 公里",
    cover_image:
      "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800",
    category: "户外运动",
    tags: ["骑行", "运动", "户外"],
    registration_start_time: "2025-10-05T00:00:00Z",
    registration_end_time: "2025-10-15T23:59:59Z",
    event_start_time: "2025-10-21T08:00:00Z",
    event_end_time: "2025-10-21T14:00:00Z",
    location: "通州运河公园",
    max_participants: 30,
    current_participants: 28,
    status: "completed",
    is_public: true,
    allow_waitlist: false,
    fee: 0,
    organizer: {
      id: "merchant_999",
      name: "骑行俱乐部",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    created_at: "2025-10-01T14:00:00Z",
    updated_at: "2025-10-21T15:00:00Z",
  },
];
