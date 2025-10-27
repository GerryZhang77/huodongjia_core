/**
 * 活动管理相关API路由
 */
import { Router, type Request, type Response } from "express";

const router = Router();

// Mock数据
const mockEvents = [
  {
    activity_id: "event_001",
    title: "产品经理交流会",
    description: "分享产品设计经验，探讨行业趋势",
    category: "职业发展",
    tags: ["产品设计", "用户体验", "行业交流"],
    cover_image:
      "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=product%20manager%20meetup%20professional%20networking&image_size=landscape_16_9",
    location: "北京市朝阳区",
    start_time: "2024-02-15T19:00:00Z",
    end_time: "2024-02-15T21:00:00Z",
    registration_start: "2024-02-01T00:00:00Z",
    registration_end: "2024-02-14T23:59:59Z",
    max_participants: 50,
    current_participants: 32,
    waitlist_enabled: true,
    is_public: true,
    status: "published",
    contact_info: {
      name: "张三",
      phone: "13800138000",
      email: "zhangsan@example.com",
    },
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-25T15:30:00Z",
  },
  {
    activity_id: "event_002",
    title: "技术分享沙龙",
    description: "前端技术发展趋势讨论",
    category: "技术交流",
    tags: ["前端开发", "React", "Vue"],
    cover_image:
      "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=tech%20meetup%20frontend%20development%20coding&image_size=landscape_16_9",
    location: "上海市浦东新区",
    start_time: "2024-02-20T14:00:00Z",
    end_time: "2024-02-20T17:00:00Z",
    registration_start: "2024-02-05T00:00:00Z",
    registration_end: "2024-02-19T23:59:59Z",
    max_participants: 30,
    current_participants: 25,
    waitlist_enabled: false,
    is_public: true,
    status: "ongoing",
    contact_info: {
      name: "李四",
      phone: "13900139000",
      email: "lisi@example.com",
    },
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-02-01T12:00:00Z",
  },
];

const mockParticipants = [
  {
    user_id: "user_001",
    name: "王小明",
    email: "wangxiaoming@example.com",
    phone: "13700137000",
    avatar:
      "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20young%20man&image_size=square",
    registration_time: "2024-01-22T10:30:00Z",
    status: "confirmed",
    profile: {
      age: 28,
      occupation: "前端工程师",
      company: "科技公司A",
      interests: ["编程", "设计", "旅行"],
      skills: ["JavaScript", "React", "Node.js"],
    },
  },
  {
    user_id: "user_002",
    name: "李小红",
    email: "lixiaohong@example.com",
    phone: "13800138001",
    avatar:
      "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20young%20woman&image_size=square",
    registration_time: "2024-01-23T14:20:00Z",
    status: "confirmed",
    profile: {
      age: 26,
      occupation: "产品经理",
      company: "科技公司B",
      interests: ["产品设计", "用户研究", "数据分析"],
      skills: ["产品规划", "Figma", "SQL"],
    },
  },
];

/**
 * ==================== RESTful API Routes ====================
 * 符合 OpenAPI 规范的路由定义
 */

/**
 * 获取所有活动列表
 * GET /api/events
 */
router.get("/events", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "未授权访问",
        events: [],
      });
      return;
    }

    // Mock返回活动列表
    res.status(200).json({
      success: true,
      message: "获取成功",
      events: mockEvents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      events: [],
    });
  }
});

/**
 * 获取我创建的活动列表
 * GET /api/events/my/created
 */
router.get(
  "/events/my/created",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
          events: [],
        });
        return;
      }

      // Mock返回当前用户创建的活动
      res.status(200).json({
        success: true,
        message: "获取成功",
        events: mockEvents,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
        events: [],
      });
    }
  }
);

/**
 * 获取活动详情
 * GET /api/events/:id
 */
router.get(
  "/events/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
        });
        return;
      }

      const { id } = req.params;
      const event = mockEvents.find((e) => e.activity_id === id);

      if (!event) {
        res.status(404).json({
          success: false,
          message: "活动不存在",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "获取成功",
        event: event,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
);

/**
 * 创建活动
 * POST /api/events
 */
router.post("/events", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "未授权访问",
      });
      return;
    }

    const eventData = req.body;

    // Mock创建活动
    const newEvent = {
      activity_id: `event_${Date.now()}`,
      ...eventData,
      current_participants: 0,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockEvents.push(newEvent);

    res.status(201).json({
      success: true,
      message: "创建成功",
      event: newEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
    });
  }
});

/**
 * 更新活动
 * PUT /api/events/:id
 */
router.put(
  "/events/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
        });
        return;
      }

      const { id } = req.params;
      const updates = req.body;

      const index = mockEvents.findIndex((e) => e.activity_id === id);
      if (index === -1) {
        res.status(404).json({
          success: false,
          message: "活动不存在",
        });
        return;
      }

      // Mock更新活动
      mockEvents[index] = {
        ...mockEvents[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      res.status(200).json({
        success: true,
        message: "更新成功",
        event: mockEvents[index],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
);

/**
 * 删除活动
 * DELETE /api/events/:id
 */
router.delete(
  "/events/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
        });
        return;
      }

      const { id } = req.params;

      const index = mockEvents.findIndex((e) => e.activity_id === id);
      if (index === -1) {
        res.status(404).json({
          success: false,
          message: "活动不存在",
        });
        return;
      }

      // 检查是否有报名者
      if (mockEvents[index].current_participants > 0) {
        res.status(400).json({
          success: false,
          message: `该活动已有 ${mockEvents[index].current_participants} 人报名，无法删除`,
        });
        return;
      }

      // Mock删除活动
      mockEvents.splice(index, 1);

      res.status(200).json({
        success: true,
        message: "删除成功",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
);

/**
 * ==================== Legacy Routes (兼容旧版) ====================
 * 以下路由保留用于向后兼容
 */

/**
 * 商家获取自己创建的活动
 * GET /api/my-events
 */
router.get("/my-events", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "未授权访问",
        events: [],
      });
      return;
    }

    // Mock返回活动列表
    res.status(200).json({
      success: true,
      message: "获取成功",
      events: mockEvents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      events: [],
    });
  }
});

/**
 * 获取活动详情
 * GET /api/event-detail/:id
 */
router.get(
  "/event-detail/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const event = mockEvents.find((e) => e.activity_id === id);

      if (!event) {
        res.status(404).json({
          success: false,
          message: "活动不存在",
          event: null,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "获取成功",
        event: event,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
        event: null,
      });
    }
  }
);

/**
 * 获取活动参与者列表
 * GET /api/event-participants/:id
 */
router.get(
  "/event-participants/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
          participants: [],
        });
        return;
      }

      const { id } = req.params;

      // Mock返回参与者列表
      res.status(200).json({
        success: true,
        message: "获取成功",
        participants: mockParticipants,
        total: mockParticipants.length,
        statistics: {
          total: mockParticipants.length,
          confirmed: mockParticipants.filter((p) => p.status === "confirmed")
            .length,
          waitlist: mockParticipants.filter((p) => p.status === "waitlist")
            .length,
          cancelled: mockParticipants.filter((p) => p.status === "cancelled")
            .length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
        participants: [],
      });
    }
  }
);

/**
 * 创建活动
 * POST /api/create-event
 */
router.post(
  "/create-event",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
          activity_id: null,
        });
        return;
      }

      const eventData = req.body;

      // 验证必填字段
      if (!eventData.title || !eventData.start_time || !eventData.end_time) {
        res.status(400).json({
          success: false,
          message: "活动标题、开始时间和结束时间不能为空",
          activity_id: null,
        });
        return;
      }

      // Mock创建活动
      const newActivityId = "event_" + Date.now();

      res.status(201).json({
        success: true,
        message: "活动创建成功",
        activity_id: newActivityId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
        activity_id: null,
      });
    }
  }
);

/**
 * 更新活动
 * PUT /api/update-event/:id
 */
router.put(
  "/update-event/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
        });
        return;
      }

      const { id } = req.params;
      const eventData = req.body;

      // Mock更新活动
      res.status(200).json({
        success: true,
        message: "活动更新成功",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
);

/**
 * 取消活动
 * DELETE /api/delete-event/:id
 */
router.delete(
  "/delete-event/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
        });
        return;
      }

      const { id } = req.params;

      // Mock取消活动
      res.status(200).json({
        success: true,
        message: "活动已取消",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
);

/**
 * 导入参与者
 * POST /api/import-participants
 */
router.post(
  "/import-participants",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
          imported_count: 0,
        });
        return;
      }

      // Mock导入参与者
      res.status(200).json({
        success: true,
        message: "导入成功",
        imported_count: 10,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
        imported_count: 0,
      });
    }
  }
);

/**
 * 导出参与者
 * GET /api/export-participants/:id
 */
router.get(
  "/export-participants/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
        });
        return;
      }

      const { id } = req.params;

      // Mock导出参与者
      res.status(200).json({
        success: true,
        message: "导出成功",
        download_url: "/api/files/participants_export.xlsx",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
);

/**
 * 发送通知
 * POST /api/send-notification
 */
router.post(
  "/send-notification",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
          sent_count: 0,
        });
        return;
      }

      const { activity_id, message, recipients } = req.body;

      // Mock发送通知
      res.status(200).json({
        success: true,
        message: "通知发送成功",
        sent_count: recipients?.length || 0,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
        sent_count: 0,
      });
    }
  }
);

/**
 * 更新参与者状态
 * PUT /api/update-participant-status
 */
router.put(
  "/update-participant-status",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "未授权访问",
        });
        return;
      }

      const { activity_id, user_id, status } = req.body;

      // Mock更新参与者状态
      res.status(200).json({
        success: true,
        message: "状态更新成功",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
);

export default router;
