/**
 * 平台用户发现 Mock 数据
 *
 * 模拟平台公域用户数据库：
 * - 来自平台所有活动的用户（包括非商家自有活动的参与者）
 * - 脱敏展示，解锁后显示完整信息
 * - 包含匹配度计算逻辑
 */

import type {
  PlatformUser,
  DiscoveryQuota,
  DiscoveryFilterOptions,
} from "@/features/merchant/user-pool/types";

// ========================================
// 平台用户 Mock 数据
// ========================================

/**
 * 模拟平台公域用户池
 * 包含商家自己的用户 + 平台其他用户
 * 自有用户标记为已解锁
 */
export const mockPlatformUsers: PlatformUser[] = [
  // ---- 平台公域用户（商家未接触过） ----
  {
    id: "plat_001",
    nickname: "创业小陈",
    avatar: "https://i.pravatar.cc/150?img=30",
    city: "深圳",
    industry: "互联网",
    occupation: "产品经理",
    ageGroup: "25-30",
    gender: "male",
    interests: ["创业", "产品设计", "人工智能"],
    activityPreferences: ["行业交流", "创业沙龙"],
    participationCount: 12,
    lastActiveAt: "2025-10-28T14:00:00Z",
    matchScore: 92,
    isUnlocked: false,
    isFavorited: false,
    // 解锁后可见
    name: "陈志远",
    phone: "13800138001",
    email: "chenzy@startup.com",
    company: "智创科技",
    bio: "连续创业者，专注AI产品化，喜欢参加行业交流活动",
    age: 28,
    skills: ["产品规划", "用户研究", "数据分析"],
  },
  {
    id: "plat_002",
    nickname: "设计师小林",
    avatar: "https://i.pravatar.cc/150?img=31",
    city: "上海",
    industry: "设计",
    occupation: "UI设计师",
    ageGroup: "23-27",
    gender: "female",
    interests: ["UI设计", "插画", "摄影"],
    activityPreferences: ["设计工坊", "社交聚会"],
    participationCount: 8,
    lastActiveAt: "2025-10-26T18:00:00Z",
    matchScore: 78,
    isUnlocked: false,
    isFavorited: true,
    name: "林雨薇",
    phone: "13800138002",
    email: "linyw@design.co",
    company: "创意设计工作室",
    bio: "自由设计师，热爱生活美学，经常参加设计圈聚会",
    age: 26,
    skills: ["Figma", "Illustrator", "品牌设计"],
  },
  {
    id: "plat_003",
    nickname: "金融Jack",
    avatar: "https://i.pravatar.cc/150?img=32",
    city: "北京",
    industry: "金融",
    occupation: "投资经理",
    ageGroup: "30-35",
    gender: "male",
    interests: ["投资", "商业分析", "高尔夫"],
    activityPreferences: ["行业交流", "商务社交"],
    participationCount: 15,
    lastActiveAt: "2025-10-29T09:00:00Z",
    matchScore: 85,
    isUnlocked: false,
    isFavorited: false,
    name: "杨杰克",
    phone: "13800138003",
    email: "jack.yang@fund.com",
    company: "鼎盛资本",
    bio: "专注消费投资，年投资规模超2亿，活跃于各类行业峰会",
    age: 33,
    skills: ["财务建模", "行业研究", "项目评估"],
  },
  {
    id: "plat_004",
    nickname: "运营达人Lily",
    avatar: "https://i.pravatar.cc/150?img=33",
    city: "杭州",
    industry: "电商",
    occupation: "运营总监",
    ageGroup: "28-32",
    gender: "female",
    interests: ["电商运营", "社群营销", "直播"],
    activityPreferences: ["行业交流", "电商峰会"],
    participationCount: 20,
    lastActiveAt: "2025-10-30T10:00:00Z",
    matchScore: 88,
    isUnlocked: false,
    isFavorited: false,
    name: "李莉",
    phone: "13800138004",
    email: "lily.li@ecommerce.cn",
    company: "杭州某电商",
    bio: "10年电商运营经验，擅长社群裂变和私域运营",
    age: 30,
    skills: ["社群运营", "数据分析", "内容营销"],
  },
  {
    id: "plat_005",
    nickname: "技术宅老张",
    avatar: "https://i.pravatar.cc/150?img=34",
    city: "成都",
    industry: "互联网",
    occupation: "架构师",
    ageGroup: "30-35",
    gender: "male",
    interests: ["分布式系统", "开源", "音乐"],
    activityPreferences: ["技术大会", "开源社区"],
    participationCount: 6,
    lastActiveAt: "2025-10-20T16:00:00Z",
    matchScore: 72,
    isUnlocked: false,
    isFavorited: false,
    name: "张鹏飞",
    phone: "13800138005",
    email: "zhangpf@tech.io",
    company: "蓉城科技",
    bio: "15年后端经验，热爱开源和技术分享",
    age: 35,
    skills: ["Go", "Kubernetes", "系统设计"],
  },
  {
    id: "plat_006",
    nickname: "市场人Amy",
    avatar: "https://i.pravatar.cc/150?img=35",
    city: "广州",
    industry: "营销",
    occupation: "品牌经理",
    ageGroup: "25-30",
    gender: "female",
    interests: ["品牌营销", "内容创作", "旅行"],
    activityPreferences: ["品牌沙龙", "社交聚会"],
    participationCount: 11,
    lastActiveAt: "2025-10-27T11:00:00Z",
    matchScore: 81,
    isUnlocked: false,
    isFavorited: true,
    name: "王美琪",
    phone: "13800138006",
    email: "amy.wang@brand.cn",
    company: "美域品牌咨询",
    bio: "品牌策划专家，善于挖掘消费者洞察",
    age: 27,
    skills: ["品牌策略", "内容营销", "数据洞察"],
  },
  {
    id: "plat_007",
    nickname: "教育者老刘",
    avatar: "https://i.pravatar.cc/150?img=36",
    city: "北京",
    industry: "教育",
    occupation: "培训讲师",
    ageGroup: "35-40",
    gender: "male",
    interests: ["教育科技", "领导力", "演讲"],
    activityPreferences: ["教育论坛", "行业交流"],
    participationCount: 18,
    lastActiveAt: "2025-10-25T08:00:00Z",
    matchScore: 69,
    isUnlocked: false,
    isFavorited: false,
    name: "刘建国",
    phone: "13800138007",
    email: "liujg@edu.org",
    company: "未来教育学院",
    bio: "企业培训师，擅长领导力与团队建设课程",
    age: 38,
    skills: ["企业培训", "课程设计", "演讲表达"],
  },
  {
    id: "plat_008",
    nickname: "HR小周",
    avatar: "https://i.pravatar.cc/150?img=37",
    city: "上海",
    industry: "人力资源",
    occupation: "HRBP",
    ageGroup: "25-30",
    gender: "female",
    interests: ["人才发展", "组织设计", "心理学"],
    activityPreferences: ["HR峰会", "社交聚会"],
    participationCount: 9,
    lastActiveAt: "2025-10-28T15:00:00Z",
    matchScore: 76,
    isUnlocked: false,
    isFavorited: false,
    name: "周婷",
    phone: "13800138008",
    email: "zhouting@hr.com",
    company: "人才无忧",
    bio: "专注互联网行业HR，对团建和社交活动兴趣浓厚",
    age: 28,
    skills: ["招聘", "人才发展", "组织诊断"],
  },
  {
    id: "plat_009",
    nickname: "法律人Kevin",
    avatar: "https://i.pravatar.cc/150?img=38",
    city: "深圳",
    industry: "法律",
    occupation: "律师",
    ageGroup: "30-35",
    gender: "male",
    interests: ["知识产权", "商法", "阅读"],
    activityPreferences: ["行业交流", "商务社交"],
    participationCount: 5,
    lastActiveAt: "2025-10-18T12:00:00Z",
    matchScore: 63,
    isUnlocked: false,
    isFavorited: false,
    name: "凯文",
    phone: "13800138009",
    email: "kevin@law.cn",
    company: "中信律师事务所",
    bio: "知识产权律师，服务多家科技创业公司",
    age: 32,
    skills: ["知识产权", "合同审核", "法律顾问"],
  },
  {
    id: "plat_010",
    nickname: "自媒体小鱼",
    avatar: "https://i.pravatar.cc/150?img=39",
    city: "杭州",
    industry: "传媒",
    occupation: "内容创作者",
    ageGroup: "23-27",
    gender: "female",
    interests: ["短视频", "写作", "美食"],
    activityPreferences: ["社交聚会", "创作者大会"],
    participationCount: 14,
    lastActiveAt: "2025-10-29T20:00:00Z",
    matchScore: 90,
    isUnlocked: false,
    isFavorited: true,
    name: "余小鱼",
    phone: "13800138010",
    email: "xiaoyu@media.cn",
    company: "自由职业",
    bio: "全平台粉丝50w+，擅长生活方式内容创作",
    age: 25,
    skills: ["短视频制作", "文案写作", "社群运营"],
  },
  {
    id: "plat_011",
    nickname: "健身Coach陈",
    avatar: "https://i.pravatar.cc/150?img=40",
    city: "成都",
    industry: "体育健康",
    occupation: "健身教练",
    ageGroup: "25-30",
    gender: "male",
    interests: ["健身", "营养学", "户外"],
    activityPreferences: ["户外运动", "社交聚会"],
    participationCount: 7,
    lastActiveAt: "2025-10-24T07:00:00Z",
    matchScore: 74,
    isUnlocked: false,
    isFavorited: false,
    name: "陈浩",
    phone: "13800138011",
    email: "chenhao@fit.cn",
    company: "活力健身",
    bio: "ACE认证教练，热爱户外运动和社交",
    age: 29,
    skills: ["私人训练", "营养配餐", "团课教学"],
  },
  {
    id: "plat_012",
    nickname: "文旅策划Vivian",
    avatar: "https://i.pravatar.cc/150?img=41",
    city: "上海",
    industry: "文旅",
    occupation: "策划总监",
    ageGroup: "28-32",
    gender: "female",
    interests: ["文旅策划", "艺术", "红酒"],
    activityPreferences: ["文旅沙龙", "品鉴会"],
    participationCount: 16,
    lastActiveAt: "2025-10-30T13:00:00Z",
    matchScore: 86,
    isUnlocked: false,
    isFavorited: false,
    name: "赵薇薇",
    phone: "13800138012",
    email: "vivian@travel.cn",
    company: "远行文旅集团",
    bio: "10年文旅行业经验，策划过多个城市文旅IP项目",
    age: 31,
    skills: ["活动策划", "IP运营", "资源整合"],
  },
];

// ========================================
// 商家发现配额 Mock
// ========================================

export const mockDiscoveryQuota: DiscoveryQuota = {
  usedUnlocks: 3,
  freeUnlockLimit: 10,
  usedViews: 18,
  freeViewLimit: 50,
  planName: "基础版",
  planExpiresAt: "2025-12-31T23:59:59Z",
};

// ========================================
// 工具函数
// ========================================

/**
 * 获取发现用户筛选选项
 */
export function getDiscoveryFilterOptions(
  users: PlatformUser[],
): DiscoveryFilterOptions {
  const counters = {
    city: new Map<string, number>(),
    industry: new Map<string, number>(),
    ageGroup: new Map<string, number>(),
    interests: new Map<string, number>(),
    activityPreferences: new Map<string, number>(),
  };

  users.forEach((user) => {
    if (user.city) {
      counters.city.set(user.city, (counters.city.get(user.city) || 0) + 1);
    }
    if (user.industry) {
      counters.industry.set(
        user.industry,
        (counters.industry.get(user.industry) || 0) + 1,
      );
    }
    if (user.ageGroup) {
      counters.ageGroup.set(
        user.ageGroup,
        (counters.ageGroup.get(user.ageGroup) || 0) + 1,
      );
    }
    user.interests.forEach((tag) => {
      counters.interests.set(tag, (counters.interests.get(tag) || 0) + 1);
    });
    user.activityPreferences.forEach((pref) => {
      counters.activityPreferences.set(
        pref,
        (counters.activityPreferences.get(pref) || 0) + 1,
      );
    });
  });

  const toOptions = (map: Map<string, number>) =>
    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, label: value, count }));

  return {
    city: toOptions(counters.city),
    industry: toOptions(counters.industry),
    ageGroup: toOptions(counters.ageGroup),
    interests: toOptions(counters.interests),
    activityPreferences: toOptions(counters.activityPreferences),
  };
}

/**
 * 应用发现用户筛选
 */
export function applyDiscoveryFilters(
  users: PlatformUser[],
  criteria: import("@/features/merchant/user-pool/types").DiscoveryFilterCriteria,
): PlatformUser[] {
  let result = [...users];

  // 关键词
  if (criteria.keyword.trim()) {
    const kw = criteria.keyword.trim().toLowerCase();
    result = result.filter(
      (u) =>
        u.nickname.toLowerCase().includes(kw) ||
        (u.industry && u.industry.toLowerCase().includes(kw)) ||
        (u.city && u.city.toLowerCase().includes(kw)) ||
        (u.occupation && u.occupation.toLowerCase().includes(kw)) ||
        u.interests.some((t) => t.toLowerCase().includes(kw)) ||
        u.activityPreferences.some((p) => p.toLowerCase().includes(kw)),
    );
  }

  // 城市
  if (criteria.city.length > 0) {
    result = result.filter((u) => u.city && criteria.city.includes(u.city));
  }

  // 行业
  if (criteria.industry.length > 0) {
    result = result.filter(
      (u) => u.industry && criteria.industry.includes(u.industry),
    );
  }

  // 年龄段
  if (criteria.ageGroup.length > 0) {
    result = result.filter(
      (u) => u.ageGroup && criteria.ageGroup.includes(u.ageGroup),
    );
  }

  // 兴趣
  if (criteria.interests.length > 0) {
    result = result.filter((u) =>
      u.interests.some((t) => criteria.interests.includes(t)),
    );
  }

  // 活动偏好
  if (criteria.activityPreferences.length > 0) {
    result = result.filter((u) =>
      u.activityPreferences.some((p) =>
        criteria.activityPreferences.includes(p),
      ),
    );
  }

  // 最低匹配度
  if (criteria.minMatchScore > 0) {
    result = result.filter((u) => u.matchScore >= criteria.minMatchScore);
  }

  // 仅看收藏
  if (criteria.favoritedOnly) {
    result = result.filter((u) => u.isFavorited);
  }

  // 排序
  switch (criteria.sortBy) {
    case "matchScore":
      result.sort((a, b) => b.matchScore - a.matchScore);
      break;
    case "lastActive":
      result.sort(
        (a, b) =>
          new Date(b.lastActiveAt).getTime() -
          new Date(a.lastActiveAt).getTime(),
      );
      break;
    case "participationCount":
      result.sort((a, b) => b.participationCount - a.participationCount);
      break;
  }

  return result;
}

/**
 * 模拟解锁用户（切换 isUnlocked 状态）
 */
export function unlockPlatformUser(userId: string): PlatformUser | null {
  const user = mockPlatformUsers.find((u) => u.id === userId);
  if (user) {
    user.isUnlocked = true;
  }
  return user ?? null;
}

/**
 * 模拟切换收藏
 */
export function toggleFavoritePlatformUser(userId: string): boolean {
  const user = mockPlatformUsers.find((u) => u.id === userId);
  if (user) {
    user.isFavorited = !user.isFavorited;
    return user.isFavorited;
  }
  return false;
}
