/**
 * 活动模块 MSW Handlers
 */
import { http, HttpResponse, delay } from "msw";
import { mockActivities, MockActivity } from "../data/activities";

// ========================================
// 活动模块 Handlers
// ========================================
export const activityHandlers = [
  /**
   * 获取活动列表
   * GET /api/events
   */
  http.get("/api/events", async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const status = url.searchParams.get("status");
    const keyword = url.searchParams.get("keyword");

    // 过滤数据
    let filtered = [...mockActivities];

    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }

    if (keyword) {
      filtered = filtered.filter(
        (a) => a.title.includes(keyword) || a.description.includes(keyword)
      );
    }

    // 分页
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return HttpResponse.json({
      success: true,
      message: "获取成功",
      data: {
        activities: data,
        total,
        page,
        pageSize,
      },
    });
  }),

  /**
   * 获取我的活动列表（商家）
   * GET /api/events/my
   */
  http.get("/api/events/my", async ({ request }) => {
    await delay(300);

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

    return HttpResponse.json({
      success: true,
      message: "获取成功",
      data: {
        activities: mockActivities,
        total: mockActivities.length,
      },
    });
  }),

  /**
   * 获取活动详情
   * GET /api/events/:id
   */
  http.get("/api/events/:id", async ({ params }) => {
    await delay(200);

    const { id } = params;
    const activity = mockActivities.find((a) => a.id === id);

    if (!activity) {
      return HttpResponse.json(
        {
          success: false,
          message: "活动不存在",
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: "获取成功",
      data: activity,
    });
  }),

  /**
   * 创建活动
   * POST /api/events
   * POST /api/events/create
   */
  http.post("/api/events", async ({ request }) => {
    await delay(500);

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

    const body = (await request.json()) as Partial<MockActivity>;

    // 验证必填字段
    if (!body.title) {
      return HttpResponse.json(
        {
          success: false,
          message: "活动标题不能为空",
        },
        { status: 400 }
      );
    }

    // 创建新活动
    const newActivity: MockActivity = {
      id: `event_${Date.now()}`,
      title: body.title || "未命名活动",
      description: body.description || "",
      cover_image: body.cover_image || null,
      category: body.category || "其他",
      tags: body.tags || [],
      registration_start_time:
        body.registration_start_time || new Date().toISOString(),
      registration_end_time:
        body.registration_end_time || new Date().toISOString(),
      event_start_time: body.event_start_time || new Date().toISOString(),
      event_end_time: body.event_end_time || new Date().toISOString(),
      location: body.location || "",
      max_participants: body.max_participants || 100,
      current_participants: 0,
      status: "draft",
      is_public: body.is_public ?? true,
      allow_waitlist: body.allow_waitlist ?? false,
      fee: body.fee || 0,
      organizer: {
        id: "merchant_456",
        name: "测试商家",
        avatar: "https://i.pravatar.cc/150?img=2",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 添加到 Mock 数据
    mockActivities.unshift(newActivity);

    return HttpResponse.json(
      {
        success: true,
        message: "创建成功",
        data: newActivity,
      },
      { status: 201 }
    );
  }),

  // 兼容 /api/events/create 路径
  http.post("/api/events/create", async ({ request }) => {
    await delay(500);

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

    const body = (await request.json()) as Partial<MockActivity>;

    const newActivity: MockActivity = {
      id: `event_${Date.now()}`,
      title: body.title || "未命名活动",
      description: body.description || "",
      cover_image: body.cover_image || null,
      category: body.category || "其他",
      tags: body.tags || [],
      registration_start_time:
        body.registration_start_time || new Date().toISOString(),
      registration_end_time:
        body.registration_end_time || new Date().toISOString(),
      event_start_time: body.event_start_time || new Date().toISOString(),
      event_end_time: body.event_end_time || new Date().toISOString(),
      location: body.location || "",
      max_participants: body.max_participants || 100,
      current_participants: 0,
      status: "draft",
      is_public: body.is_public ?? true,
      allow_waitlist: body.allow_waitlist ?? false,
      fee: body.fee || 0,
      organizer: {
        id: "merchant_456",
        name: "测试商家",
        avatar: "https://i.pravatar.cc/150?img=2",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockActivities.unshift(newActivity);

    return HttpResponse.json(
      {
        success: true,
        message: "创建成功",
        data: newActivity,
      },
      { status: 201 }
    );
  }),

  /**
   * 更新活动
   * PUT /api/events/:id
   */
  http.put("/api/events/:id", async ({ params, request }) => {
    await delay(400);

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

    const { id } = params;
    const body = (await request.json()) as Partial<MockActivity>;
    const index = mockActivities.findIndex((a) => a.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: "活动不存在",
        },
        { status: 404 }
      );
    }

    // 更新活动
    mockActivities[index] = {
      ...mockActivities[index],
      ...body,
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      message: "更新成功",
      data: mockActivities[index],
    });
  }),

  /**
   * 删除活动
   * DELETE /api/events/:id
   */
  http.delete("/api/events/:id", async ({ params, request }) => {
    await delay(300);

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

    const { id } = params;
    const index = mockActivities.findIndex((a) => a.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: "活动不存在",
        },
        { status: 404 }
      );
    }

    // 检查是否有报名者
    if (mockActivities[index].current_participants > 0) {
      return HttpResponse.json(
        {
          success: false,
          message: `该活动已有 ${mockActivities[index].current_participants} 人报名，无法删除`,
        },
        { status: 400 }
      );
    }

    // 删除活动
    mockActivities.splice(index, 1);

    return HttpResponse.json({
      success: true,
      message: "删除成功",
    });
  }),
];
