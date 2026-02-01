/**
 * 匹配模块 MSW Handlers
 */
import { http, HttpResponse, delay } from "msw";
import {
  mockMatchingRules,
  mockParticipantKeywords,
  mockSimilarityMatrix,
  adjustRulesByDescription,
  generateMockEmbedding,
  generateMatchingGroupsForActivity,
  getMatchingHistory,
  saveMatchingHistory,
  publishMatchingHistory,
  createMatchingTask,
  getMatchingTask,
  simulateAsyncMatching,
} from "../data/matching";
import { getEnrollmentsByActivityId } from "../data/enrollments";

// ========================================
// 匹配模块 Handlers
// ========================================
export const matchingHandlers = [
  /**
   * 获取匹配规则
   * GET /api/matching/:activityId/rules
   * GET /api/generate-match-rules/:activityId
   */
  http.get("/api/matching/:activityId/rules", async ({ request }) => {
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
      message: "获取匹配规则成功",
      data: {
        rules: mockMatchingRules,
      },
    });
  }),

  // 兼容旧路径
  http.get("/api/generate-match-rules/:activityId", async ({ request }) => {
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
      message: "匹配规则生成成功",
      rules: mockMatchingRules,
    });
  }),

  /**
   * 基于自然语言生成匹配规则
   * POST /api/matching/:activityId/rules/generate
   * POST /api/generate-match-rules/:activityId
   */
  http.post("/api/matching/:activityId/rules/generate", async ({ request }) => {
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

    const body = (await request.json()) as { description: string };

    if (!body.description) {
      return HttpResponse.json(
        {
          success: false,
          message: "匹配需求描述不能为空",
        },
        { status: 400 },
      );
    }

    const rules = adjustRulesByDescription(body.description);

    return HttpResponse.json({
      success: true,
      message: "基于自然语言的匹配规则生成成功",
      data: {
        rules,
      },
    });
  }),

  // 兼容旧路径
  http.post("/api/generate-match-rules/:activityId", async ({ request }) => {
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

    const body = (await request.json()) as { description: string };

    if (!body.description) {
      return HttpResponse.json(
        {
          success: false,
          message: "匹配需求描述不能为空",
        },
        { status: 400 },
      );
    }

    const rules = adjustRulesByDescription(body.description);

    return HttpResponse.json({
      success: true,
      message: "基于自然语言的匹配规则生成成功",
      rules,
    });
  }),

  // 前端实际使用的路径 POST /api/match/:activityId/generate
  http.post("/api/match/:activityId/generate", async ({ request }) => {
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

    const body = (await request.json()) as {
      expectation?: string;
      description?: string;
    };
    const description = body.expectation || body.description || "";

    if (!description) {
      return HttpResponse.json(
        {
          success: false,
          message: "匹配需求描述不能为空",
        },
        { status: 400 },
      );
    }

    const rules = adjustRulesByDescription(description);

    return HttpResponse.json({
      success: true,
      message: "基于自然语言的匹配规则生成成功",
      data: {
        rules,
        suggestedConstraints: {
          minGroupSize: 3,
          maxGroupSize: 6,
          genderRatioMin: 40,
          genderRatioMax: 60,
          sameIndustryMax: 2,
        },
      },
    });
  }),

  /**
   * 提取关键词
   * GET /api/matching/:activityId/extract-keywords
   * GET /api/extract-keywords/:activityId
   */
  http.get(
    "/api/matching/:activityId/extract-keywords",
    async ({ request }) => {
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
        message: "关键词提取成功",
        data: {
          keywords: mockParticipantKeywords.map((p) => ({
            user_id: p.user_id,
            name: p.name,
            keywords: p.keywords,
          })),
        },
      });
    },
  ),

  // 兼容旧路径
  http.get("/api/extract-keywords/:activityId", async ({ request }) => {
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
      message: "用户关键词提取成功",
      keywords: mockParticipantKeywords.map((p) => ({
        user_id: p.user_id,
        keywords: p.keywords,
      })),
    });
  }),

  /**
   * 获取词向量
   * POST /api/matching/:activityId/embeddings
   * GET /api/get-embedding/:activityId
   */
  http.post("/api/matching/:activityId/embeddings", async ({ request }) => {
    await delay(600);

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
      message: "词向量计算成功",
      data: {
        embeddings: mockParticipantKeywords,
      },
    });
  }),

  // 兼容旧路径
  http.get("/api/get-embedding/:activityId", async ({ request }) => {
    await delay(600);

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
      message: "词嵌入计算并保存成功",
      embeddings: mockParticipantKeywords,
    });
  }),

  /**
   * 计算相似度矩阵
   * GET /api/matching/:activityId/similarity
   * GET /api/calculate-similarity/:activityId
   */
  http.get("/api/matching/:activityId/similarity", async ({ request }) => {
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
      message: "相似度计算成功",
      data: {
        similarity_matrix: mockSimilarityMatrix,
      },
    });
  }),

  // 兼容旧路径
  http.get("/api/calculate-similarity/:activityId", async ({ request }) => {
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
      message: "余弦相似度计算成功",
      similarity_matrix: mockSimilarityMatrix,
    });
  }),

  /**
   * 执行匹配
   * POST /api/matching/:activityId/execute
   * POST /api/do-match/:activityId
   * POST /api/match/:activityId/execute (前端实际使用)
   */
  http.post(
    "/api/matching/:activityId/execute",
    async ({ params, request }) => {
      await delay(1500);

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

      const { activityId } = params;
      const groups = generateMatchingGroupsForActivity(activityId as string);

      return HttpResponse.json({
        success: true,
        message: "匹配执行成功",
        data: {
          groups: groups,
          statistics: {
            total_groups: groups.length,
            avg_similarity:
              groups.length > 0
                ? groups.reduce((sum, g) => sum + g.similarity_score, 0) /
                  groups.length
                : 0,
            min_similarity:
              groups.length > 0
                ? Math.min(...groups.map((g) => g.similarity_score))
                : 0,
            max_similarity:
              groups.length > 0
                ? Math.max(...groups.map((g) => g.similarity_score))
                : 0,
          },
        },
      });
    },
  ),

  // 前端实际使用的路径
  http.post("/api/match/:activityId/execute", async ({ params, request }) => {
    await delay(1500);

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

    const { activityId } = params;
    const groups = generateMatchingGroupsForActivity(activityId as string);

    return HttpResponse.json({
      success: true,
      message: "匹配执行成功",
      data: {
        groups: groups,
        statistics: {
          total_groups: groups.length,
          avg_similarity:
            groups.length > 0
              ? groups.reduce((sum, g) => sum + g.similarity_score, 0) /
                groups.length
              : 0,
          min_similarity:
            groups.length > 0
              ? Math.min(...groups.map((g) => g.similarity_score))
              : 0,
          max_similarity:
            groups.length > 0
              ? Math.max(...groups.map((g) => g.similarity_score))
              : 0,
        },
      },
    });
  }),

  // 兼容旧路径
  http.post("/api/do-match/:activityId", async ({ params, request }) => {
    await delay(1500);

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

    const { activityId } = params;
    const groups = generateMatchingGroupsForActivity(activityId as string);

    return HttpResponse.json({
      success: true,
      message: "匹配执行成功",
      groups: groups,
    });
  }),

  /**
   * 获取匹配结果
   * GET /api/matching/:activityId/results
   * GET /api/match/:activityId/results (前端实际使用)
   */
  http.get("/api/matching/:activityId/results", async ({ params, request }) => {
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

    const { activityId } = params;
    const groups = generateMatchingGroupsForActivity(activityId as string);

    return HttpResponse.json({
      success: true,
      message: "获取匹配结果成功",
      data: {
        groups: groups,
        statistics: {
          total_groups: groups.length,
          avg_similarity:
            groups.length > 0
              ? groups.reduce((sum, g) => sum + g.similarity_score, 0) /
                groups.length
              : 0,
        },
      },
    });
  }),

  // 前端实际使用的路径
  http.get("/api/match/:activityId/results", async ({ params, request }) => {
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

    const { activityId } = params;
    const groups = generateMatchingGroupsForActivity(activityId as string);

    // 转换为前端期望的格式
    const formattedGroups = groups.map((g, index) => ({
      id: g.group_id,
      name: g.group_name,
      members: g.members.map((m) => ({
        id: m.user_id,
        name: m.name,
        gender: m.gender,
        age: m.profile.age,
        occupation: m.profile.occupation,
        company: m.profile.company,
        industry: m.profile.industry,
        city: m.profile.city,
        tags: m.keywords,
        interests: m.keywords,
        skills: [],
        avatar: m.avatar,
      })),
      score: Math.round(g.similarity_score * 100),
      reasons: g.match_reasons,
      isLocked: g.is_locked,
    }));

    return HttpResponse.json({
      success: true,
      message: "获取匹配结果成功",
      data: {
        groups: formattedGroups,
        statistics: {
          total_groups: formattedGroups.length,
          avg_similarity:
            formattedGroups.length > 0
              ? Math.round(
                  formattedGroups.reduce((sum, g) => sum + g.score, 0) /
                    formattedGroups.length,
                )
              : 0,
        },
      },
    });
  }),

  /**
   * 内部 AI 服务 - 获取词向量
   * POST /api/get_embedding
   */
  http.post("/api/get_embedding", async ({ request }) => {
    await delay(200);

    const body = (await request.json()) as { text: string };

    if (!body.text) {
      return HttpResponse.json(
        {
          success: false,
          message: "文本内容不能为空",
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      message: "词向量获取成功",
      embedding: generateMockEmbedding(128),
    });
  }),

  /**
   * 获取活动参与者列表 (从报名数据获取)
   * GET /api/matching/:activityId/participants
   */
  http.get(
    "/api/matching/:activityId/participants",
    async ({ params, request }) => {
      await delay(300);

      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return HttpResponse.json(
          { success: false, message: "未授权访问" },
          { status: 401 },
        );
      }

      const { activityId } = params;
      const enrollments = getEnrollmentsByActivityId(activityId as string);

      // 转换为参与者格式
      const participants = enrollments.map((e) => ({
        id: e.user_id,
        name: e.name,
        gender: e.gender,
        age: e.age,
        occupation: e.occupation,
        company: e.company,
        city: e.city,
        interests: e.interests,
        skills: e.skills,
        bio: e.bio,
        avatar: e.avatar,
        tags: [...(e.interests || []), ...(e.skills || [])].slice(0, 4),
      }));

      return HttpResponse.json({
        success: true,
        message: "获取参与者列表成功",
        data: {
          participants,
          total: participants.length,
        },
      });
    },
  ),

  /**
   * 获取匹配历史记录
   * GET /api/matching/:activityId/history
   */
  http.get("/api/matching/:activityId/history", async ({ params, request }) => {
    await delay(300);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { success: false, message: "未授权访问" },
        { status: 401 },
      );
    }

    const { activityId } = params;
    const history = getMatchingHistory(activityId as string);

    return HttpResponse.json({
      success: true,
      message: "获取匹配历史成功",
      data: {
        history,
        total: history.length,
      },
    });
  }),

  /**
   * 发布匹配结果
   * POST /api/matching/:activityId/publish
   */
  http.post("/api/matching/:activityId/publish", async ({ request }) => {
    await delay(500);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { success: false, message: "未授权访问" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { historyId: string };
    const success = publishMatchingHistory(body.historyId);

    if (!success) {
      return HttpResponse.json(
        { success: false, message: "未找到匹配记录" },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      message: "发布成功",
    });
  }),

  /**
   * 提交异步匹配任务
   * POST /api/matching/:activityId/task
   */
  http.post("/api/matching/:activityId/task", async ({ params, request }) => {
    await delay(200);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { success: false, message: "未授权访问" },
        { status: 401 },
      );
    }

    const { activityId } = params;
    const body = (await request.json()) as { rules: unknown[] };

    // 创建任务
    const task = createMatchingTask(activityId as string);

    // 模拟异步执行 (不阻塞响应)
    simulateAsyncMatching(task.id, activityId as string, body.rules as any);

    return HttpResponse.json({
      success: true,
      message: "匹配任务已提交",
      data: {
        taskId: task.id,
        status: task.status,
      },
    });
  }),

  /**
   * 查询匹配任务状态
   * GET /api/matching/task/:taskId
   */
  http.get("/api/matching/task/:taskId", async ({ params, request }) => {
    await delay(100);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { success: false, message: "未授权访问" },
        { status: 401 },
      );
    }

    const { taskId } = params;
    const task = getMatchingTask(taskId as string);

    if (!task) {
      return HttpResponse.json(
        { success: false, message: "任务不存在" },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      message: "获取任务状态成功",
      data: task,
    });
  }),

  /**
   * 锁定/解锁分组
   * PUT /api/matching/groups/:groupId/lock
   */
  http.put(
    "/api/matching/groups/:groupId/lock",
    async ({ params, request }) => {
      await delay(200);

      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return HttpResponse.json(
          { success: false, message: "未授权访问" },
          { status: 401 },
        );
      }

      const { groupId } = params;
      const body = (await request.json()) as { is_locked: boolean };

      // 在实际实现中应该更新数据库
      // 这里只是模拟成功响应
      return HttpResponse.json({
        success: true,
        message: body.is_locked ? "分组已锁定" : "分组已解锁",
        data: {
          groupId,
          isLocked: body.is_locked,
        },
      });
    },
  ),
];
