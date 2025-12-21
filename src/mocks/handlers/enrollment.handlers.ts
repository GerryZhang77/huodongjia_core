/**
 * 报名模块 MSW Handlers
 */
import { http, HttpResponse, delay } from "msw";
import {
  mockEnrollments,
  getEnrollmentsByActivityId,
  getEnrollmentStats,
  type MockEnrollment,
} from "../data/enrollments";

// ========================================
// 报名模块 Handlers
// ========================================
export const enrollmentHandlers = [
  /**
   * 获取活动报名列表
   * GET /api/events/:activityId/enrollments
   */
  http.get(
    "/api/events/:activityId/enrollments",
    async ({ params, request }) => {
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

      const { activityId } = params;
      const enrollments = getEnrollmentsByActivityId(activityId as string);
      const stats = getEnrollmentStats(activityId as string);

      return HttpResponse.json({
        success: true,
        message: "获取成功",
        data: {
          enrollments,
          statistics: stats,
          total: enrollments.length,
        },
      });
    }
  ),

  /**
   * 获取报名详情
   * GET /api/enrollments/:id
   */
  http.get("/api/enrollments/:id", async ({ params, request }) => {
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

    const { id } = params;
    const enrollment = mockEnrollments.find((e) => e.id === id);

    if (!enrollment) {
      return HttpResponse.json(
        {
          success: false,
          message: "报名记录不存在",
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: enrollment,
    });
  }),

  /**
   * 批量导入报名
   * POST /api/events/:activityId/enrollments/import
   */
  http.post(
    "/api/events/:activityId/enrollments/import",
    async ({ params, request }) => {
      await delay(1000);

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

      const { activityId } = params;

      // 模拟导入结果
      return HttpResponse.json({
        success: true,
        message: `活动 ${activityId} 报名导入成功`,
        data: {
          activity_id: activityId,
          imported_count: 10,
          failed_count: 0,
          total: 10,
        },
      });
    }
  ),

  /**
   * 导出报名数据
   * GET /api/events/:activityId/enrollments/export
   */
  http.get(
    "/api/events/:activityId/enrollments/export",
    async ({ params, request }) => {
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

      const { activityId } = params;

      return HttpResponse.json({
        success: true,
        message: "导出成功",
        data: {
          activity_id: activityId,
          download_url: `/api/files/enrollments_${activityId}.xlsx`,
        },
      });
    }
  ),

  /**
   * 更新报名状态
   * PUT /api/enrollments/:id/status
   */
  http.put("/api/enrollments/:id/status", async ({ params, request }) => {
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
    const body = (await request.json()) as { status: string };
    const index = mockEnrollments.findIndex((e) => e.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: "报名记录不存在",
        },
        { status: 404 }
      );
    }

    // 更新状态
    mockEnrollments[index].status = body.status as MockEnrollment["status"];
    mockEnrollments[index].updated_at = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      message: "状态更新成功",
      data: mockEnrollments[index],
    });
  }),

  /**
   * 发送通知
   * POST /api/events/:activityId/enrollments/notify
   */
  http.post(
    "/api/events/:activityId/enrollments/notify",
    async ({ params, request }) => {
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

      const { activityId } = params;
      const body = (await request.json()) as {
        message: string;
        recipients?: string[];
      };

      return HttpResponse.json({
        success: true,
        message: `活动 ${activityId} 通知发送成功`,
        data: {
          activity_id: activityId,
          sent_count: body.recipients?.length || 0,
        },
      });
    }
  ),

  /**
   * 获取活动参与者列表（旧接口兼容）
   * GET /api/event-participants/:id
   */
  http.get("/api/event-participants/:id", async ({ params, request }) => {
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
    const enrollments = getEnrollmentsByActivityId(id as string);
    const stats = getEnrollmentStats(id as string);

    return HttpResponse.json({
      success: true,
      message: "获取成功",
      participants: enrollments,
      total: enrollments.length,
      statistics: stats,
    });
  }),
];
