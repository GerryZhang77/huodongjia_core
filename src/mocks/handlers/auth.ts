import { http, HttpResponse } from "msw";

// ========================================
// 认证模块 Mock 数据
// ========================================

// 商家账号
const mockOrganizer = {
  id: "org_001",
  phone: "13800138001",
  username: "org1",
  name: "张三商家",
  user_type: "organizer",
  avatar: "https://i.pravatar.cc/150?img=1",
  created_at: "2025-01-10T10:00:00Z",
};

// 管理员账号
const mockAdmin = {
  id: "admin_001",
  phone: "13800138002",
  username: "admin1",
  name: "李四管理员",
  user_type: "admin",
  avatar: "https://i.pravatar.cc/150?img=2",
  created_at: "2025-01-05T10:00:00Z",
};

// 普通用户账号
const mockUser = {
  id: "user_001",
  phone: "13800138003",
  username: "user1",
  name: "王五用户",
  user_type: "participant",
  avatar: "https://i.pravatar.cc/150?img=3",
  created_at: "2025-01-15T08:30:00Z",
};

// 用户映射表
const userMap: Record<string, typeof mockOrganizer> = {
  org1: mockOrganizer,
  admin1: mockAdmin,
  user1: mockUser,
  // 兼容旧的测试账号
  merchant_test: mockOrganizer,
  testuser: mockUser,
};

// ========================================
// 认证模块 Handlers
// ========================================
export const authHandlers = [
  // 发送短信验证码
  http.post("/api/auth/send-sms", async ({ request }) => {
    const body = (await request.json()) as { phone: string };

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(body.phone)) {
      return HttpResponse.json(
        {
          success: false,
          message: "手机号格式错误",
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: "验证码发送成功",
      code: "123456", // 测试环境固定验证码
    });
  }),

  // 手机号验证码登录
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { phone: string; code: string };

    await new Promise((resolve) => setTimeout(resolve, 500));

    // 验证码错误
    if (body.code !== "123456") {
      return HttpResponse.json(
        {
          success: false,
          message: "验证码错误",
        },
        { status: 400 }
      );
    }

    // 根据手机号返回不同用户
    const phoneUserMap: Record<string, typeof mockOrganizer> = {
      "13800138001": mockOrganizer,
      "13800138002": mockAdmin,
      "13800138003": mockUser,
    };

    const baseUser = phoneUserMap[body.phone] || mockUser;

    // 转换为前端期望的格式
    const user = {
      id: baseUser.id,
      identifier: body.phone,
      name: baseUser.name,
      role: baseUser.user_type as "organizer" | "admin" | "participant",
      avatar: baseUser.avatar,
      createdAt: baseUser.created_at,
    };

    return HttpResponse.json({
      success: true,
      token: `mock-jwt-token-${Date.now()}`,
      user,
    });
  }),

  // 用户名密码登录
  http.post("/api/auth/login-password", async ({ request }) => {
    const body = (await request.json()) as {
      identifier: string;
      password: string;
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    // 验证密码
    if (body.password !== "123456") {
      return HttpResponse.json(
        {
          success: false,
          message: "用户名或密码错误",
        },
        { status: 400 }
      );
    }

    // 从用户映射表中查找用户
    const baseUser = userMap[body.identifier] || mockUser;

    // 转换为前端期望的格式
    const user = {
      id: baseUser.id,
      identifier: body.identifier,
      name: baseUser.name,
      role: baseUser.user_type as "organizer" | "admin" | "participant",
      avatar: baseUser.avatar,
      createdAt: baseUser.created_at,
    };

    return HttpResponse.json({
      success: true,
      token: `mock-jwt-token-${Date.now()}`,
      user,
    });
  }),

  // 手机号注册
  http.post("/api/auth/register", async ({ request }) => {
    const body = (await request.json()) as {
      phone: string;
      code: string;
      user_type?: "user" | "organizer";
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    // 验证码错误
    if (body.code !== "123456") {
      return HttpResponse.json(
        {
          success: false,
          message: "验证码错误",
        },
        { status: 400 }
      );
    }

    // 模拟手机号已存在
    if (body.phone === "13800138000") {
      return HttpResponse.json(
        {
          success: false,
          message: "该手机号已注册",
        },
        { status: 400 }
      );
    }

    // 创建新用户
    const newUser = {
      id: `user_${Date.now()}`,
      phone: body.phone,
      username: `user_${body.phone.slice(-4)}`,
      name: "新用户",
      user_type: body.user_type || "user",
      avatar: null,
      created_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        success: true,
        token: `mock-jwt-token-${Date.now()}`,
        user: newUser,
      },
      { status: 201 }
    );
  }),

  // 获取当前用户信息
  http.get("/api/auth/me", ({ request }) => {
    const token = request.headers.get("Authorization");

    if (!token || !token.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          success: false,
          message: "未登录或 Token 已过期",
        },
        { status: 401 }
      );
    }

    // 返回默认测试用户
    return HttpResponse.json({
      success: true,
      user: mockUser,
    });
  }),

  // 登出
  http.post("/api/auth/logout", () => {
    return HttpResponse.json({
      success: true,
      message: "退出成功",
    });
  }),
];
