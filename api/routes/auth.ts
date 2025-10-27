/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 *
 * 注意: 所有路由严格按照 OpenAPI 文档定义实现
 * 参考: docs/api_doc/modules/登录模块.openapi.json
 */
import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * 商家登录
 * POST /api/auth/login
 *
 * OpenAPI operationId: organizerLogin
 * 参考: 登录模块.openapi.json - /api/auth/login
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    // 验证必填字段
    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: "用户名和密码不能为空",
        code: "MISSING_CREDENTIALS",
      });
      return;
    }

    // Mock登录验证 - 支持多个测试账号
    const mockAccounts = {
      org1: { password: "123456", userType: "organizer", name: "张三（商家）" },
      organizer1: {
        password: "123456",
        userType: "organizer",
        name: "李四（商家）",
      },
      admin1: { password: "admin123", userType: "admin", name: "超级管理员" },
    };

    const account = mockAccounts[identifier as keyof typeof mockAccounts];

    if (account && password === account.password) {
      // 生成 mock JWT token
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE1YjNjMmQxLTRlNWYtNGEyYi04YzNkLTJlMWY0YTViM2MyZCIsInBob25lIjoiMTM5MDAyMzkwMDIiLCJ1c2VyX3R5cGUiOiInICsgYWNjb3VudC51c2VyVHlwZSArICciLCJpYXQiOjE3NjEwNTk0OTgsImV4cCI6MTc2MTY2NDI5OH0.mock_signature_" +
        Date.now();

      // 返回成功响应 - 严格按照 OpenAPI 定义的 LoginResponse schema
      res.status(200).json({
        success: true,
        message: "登录成功",
        token: token,
        user: {
          id: "a5b3c2d1-4e5f-4a2b-8c3d-2e1f4a5b3c2d",
          phone: "13900239002",
          name: account.name,
          user_type: account.userType,
          age: 35,
          occupation: "活动策划师",
          company: "活动家文化传媒",
          tags: ["活动组织", "策划", "运营"],
          wechat_qr: "https://example.com/qr/organizer123.jpg",
        },
      });
    } else {
      // 登录失败 - 按照 OpenAPI ErrorResponse schema
      res.status(401).json({
        success: false,
        message: "账号或密码错误",
        code: "INVALID_CREDENTIALS",
      });
    }
  } catch (error: unknown) {
    // 服务器错误
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * 商家注册
 * POST /api/auth/register
 *
 * OpenAPI operationId: organizerRegister
 * 参考: 登录模块.openapi.json - /api/auth/register
 */
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement register logic
  res.status(501).json({
    success: false,
    message: "注册功能暂未实现",
    code: "NOT_IMPLEMENTED",
  });
});

/**
 * 获取当前用户信息
 * GET /api/auth/me
 *
 * OpenAPI operationId: getCurrentUser
 * 参考: 登录模块.openapi.json - /api/auth/me
 */
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement get current user logic
  res.status(501).json({
    success: false,
    message: "获取用户信息功能暂未实现",
    code: "NOT_IMPLEMENTED",
  });
});

/**
 * 修改密码
 * PUT /api/auth/password
 *
 * OpenAPI operationId: changePassword
 * 参考: 登录模块.openapi.json - /api/auth/password
 */
router.put("/password", async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement change password logic
  res.status(501).json({
    success: false,
    message: "修改密码功能暂未实现",
    code: "NOT_IMPLEMENTED",
  });
});

/**
 * 登出
 * POST /api/auth/logout
 *
 * OpenAPI operationId: logout
 * 参考: 登录模块.openapi.json - /api/auth/logout
 */
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement logout logic
  res.status(501).json({
    success: false,
    message: "登出功能暂未实现",
    code: "NOT_IMPLEMENTED",
  });
});

export default router;
