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
];

// ========================================
// 辅助函数
// ========================================

/**
 * 根据活动ID获取报名列表
 */
export function getEnrollmentsByActivityId(
  activityId: string
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
