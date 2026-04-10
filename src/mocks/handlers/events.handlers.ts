/**
 * 活动模块 MSW Handlers
 */
import { http, HttpResponse, delay } from "msw";
import { mockActivities, MockActivity } from "../data/activities";
import { mockMerchantActivities } from "../data/merchant";
import { generateDefaultAvatar } from "@/utils/avatar";

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
        (a) => a.title.includes(keyword) || a.description.includes(keyword),
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
        { status: 401 },
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
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      message: "获取成功",
      data: activity,
    });
  }),

  /**
   * 获取活动详情 (商家端详情页专用)
   * GET /api/event-detail/:id
   * 返回格式与 /api/events/:id 类似，但字段名为 event
   * 同时支持 mockActivities (event_xxx) 和 mockMerchantActivities (ma_xxx)
   */
  http.get("/api/event-detail/:id", async ({ params }) => {
    await delay(200);

    const { id } = params;

    // 先从 mockActivities 查找
    let activity = mockActivities.find((a) => a.id === id);

    // 如果没找到，从 mockMerchantActivities 查找
    if (!activity) {
      const merchantActivity = mockMerchantActivities.find((a) => a.id === id);
      if (merchantActivity) {
        // 转换 merchantActivity 格式为统一格式
        activity = {
          id: merchantActivity.id,
          title: merchantActivity.title,
          description: `${merchantActivity.title} - 精彩活动等你来参加！`,
          cover_image: merchantActivity.coverImage,
          images: merchantActivity.images, // 传递多图轮播数据
          category: "综合活动",
          tags: ["热门", "推荐"],
          registration_start_time: merchantActivity.registrationStartTime,
          registration_end_time: merchantActivity.registrationEndTime,
          event_start_time: merchantActivity.eventStartTime,
          event_end_time: merchantActivity.eventEndTime,
          location: merchantActivity.location,
          max_participants: merchantActivity.maxParticipants,
          current_participants: merchantActivity.currentParticipants,
          status: merchantActivity.status,
          is_public: true,
          allow_waitlist: true,
          fee: 0,
          organizer: {
            id: "merchant_001",
            name: "活动家商家",
            avatar: generateDefaultAvatar("merchant_001"),
          },
          created_at: merchantActivity.createdAt,
          updated_at: merchantActivity.updatedAt,
        } as MockActivity;
      }
    }

    if (!activity) {
      return HttpResponse.json(
        {
          success: false,
          message: "活动不存在",
        },
        { status: 404 },
      );
    }

    // 返回活动详情，字段名使用 event (与 ActivityDetail.tsx 期望的格式匹配)
    return HttpResponse.json({
      success: true,
      message: "获取成功",
      event: {
        ...activity,
        // 补充一些详情页可能需要的额外字段
        images:
          (activity as any).images || [activity.cover_image].filter(Boolean),
        organizer: activity.organizer || {
          id: "user-001",
          name: "活动家官方",
          avatar: generateDefaultAvatar("user-001"),
        },
      },
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
        { status: 401 },
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
        { status: 400 },
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
        avatar: generateDefaultAvatar("merchant_456"),
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
      { status: 201 },
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
        { status: 401 },
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
        avatar: generateDefaultAvatar("merchant_456"),
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
      { status: 201 },
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
        { status: 401 },
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
        { status: 404 },
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
        { status: 401 },
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
        { status: 404 },
      );
    }

    // 检查是否有报名者
    if (mockActivities[index].current_participants > 0) {
      return HttpResponse.json(
        {
          success: false,
          message: `该活动已有 ${mockActivities[index].current_participants} 人报名，无法删除`,
        },
        { status: 400 },
      );
    }

    // 删除活动
    mockActivities.splice(index, 1);

    return HttpResponse.json({
      success: true,
      message: "删除成功",
    });
  }),

  /**
   * 上传活动图片
   * POST /api/events/upload-image
   */
  http.post("/api/events/upload-image", async ({ request }) => {
    await delay(500);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          success: false,
          message: "未授权访问",
        },
        { status: 401 },
      );
    }

    try {
      // 解析 FormData
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return HttpResponse.json(
          {
            success: false,
            message: "请选择要上传的图片",
          },
          { status: 400 },
        );
      }

      // 验证文件类型
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        return HttpResponse.json(
          {
            success: false,
            message:
              "不支持的图片格式，请上传 JPG、PNG、GIF 或 WebP 格式的图片",
          },
          { status: 400 },
        );
      }

      // 验证文件大小（最大 5MB）
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return HttpResponse.json(
          {
            success: false,
            message: "图片大小不能超过 5MB",
          },
          { status: 400 },
        );
      }

      // 生成 Mock 图片 URL
      // 使用 picsum.photos 作为 Mock 图片服务
      const randomId = Math.floor(Math.random() * 1000);
      const mockImageUrl = `https://picsum.photos/seed/${randomId}/800/600`;

      return HttpResponse.json({
        success: true,
        message: "上传成功",
        data: {
          url: mockImageUrl,
          filename: file.name,
          size: file.size,
          type: file.type,
        },
      });
    } catch (error) {
      console.error("[MSW] Upload image error:", error);
      return HttpResponse.json(
        {
          success: false,
          message: "图片上传失败，请重试",
        },
        { status: 500 },
      );
    }
  }),
];
