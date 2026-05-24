/**
 * 用户名片/个人资料 Mock 数据
 */

export interface UserProfile {
  id: string;
  /** 头像 */
  avatar: string;
  /** 姓名 */
  name: string;
  /** 角色标签 */
  role: string;
  /** 职业 */
  occupation: string;
  /** 公司 */
  company: string;
  /** 城市 */
  city: string;
  /** 个人简介 */
  bio: string;
  /** 兴趣标签 */
  interestTags: InterestTag[];
  /** 兼容真实接口返回的字符串标签 */
  tags?: string[];
  /** 照片墙 */
  photos?: string[];
  phone?: string;
  email?: string;
  wechat?: string;
  /** 统计数据 */
  stats: UserStats;
  /** 联系方式（可选显示） */
  contact?: {
    phone?: string;
    email?: string;
    wechat?: string;
  };
}

export interface InterestTag {
  id: string;
  name: string;
  /** 标签颜色类型 */
  colorType: "primary" | "secondary" | "accent" | "warning" | "default";
}

export interface UserStats {
  /** 参与活动数 */
  activitiesJoined: number;
  /** 匹配好友数 */
  matchedFriends: number;
  /** 收藏活动数 */
  favoritedActivities: number;
}

// 标签颜色映射
export const tagColorMap: Record<
  InterestTag["colorType"],
  { bg: string; text: string }
> = {
  primary: { bg: "bg-primary-100", text: "text-primary-600" },
  secondary: { bg: "bg-secondary-100", text: "text-secondary-600" },
  accent: { bg: "bg-accent-100", text: "text-accent-600" },
  warning: { bg: "bg-warning-100", text: "text-warning-600" },
  default: { bg: "bg-gray-100", text: "text-gray-600" },
};

export const mockUserProfile: UserProfile = {
  id: "user_001",
  avatar: "https://i.pravatar.cc/200?img=5",
  name: "李明",
  role: "连续创业者",
  occupation: "创始人 & CEO",
  company: "未来科技有限公司",
  city: "北京",
  bio: "连续创业者，专注于 AI + 企业服务赛道。曾获得红杉资本、高瓴创投等机构投资。热爱跑步、读书，乐于结识志同道合的朋友。",
  interestTags: [
    { id: "tag_001", name: "人工智能", colorType: "primary" },
    { id: "tag_002", name: "企业服务", colorType: "accent" },
    { id: "tag_003", name: "创业投资", colorType: "warning" },
    { id: "tag_004", name: "马拉松", colorType: "secondary" },
    { id: "tag_005", name: "读书会", colorType: "default" },
    { id: "tag_006", name: "高尔夫", colorType: "primary" },
  ],
  tags: ["人工智能", "企业服务", "创业投资", "马拉松", "读书会", "高尔夫"],
  photos: [
    "https://picsum.photos/seed/profile-wall-1/600/600",
    "https://picsum.photos/seed/profile-wall-2/600/600",
    "https://picsum.photos/seed/profile-wall-3/600/600",
    "https://picsum.photos/seed/profile-wall-4/600/600",
    "https://picsum.photos/seed/profile-wall-5/600/600",
  ],
  phone: "13800138003",
  email: "liming@example.com",
  wechat: "liming_founder",
  stats: {
    activitiesJoined: 12,
    matchedFriends: 48,
    favoritedActivities: 6,
  },
  contact: {
    phone: "138****8888",
    email: "li***@example.com",
    wechat: "liming_founder",
  },
};

// 获取用户资料
export const getUserProfile = (): UserProfile => {
  return mockUserProfile;
};

// 更新用户资料
export const updateUserProfile = (
  updates: Partial<UserProfile>
): UserProfile => {
  Object.assign(mockUserProfile, updates);
  return mockUserProfile;
};
