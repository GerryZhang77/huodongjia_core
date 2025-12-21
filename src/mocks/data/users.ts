/**
 * Mock 用户数据
 */

// ========================================
// 类型定义
// ========================================
export interface MockUser {
  id: string;
  phone: string;
  username: string;
  name: string;
  user_type: "organizer" | "admin" | "participant";
  avatar: string | null;
  age?: number;
  occupation?: string;
  company?: string;
  tags?: string[];
  wechat_qr?: string;
  created_at: string;
}

// ========================================
// 测试账号数据
// ========================================

// 商家账号
export const mockOrganizer: MockUser = {
  id: "org_001",
  phone: "13800138001",
  username: "org1",
  name: "张三（商家）",
  user_type: "organizer",
  avatar: "https://i.pravatar.cc/150?img=1",
  age: 35,
  occupation: "活动策划师",
  company: "活动家文化传媒",
  tags: ["活动组织", "策划", "运营"],
  wechat_qr: "https://example.com/qr/organizer123.jpg",
  created_at: "2025-01-10T10:00:00Z",
};

// 管理员账号
export const mockAdmin: MockUser = {
  id: "admin_001",
  phone: "13800138002",
  username: "admin1",
  name: "李四（管理员）",
  user_type: "admin",
  avatar: "https://i.pravatar.cc/150?img=2",
  created_at: "2025-01-05T10:00:00Z",
};

// 普通用户账号
export const mockParticipant: MockUser = {
  id: "user_001",
  phone: "13800138003",
  username: "user1",
  name: "王五（用户）",
  user_type: "participant",
  avatar: "https://i.pravatar.cc/150?img=3",
  age: 28,
  occupation: "前端工程师",
  company: "科技公司A",
  tags: ["编程", "设计", "旅行"],
  created_at: "2025-01-15T08:30:00Z",
};

// ========================================
// 用户映射表（用于登录验证）
// ========================================
export const mockAccounts: Record<
  string,
  { password: string; user: MockUser }
> = {
  // 用户名登录
  org1: { password: "123456", user: mockOrganizer },
  admin1: { password: "admin123", user: mockAdmin },
  user1: { password: "123456", user: mockParticipant },
  // 兼容旧账号
  organizer1: { password: "123456", user: mockOrganizer },
};

// 手机号映射
export const mockPhoneUserMap: Record<string, MockUser> = {
  "13800138001": mockOrganizer,
  "13800138002": mockAdmin,
  "13800138003": mockParticipant,
};

// ========================================
// 辅助函数
// ========================================

/**
 * 根据用户名或手机号查找用户
 */
export function findUserByIdentifier(
  identifier: string
): { user: MockUser; password: string } | null {
  // 先尝试用户名
  if (mockAccounts[identifier]) {
    return mockAccounts[identifier];
  }

  // 再尝试手机号
  const userByPhone = mockPhoneUserMap[identifier];
  if (userByPhone) {
    return { user: userByPhone, password: "123456" };
  }

  return null;
}

/**
 * 生成 Mock JWT Token
 */
export function generateMockToken(userId: string): string {
  return `mock-jwt-token-${userId}-${Date.now()}`;
}
