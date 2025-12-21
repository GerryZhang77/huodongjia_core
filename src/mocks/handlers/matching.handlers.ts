/**
 * 匹配模块 MSW Handlers
 */
import { http, HttpResponse, delay } from "msw";
import {
  mockMatchingRules,
  mockParticipantKeywords,
  mockMatchingGroups,
  mockSimilarityMatrix,
  adjustRulesByDescription,
  generateMockEmbedding,
} from "../data/matching";

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
        { status: 401 }
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
        { status: 401 }
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
        { status: 401 }
      );
    }

    const body = (await request.json()) as { description: string };

    if (!body.description) {
      return HttpResponse.json(
        {
          success: false,
          message: "匹配需求描述不能为空",
        },
        { status: 400 }
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
        { status: 401 }
      );
    }

    const body = (await request.json()) as { description: string };

    if (!body.description) {
      return HttpResponse.json(
        {
          success: false,
          message: "匹配需求描述不能为空",
        },
        { status: 400 }
      );
    }

    const rules = adjustRulesByDescription(body.description);

    return HttpResponse.json({
      success: true,
      message: "基于自然语言的匹配规则生成成功",
      rules,
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
          { status: 401 }
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
    }
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
        { status: 401 }
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
        { status: 401 }
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
        { status: 401 }
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
        { status: 401 }
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
        { status: 401 }
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
   */
  http.post("/api/matching/:activityId/execute", async ({ request }) => {
    await delay(1500);

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
      message: "匹配执行成功",
      data: {
        groups: mockMatchingGroups,
        statistics: {
          total_groups: mockMatchingGroups.length,
          avg_similarity: 0.78,
          min_similarity: 0.72,
          max_similarity: 0.85,
        },
      },
    });
  }),

  // 兼容旧路径
  http.post("/api/do-match/:activityId", async ({ request }) => {
    await delay(1500);

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
      message: "匹配执行成功",
      groups: mockMatchingGroups,
    });
  }),

  /**
   * 获取匹配结果
   * GET /api/matching/:activityId/results
   */
  http.get("/api/matching/:activityId/results", async ({ request }) => {
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
      message: "获取匹配结果成功",
      data: {
        groups: mockMatchingGroups,
        statistics: {
          total_groups: mockMatchingGroups.length,
          avg_similarity: 0.78,
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
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: "词向量获取成功",
      embedding: generateMockEmbedding(128),
    });
  }),
];
