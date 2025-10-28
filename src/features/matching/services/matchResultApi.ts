/**
 * 匹配结果 API 服务
 *
 * 提供获取和发布匹配结果的 API 调用
 */

import { api } from "@/lib/api";
import type {
  GetMatchResultResponse,
  PublishMatchResultRequest,
  PublishMatchResultResponse,
  MatchResultError,
} from "../types/matchResult";

/**
 * 获取活动的匹配结果
 *
 * @param activityId - 活动 ID
 * @returns 匹配结果数据
 * @throws 当 API 调用失败时抛出错误
 *
 * @example
 * ```typescript
 * const result = await getMatchResult('evt_123');
 * console.log(result.data.groups);
 * ```
 */
export async function getMatchResult(
  activityId: string
): Promise<GetMatchResultResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await api.get<any>(`/api/match-groups/${activityId}`);

  const data = response.data;

  // 调试日志：查看实际返回的数据结构
  console.log("[matchResultApi] 获取匹配结果响应:", data);

  // 处理两种响应格式：
  // 1. 标准格式: {success: true, data: {...}}
  // 2. Mock格式: 直接返回数据对象 {activityId, groups, ...}

  // 检查是否是标准格式
  if (data.success === true) {
    return data as GetMatchResultResponse;
  }

  // 检查是否是错误响应
  if (data.success === false && data.error) {
    const error = data as MatchResultError;
    throw new Error(error.error?.message || "获取匹配结果失败");
  }

  // Mock格式：直接是数据对象，需要包装成标准格式
  if (data.activityId && data.groups) {
    console.log("[matchResultApi] 检测到Mock格式，转换为标准格式");
    return {
      success: true,
      data: data,
    };
  }

  // 未知格式
  console.error("[matchResultApi] 未知的响应格式:", data);
  throw new Error("获取匹配结果失败: 响应格式不正确");
}

/**
 * 发布匹配结果
 *
 * @param activityId - 活动 ID
 * @param request - 发布请求数据
 * @returns 发布结果
 * @throws 当 API 调用失败时抛出错误
 *
 * @example
 * ```typescript
 * const result = await publishMatchResult('evt_123', {
 *   groups: [...],
 *   ungroupedMembers: [...],
 *   sendNotification: true
 * });
 * console.log(result.message);
 * ```
 */
export async function publishMatchResult(
  activityId: string,
  request: PublishMatchResultRequest
): Promise<PublishMatchResultResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await api.post<any>(
    `/api/match-groups/${activityId}/publish`,
    request
  );

  const data = response.data;

  console.log("[matchResultApi] 发布匹配结果响应:", data);

  // 处理两种响应格式
  if (data.success === true) {
    return data as PublishMatchResultResponse;
  }

  if (data.success === false && data.error) {
    const error = data as MatchResultError;
    throw new Error(error.error?.message || "发布匹配结果失败");
  }

  // Mock格式：检查是否有发布相关的字段
  if (data.publishedAt || data.totalGroups !== undefined) {
    console.log("[matchResultApi] 检测到Mock格式，转换为标准格式");
    return {
      success: true,
      message: data.message || "发布成功",
      data: data,
    };
  }

  console.error("[matchResultApi] 未知的响应格式:", data);
  throw new Error("发布匹配结果失败: 响应格式不正确");
}
