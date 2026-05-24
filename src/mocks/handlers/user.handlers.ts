/**
 * 用户模块 MSW Handlers (C端)
 * 处理 /api/user/* 路径的所有请求
 */
import { http, HttpResponse, delay } from "msw";
import {
  mockUserProfile,
  getUserProfile,
  updateUserProfile,
  type UserProfile,
  type InterestTag,
} from "../data/user-profile";
import { mockUserActivities, type UserActivity } from "../data/user-activities";
import {
  mockNotifications,
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification,
} from "../data/user-notifications";
import { generateDefaultAvatar } from "@/utils/avatar";

// ========================================
// 收藏数据（内存存储）
// ========================================
let favoriteActivityIds: Set<string> = new Set(["ua_001", "ua_003", "ua_006"]);

// ========================================
// 用户模块 Handlers
// ========================================
export const userHandlers = [
  // ==========================================
  // 用户资料相关
  // ==========================================

  /**
   * 获取用户资料
   * GET /api/user/profile
   */
  http.get("/api/user/profile", async ({ request }) => {
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

    const profile = getUserProfile();

    return HttpResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        role: profile.role,
        occupation: profile.occupation,
        company: profile.company,
        city: profile.city,
        bio: profile.bio,
        tags: profile.tags,
        interestTags: profile.interestTags,
        photos: profile.photos,
        stats: profile.stats,
        contact: profile.contact,
        phone: profile.phone,
        email: profile.email,
        wechat: profile.wechat,
      },
    });
  }),

  /**
   * 更新用户资料
   * PUT /api/user/profile
   */
  http.put("/api/user/profile", async ({ request }) => {
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

    const body = (await request.json()) as Partial<UserProfile>;
    const updatedProfile = updateUserProfile(body);

    return HttpResponse.json({
      success: true,
      message: "资料更新成功",
      profile: updatedProfile,
    });
  }),

  /**
   * 上传头像
   * POST /api/user/profile/avatar
   */
  http.post("/api/user/profile/avatar", async ({ request }) => {
    await delay(800);

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

    // 模拟上传成功，返回新头像 URL
    const newAvatarUrl = generateDefaultAvatar(`user-${Date.now()}`);
    mockUserProfile.avatar = newAvatarUrl;

    return HttpResponse.json({
      success: true,
      message: "头像上传成功",
      avatarUrl: newAvatarUrl,
    });
  }),

  /**
   * 获取他人公开资料
   * GET /api/user/profile/:userId
   */
  http.get("/api/user/profile/:userId", async ({ params, request }) => {
    await delay(250);

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

    const userId = String(params.userId || "");
    const self = getUserProfile();
    const profile =
      userId === self.id
        ? self
        : {
            id: userId,
            name: "赵敏",
            avatar: "https://i.pravatar.cc/200?img=47",
            occupation: "品牌负责人",
            company: "新消费实验室",
            industry: "品牌增长",
            city: "上海",
            bio: "关注品牌增长、线下社群和消费体验，正在寻找跨界合作伙伴。",
            tags: ["品牌", "增长", "社群", "新消费"],
            photos: [
              "https://picsum.photos/seed/public-profile-1/600/600",
              "https://picsum.photos/seed/public-profile-2/600/600",
              "https://picsum.photos/seed/public-profile-3/600/600",
              "https://picsum.photos/seed/public-profile-4/600/600",
            ],
            publicFields: [
              {
                field_key: "cooperation",
                field_label: "合作方向",
                field_value: "品牌联名、线下沙龙、渠道资源互换",
                field_type: "text",
              },
            ],
          };

    return HttpResponse.json({
      success: true,
      profile,
    });
  }),

  /**
   * 上传照片墙图片
   * POST /api/file/upload-image
   */
  http.post("/api/file/upload-image", async ({ request }) => {
    await delay(700);

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

    const randomId = Math.random().toString(36).slice(2);
    return HttpResponse.json({
      success: true,
      url: `https://picsum.photos/seed/user-photo-${randomId}/800/800`,
    });
  }),

  /**
   * 获取用户统计数据
   * GET /api/user/stats
   */
  http.get("/api/user/stats", async ({ request }) => {
    await delay(200);

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

    const profile = getUserProfile();

    return HttpResponse.json({
      success: true,
      stats: {
        totalEnrollments: profile.stats.activitiesJoined,
        completedActivities: mockUserActivities.filter(
          (a) => a.userStatus === "completed",
        ).length,
        favoriteCount: favoriteActivityIds.size,
        matchingCount: profile.stats.matchedFriends,
      },
    });
  }),

  // ==========================================
  // 用户活动相关
  // ==========================================

  /**
   * 获取用户活动列表（我的活动）
   * GET /api/user/activities
   */
  http.get("/api/user/activities", async ({ request }) => {
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

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

    let filtered = [...mockUserActivities];

    // 按状态筛选
    if (status && status !== "all") {
      filtered = filtered.filter((a) => a.userStatus === status);
    }

    // 分页
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        activities: data,
        total,
        page,
        pageSize,
      },
    });
  }),

  /**
   * 获取推荐活动
   * GET /api/user/activities/recommended
   */
  http.get("/api/user/activities/recommended", async () => {
    await delay(300);

    // 推荐活动：取报名中的活动，按参与率排序
    const recommended = [...mockUserActivities]
      .filter((a) => a.activityStatus === "recruiting")
      .sort(
        (a, b) =>
          b.currentParticipants / b.maxParticipants -
          a.currentParticipants / a.maxParticipants,
      )
      .slice(0, 6);

    return HttpResponse.json({
      success: true,
      data: {
        activities: recommended,
        total: recommended.length,
      },
    });
  }),

  /**
   * 搜索活动
   * GET /api/user/activities/search
   */
  http.get("/api/user/activities/search", async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const keyword = url.searchParams.get("keyword") || "";
    const category = url.searchParams.get("category");
    const city = url.searchParams.get("city");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

    let filtered = [...mockUserActivities];

    // 关键词搜索
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(kw) ||
          a.location.toLowerCase().includes(kw) ||
          a.tags.some((t) => t.toLowerCase().includes(kw)),
      );
    }

    // 分类筛选
    if (category) {
      filtered = filtered.filter((a) => a.tags.includes(category));
    }

    // 城市筛选
    if (city && city !== "全国") {
      filtered = filtered.filter((a) => a.location.includes(city));
    }

    // 分页
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        activities: data,
        total,
        page,
        pageSize,
      },
    });
  }),

  /**
   * 获取活动分类
   * GET /api/user/activities/categories
   */
  http.get("/api/user/activities/categories", async () => {
    await delay(100);

    // 从活动数据中提取所有分类
    const allTags = new Set<string>();
    mockUserActivities.forEach((a) => {
      a.tags.forEach((t) => allTags.add(t));
    });

    const categories = Array.from(allTags).map((tag) => ({
      id: tag,
      name: tag,
      count: mockUserActivities.filter((a) => a.tags.includes(tag)).length,
    }));

    return HttpResponse.json({
      success: true,
      data: {
        categories,
      },
    });
  }),

  /**
   * 获取活动详情
   * GET /api/user/activities/:id
   */
  http.get("/api/user/activities/:id", async ({ params }) => {
    await delay(200);

    const { id } = params;
    const activity = mockUserActivities.find((a) => a.id === id);

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
      data: {
        ...activity,
        isFavorite: favoriteActivityIds.has(activity.id),
      },
    });
  }),

  // ==========================================
  // 收藏相关
  // ==========================================

  /**
   * 获取收藏列表
   * GET /api/user/favorites
   */
  http.get("/api/user/favorites", async ({ request }) => {
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

    const favoriteActivities = mockUserActivities.filter((a) =>
      favoriteActivityIds.has(a.id),
    );

    return HttpResponse.json({
      success: true,
      data: {
        activities: favoriteActivities.map((a) => ({
          ...a,
          isFavorite: true,
        })),
        total: favoriteActivities.length,
      },
    });
  }),

  /**
   * 添加收藏
   * POST /api/user/favorites/:id
   */
  http.post("/api/user/favorites/:id", async ({ params, request }) => {
    await delay(200);

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
    const activityId = id as string;

    // 检查活动是否存在
    const activity = mockUserActivities.find((a) => a.id === activityId);
    if (!activity) {
      return HttpResponse.json(
        {
          success: false,
          message: "活动不存在",
        },
        { status: 404 },
      );
    }

    favoriteActivityIds.add(activityId);

    return HttpResponse.json({
      success: true,
      message: "收藏成功",
      isFavorite: true,
    });
  }),

  /**
   * 取消收藏
   * DELETE /api/user/favorites/:id
   */
  http.delete("/api/user/favorites/:id", async ({ params, request }) => {
    await delay(200);

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
    favoriteActivityIds.delete(id as string);

    return HttpResponse.json({
      success: true,
      message: "已取消收藏",
      isFavorite: false,
    });
  }),

  /**
   * 切换收藏状态
   * POST /api/user/activities/:id/favorite
   */
  http.post(
    "/api/user/activities/:id/favorite",
    async ({ params, request }) => {
      await delay(200);

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
      const activityId = id as string;

      const isFavorite = favoriteActivityIds.has(activityId);
      if (isFavorite) {
        favoriteActivityIds.delete(activityId);
      } else {
        favoriteActivityIds.add(activityId);
      }

      return HttpResponse.json({
        success: true,
        message: isFavorite ? "已取消收藏" : "收藏成功",
        isFavorite: !isFavorite,
      });
    },
  ),

  // ==========================================
  // 通知相关
  // ==========================================

  /**
   * 获取通知列表
   * GET /api/user/notifications
   */
  http.get("/api/user/notifications", async ({ request }) => {
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
    const type = url.searchParams.get("type");
    const isRead = url.searchParams.get("isRead");

    let notifications = getAllNotifications();

    // 类型筛选
    if (type) {
      notifications = notifications.filter((n) => n.type === type);
    }

    // 已读状态筛选
    if (isRead !== null && isRead !== undefined) {
      const readFlag = isRead === "true";
      notifications = notifications.filter((n) => n.isRead === readFlag);
    }

    // 分页
    const total = notifications.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = notifications.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        notifications: data,
        total,
        unreadCount: getUnreadCount(),
      },
    });
  }),

  /**
   * 标记通知为已读
   * POST /api/user/notifications/:id/read
   */
  http.post("/api/user/notifications/:id/read", async ({ params, request }) => {
    await delay(200);

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
    markAsRead(id as string);

    return HttpResponse.json({
      success: true,
      message: "已标记为已读",
    });
  }),

  /**
   * 标记所有通知为已读
   * POST /api/user/notifications/read-all
   */
  http.post("/api/user/notifications/read-all", async ({ request }) => {
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

    markAllAsRead();

    return HttpResponse.json({
      success: true,
      message: "已全部标记为已读",
    });
  }),

  // ==========================================
  // 账号相关
  // ==========================================

  /**
   * 修改密码
   * PUT /api/user/password
   */
  http.put("/api/user/password", async ({ request }) => {
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

    const body = (await request.json()) as {
      oldPassword: string;
      newPassword: string;
    };

    // 模拟验证旧密码
    if (body.oldPassword !== "123456") {
      return HttpResponse.json(
        {
          success: false,
          message: "原密码错误",
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      message: "密码修改成功",
    });
  }),

  /**
   * 删除账号
   * DELETE /api/user/account
   */
  http.delete("/api/user/account", async ({ request }) => {
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

    return HttpResponse.json({
      success: true,
      message: "账号已删除",
    });
  }),
];
