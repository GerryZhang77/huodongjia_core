/**
 * Mock 报名数据
 */

// ========================================
// 类型定义
// ========================================
export interface MockEnrollment {
  id: string;
  activity_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  gender: "male" | "female" | "other";
  age: number;
  occupation: string;
  company: string;
  city: string;
  interests: string[];
  skills: string[];
  bio: string;
  matching_needs: string;
  status: "pending" | "confirmed" | "waitlist" | "cancelled";
  registration_time: string;
  updated_at: string;
}

// ========================================
// Mock 报名数据
// ========================================
export const mockEnrollments: MockEnrollment[] = [
  {
    id: "enroll_001",
    activity_id: "event_001",
    user_id: "user_001",
    name: "王小明",
    email: "wangxiaoming@example.com",
    phone: "13700137000",
    avatar: "https://i.pravatar.cc/150?img=10",
    gender: "male",
    age: 28,
    occupation: "前端工程师",
    company: "科技公司A",
    city: "北京",
    interests: ["编程", "设计", "旅行"],
    skills: ["JavaScript", "React", "Node.js"],
    bio: "热爱前端技术，喜欢参加技术交流活动",
    matching_needs: "希望认识更多技术大牛",
    status: "confirmed",
    registration_time: "2025-10-22T10:30:00Z",
    updated_at: "2025-10-22T10:30:00Z",
  },
  {
    id: "enroll_002",
    activity_id: "event_001",
    user_id: "user_002",
    name: "李小红",
    email: "lixiaohong@example.com",
    phone: "13800138001",
    avatar: "https://i.pravatar.cc/150?img=20",
    gender: "female",
    age: 26,
    occupation: "产品经理",
    company: "科技公司B",
    city: "北京",
    interests: ["产品设计", "用户研究", "数据分析"],
    skills: ["产品规划", "Figma", "SQL"],
    bio: "专注于用户体验设计的产品经理",
    matching_needs: "希望和技术人员交流",
    status: "confirmed",
    registration_time: "2025-10-23T14:20:00Z",
    updated_at: "2025-10-23T14:20:00Z",
  },
  {
    id: "enroll_003",
    activity_id: "event_001",
    user_id: "user_003",
    name: "张三丰",
    email: "zhangsanfeng@example.com",
    phone: "13900139000",
    avatar: "https://i.pravatar.cc/150?img=30",
    gender: "male",
    age: 32,
    occupation: "后端工程师",
    company: "互联网公司C",
    city: "上海",
    interests: ["架构设计", "分布式系统", "云计算"],
    skills: ["Java", "Go", "Kubernetes"],
    bio: "10年后端开发经验",
    matching_needs: "寻找创业合伙人",
    status: "confirmed",
    registration_time: "2025-10-24T09:15:00Z",
    updated_at: "2025-10-24T09:15:00Z",
  },
  {
    id: "enroll_004",
    activity_id: "event_001",
    user_id: "user_004",
    name: "赵小燕",
    email: "zhaoxiaoyan@example.com",
    phone: "13600136000",
    avatar: "https://i.pravatar.cc/150?img=40",
    gender: "female",
    age: 24,
    occupation: "UI设计师",
    company: "设计工作室D",
    city: "深圳",
    interests: ["视觉设计", "插画", "摄影"],
    skills: ["Photoshop", "Illustrator", "Sketch"],
    bio: "喜欢用设计解决问题",
    matching_needs: "希望认识产品和开发人员",
    status: "pending",
    registration_time: "2025-10-25T16:45:00Z",
    updated_at: "2025-10-25T16:45:00Z",
  },
  {
    id: "enroll_005",
    activity_id: "event_001",
    user_id: "user_005",
    name: "刘大伟",
    email: "liudawei@example.com",
    phone: "13500135000",
    avatar: "https://i.pravatar.cc/150?img=50",
    gender: "male",
    age: 35,
    occupation: "创业者",
    company: "创业公司E",
    city: "杭州",
    interests: ["创业", "投资", "商业模式"],
    skills: ["战略规划", "融资", "团队管理"],
    bio: "连续创业者，正在寻找下一个方向",
    matching_needs: "寻找技术合伙人和投资人",
    status: "confirmed",
    registration_time: "2025-10-25T18:00:00Z",
    updated_at: "2025-10-25T18:00:00Z",
  },
  {
    id: "enroll_006",
    activity_id: "event_001",
    user_id: "user_006",
    name: "陈小静",
    email: "chenxiaojing@example.com",
    phone: "13400134000",
    avatar: "https://i.pravatar.cc/150?img=60",
    gender: "female",
    age: 29,
    occupation: "数据分析师",
    company: "金融公司F",
    city: "北京",
    interests: ["数据挖掘", "机器学习", "金融科技"],
    skills: ["Python", "R", "Tableau"],
    bio: "用数据驱动决策",
    matching_needs: "希望了解更多业务场景",
    status: "confirmed",
    registration_time: "2025-10-26T10:30:00Z",
    updated_at: "2025-10-26T10:30:00Z",
  },
  // ========================================
  // 商家活动 ma_001 的参与者数据
  // ========================================
  {
    id: "enroll_ma_001",
    activity_id: "ma_001",
    user_id: "user_101",
    name: "林小雨",
    email: "linxiaoyu@example.com",
    phone: "13100131001",
    avatar: "https://i.pravatar.cc/150?img=11",
    gender: "female",
    age: 25,
    occupation: "市场营销",
    company: "互联网公司A",
    city: "北京",
    interests: ["营销策划", "社交媒体", "内容创作"],
    skills: ["营销策划", "文案写作", "数据分析"],
    bio: "热爱营销，善于发现用户需求，喜欢尝试新鲜事物",
    matching_needs: "希望认识更多行业内的朋友",
    status: "confirmed",
    registration_time: "2025-01-05T09:30:00Z",
    updated_at: "2025-01-05T09:30:00Z",
  },
  {
    id: "enroll_ma_002",
    activity_id: "ma_001",
    user_id: "user_102",
    name: "周明轩",
    email: "zhoumingxuan@example.com",
    phone: "13200132002",
    avatar: "https://i.pravatar.cc/150?img=12",
    gender: "male",
    age: 30,
    occupation: "产品总监",
    company: "科技创业公司",
    city: "上海",
    interests: ["产品设计", "用户体验", "创业"],
    skills: ["产品规划", "团队管理", "商业分析"],
    bio: "10年产品经验，专注于B端产品设计，正在寻找志同道合的伙伴",
    matching_needs: "寻找技术合伙人，了解AI产品方向",
    status: "confirmed",
    registration_time: "2025-01-06T14:20:00Z",
    updated_at: "2025-01-06T14:20:00Z",
  },
  {
    id: "enroll_ma_003",
    activity_id: "ma_001",
    user_id: "user_103",
    name: "孙悦",
    email: "sunyue@example.com",
    phone: "13300133003",
    avatar: "https://i.pravatar.cc/150?img=23",
    gender: "female",
    age: 27,
    occupation: "全栈工程师",
    company: "外企D",
    city: "深圳",
    interests: ["编程", "开源项目", "技术分享"],
    skills: ["TypeScript", "React", "Node.js", "Python"],
    bio: "全栈开发者，热爱开源，业余时间喜欢写技术博客",
    matching_needs: "希望认识更多技术大牛，交流最新技术趋势",
    status: "confirmed",
    registration_time: "2025-01-07T11:15:00Z",
    updated_at: "2025-01-07T11:15:00Z",
  },
  {
    id: "enroll_ma_004",
    activity_id: "ma_001",
    user_id: "user_104",
    name: "吴昊",
    email: "wuhao@example.com",
    phone: "13400134004",
    avatar: "https://i.pravatar.cc/150?img=14",
    gender: "male",
    age: 33,
    occupation: "投资经理",
    company: "知名VC机构",
    city: "北京",
    interests: ["投资", "创业", "科技趋势"],
    skills: ["投资分析", "商业谈判", "尽职调查"],
    bio: "关注早期科技项目，已投资多个成功案例",
    matching_needs: "寻找优质创业项目和创始人",
    status: "confirmed",
    registration_time: "2025-01-08T16:45:00Z",
    updated_at: "2025-01-08T16:45:00Z",
  },
  {
    id: "enroll_ma_005",
    activity_id: "ma_001",
    user_id: "user_105",
    name: "郑雅琴",
    email: "zhengyaqin@example.com",
    phone: "13500135005",
    avatar: "https://i.pravatar.cc/150?img=25",
    gender: "female",
    age: 26,
    occupation: "UI/UX设计师",
    company: "设计工作室",
    city: "杭州",
    interests: ["设计", "摄影", "旅行"],
    skills: ["Figma", "Sketch", "用户研究"],
    bio: "用设计讲故事，热爱生活美学",
    matching_needs: "希望认识产品和开发小伙伴，一起做有趣的产品",
    status: "pending",
    registration_time: "2025-01-09T10:00:00Z",
    updated_at: "2025-01-09T10:00:00Z",
  },
  {
    id: "enroll_ma_006",
    activity_id: "ma_001",
    user_id: "user_106",
    name: "陈志远",
    email: "chenzhiyuan@example.com",
    phone: "13600136006",
    avatar: "https://i.pravatar.cc/150?img=16",
    gender: "male",
    age: 28,
    occupation: "算法工程师",
    company: "AI公司",
    city: "北京",
    interests: ["机器学习", "深度学习", "计算机视觉"],
    skills: ["Python", "PyTorch", "TensorFlow"],
    bio: "专注于计算机视觉领域，追求技术极致",
    matching_needs: "寻找AI应用场景和合作机会",
    status: "confirmed",
    registration_time: "2025-01-10T08:30:00Z",
    updated_at: "2025-01-10T08:30:00Z",
  },
  {
    id: "enroll_ma_007",
    activity_id: "ma_001",
    user_id: "user_107",
    name: "王芳",
    email: "wangfang@example.com",
    phone: "13700137007",
    avatar: "https://i.pravatar.cc/150?img=27",
    gender: "female",
    age: 31,
    occupation: "HR总监",
    company: "上市公司E",
    city: "广州",
    interests: ["人才发展", "组织管理", "心理学"],
    skills: ["招聘", "培训", "绩效管理"],
    bio: "15年HR经验，帮助企业构建高效团队",
    matching_needs: "希望了解各行业人才需求和发展趋势",
    status: "confirmed",
    registration_time: "2025-01-11T13:20:00Z",
    updated_at: "2025-01-11T13:20:00Z",
  },
  {
    id: "enroll_ma_008",
    activity_id: "ma_001",
    user_id: "user_108",
    name: "李建国",
    email: "lijianguo@example.com",
    phone: "13800138008",
    avatar: "https://i.pravatar.cc/150?img=18",
    gender: "male",
    age: 35,
    occupation: "连续创业者",
    company: "创业中",
    city: "成都",
    interests: ["创业", "商业模式", "团队建设"],
    skills: ["战略规划", "融资", "业务拓展"],
    bio: "三次创业经历，正在探索新赛道",
    matching_needs: "寻找技术合伙人和早期投资",
    status: "waitlist",
    registration_time: "2025-01-12T17:00:00Z",
    updated_at: "2025-01-12T17:00:00Z",
  },
];

// ========================================
// 辅助函数
// ========================================

/**
 * 根据活动ID获取报名列表
 * 支持 event_xxx 和 ma_xxx 两种格式
 */
export function getEnrollmentsByActivityId(
  activityId: string,
): MockEnrollment[] {
  return mockEnrollments.filter((e) => e.activity_id === activityId);
}

/**
 * 获取报名统计
 */
export function getEnrollmentStats(activityId: string) {
  const enrollments = getEnrollmentsByActivityId(activityId);
  return {
    total: enrollments.length,
    confirmed: enrollments.filter((e) => e.status === "confirmed").length,
    pending: enrollments.filter((e) => e.status === "pending").length,
    waitlist: enrollments.filter((e) => e.status === "waitlist").length,
    cancelled: enrollments.filter((e) => e.status === "cancelled").length,
  };
}
