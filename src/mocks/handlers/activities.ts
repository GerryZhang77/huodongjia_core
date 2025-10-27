import { http, HttpResponse } from "msw";

// 导入 Mock 数据
import { mockActivities, MockActivity } from "../data/activities";

// ========================================
// 活动模块 Handlers
// ========================================
export const activityHandlers = [
  // 获取活动列表
  http.get("/api/events", async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const status = url.searchParams.get("status");
    const keyword = url.searchParams.get("keyword");

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 300));

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
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  }),

  // 获取活动详情
  http.get("/api/events/:id", async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 200));

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
      data: activity,
    });
  }),

  // 创建活动
  http.post("/api/events", async ({ request }) => {
    const body = (await request.json()) as Partial<MockActivity>;

    await new Promise((resolve) => setTimeout(resolve, 500));

    // 验证必填字段
    if (!body.title || !body.description) {
      return HttpResponse.json(
        {
          success: false,
          message: "标题和描述为必填项",
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

    // 添加到 Mock 数据（仅内存中，刷新页面会重置）
    mockActivities.unshift(newActivity);

    return HttpResponse.json(
      {
        success: true,
        data: newActivity,
      },
      { status: 201 }
    );
  }),

  // 更新活动
  http.put("/api/events/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Partial<MockActivity>;

    await new Promise((resolve) => setTimeout(resolve, 400));

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
      data: mockActivities[index],
    });
  }),

  // 删除活动
  http.delete("/api/events/:id", async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 300));

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

    // 删除活动
    mockActivities.splice(index, 1);

    return HttpResponse.json({
      success: true,
      message: "删除成功",
    });
  }),

  // 获取我创建的活动
  http.get("/api/events/my/created", async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

    await new Promise((resolve) => setTimeout(resolve, 300));

    // 模拟过滤当前用户创建的活动
    const myActivities = mockActivities.filter(
      (a) => a.organizer.id === "merchant_456"
    );

    const total = myActivities.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = myActivities.slice(start, end);

    return HttpResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  }),

  // 获取热门活动
  http.get("/api/events/popular", async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 按报名人数排序
    const popular = [...mockActivities]
      .sort((a, b) => b.current_participants - a.current_participants)
      .slice(0, 5);

    return HttpResponse.json({
      success: true,
      data: popular,
    });
  }),

  // 获取即将开始的活动
  http.get("/api/events/upcoming", async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 筛选未来的活动
    const now = new Date();
    const upcoming = mockActivities
      .filter((a) => new Date(a.event_start_time) > now)
      .sort(
        (a, b) =>
          new Date(a.event_start_time).getTime() -
          new Date(b.event_start_time).getTime()
      )
      .slice(0, 5);

    return HttpResponse.json({
      success: true,
      data: upcoming,
    });
  }),
];
