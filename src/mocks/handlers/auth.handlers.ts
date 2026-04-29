/**
 * 认证模块 MSW Handlers
 */
import { http, HttpResponse, delay } from "msw";
import {
  findUserByIdentifier,
  generateMockToken,
  mockPhoneUserMap,
} from "../data/users";

// ========================================
// 认证模块 Handlers
// ========================================
export const authHandlers = [
  /**
   * 发送短信验证码
   * POST /api/auth/send-code
   */
  http.post("/api/auth/send-code", async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as { phoneNumber: string };

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(body.phoneNumber)) {
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
      message: "验证码发送成功（mock，验证码为 123456）",
    });
  }),

  /**
   * 校验短信验证码
   * POST /api/auth/verify-code
   */
  http.post("/api/auth/verify-code", async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as { phoneNumber: string; code: string };

    if (body.code !== "123456") {
      return HttpResponse.json(
        {
          success: false,
          message: "验证码错误或已过期",
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: "验证码验证成功",
    });
  }),

  /**
   * GET /api/auth/check-phone
   */
  http.get("/api/auth/check-phone", async ({ request }) => {
    await delay(200);

    const url = new URL(request.url);
    const phone = url.searchParams.get("phone") || "";

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return HttpResponse.json({
        success: true,
        available: false,
        message: "手机号格式不正确",
      });
    }

    const existingUser = mockPhoneUserMap[phone];
    return HttpResponse.json({
      success: true,
      available: !existingUser,
      message: existingUser ? "该手机号已注册" : undefined,
    });
  }),

  /**
   * 商家登录（用户名密码）
   * POST /api/auth/login
   */
  http.post("/api/auth/login", async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as {
      identifier: string;
      password: string;
    };

    // 验证必填字段
    if (!body.identifier || !body.password) {
      return HttpResponse.json(
        {
          success: false,
          message: "用户名和密码不能为空",
          code: "MISSING_CREDENTIALS",
        },
        { status: 400 }
      );
    }

    // 查找用户
    const account = findUserByIdentifier(body.identifier);

    if (!account || body.password !== account.password) {
      return HttpResponse.json(
        {
          success: false,
          message: "账号或密码错误",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    const { user } = account;
    const token = generateMockToken(user.id);

    // 返回成功响应
    return HttpResponse.json({
      success: true,
      message: "登录成功",
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        user_type: user.user_type,
        avatar: user.avatar,
        age: user.age,
        occupation: user.occupation,
        company: user.company,
        tags: user.tags,
        wechat_qr: user.wechat_qr,
      },
    });
  }),

  /**
   * 手机号验证码登录
   * POST /api/auth/login-sms
   */
  http.post("/api/auth/login-sms", async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as { phone: string; code: string };

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

    // 根据手机号返回用户
    const user =
      mockPhoneUserMap[body.phone] || mockPhoneUserMap["13800138003"];
    const token = generateMockToken(user.id);

    return HttpResponse.json({
      success: true,
      message: "登录成功",
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        user_type: user.user_type,
        avatar: user.avatar,
      },
    });
  }),

  /**
   * 获取当前用户信息
   * GET /api/auth/me
   */
  http.get("/api/auth/me", async ({ request }) => {
    await delay(200);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          success: false,
          message: "未授权访问",
        },
        { status: 401 }
      );
    }

    // 返回默认商家用户
    const user = mockPhoneUserMap["13800138001"];
    return HttpResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        user_type: user.user_type,
        avatar: user.avatar,
        age: user.age,
        occupation: user.occupation,
        company: user.company,
        tags: user.tags,
      },
    });
  }),

  /**
   * 商家注册
   * POST /api/auth/register
   */
  http.post("/api/auth/register", async () => {
    await delay(500);

    return HttpResponse.json(
      {
        success: false,
        message: "注册功能暂未实现",
        code: "NOT_IMPLEMENTED",
      },
      { status: 501 }
    );
  }),

  /**
   * 修改密码
   * PUT /api/auth/password
   */
  http.put("/api/auth/password", async () => {
    await delay(300);

    return HttpResponse.json(
      {
        success: false,
        message: "修改密码功能暂未实现",
        code: "NOT_IMPLEMENTED",
      },
      { status: 501 }
    );
  }),

];
