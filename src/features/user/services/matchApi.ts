/**
 * 用户侧匹配结果 API 服务
 */

import { api } from "@/services/api";
import { AxiosError } from "axios";

/**
 * 获取用户的最佳匹配列表（TopK）
 *
 * 404（"未找到最佳匹配记录"）在业务上等同于"尚未匹配"——
 * 统一降级为空数据，由调用方走空态 UI，而不是报错 Toast。
 *
 * @param eventId - 活动 ID
 * @returns 最佳匹配用户列表（或空数组）
 */
export async function getBestMatches(eventId: string) {
  try {
    const response = await api.get(`/api/match/${eventId}/best-matches`);
    console.log("[matchApi] getBestMatches 原始响应:", response);
    return response;
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 404) {
      console.info("[matchApi] getBestMatches: 该用户尚未在此活动中被匹配，按空态处理");
      return { success: true, data: [], message: "尚未匹配" };
    }
    throw err;
  }
}

/**
 * 获取活动参与者列表
 *
 * 注意：后端默认 pageSize=20，而本接口用于把 best-matches 返回的 user_id
 * 映射成完整参与者信息。报名人数 >20 时若不显式传大分页，top5 里排名靠后、
 * 报名较早的用户会落在第二页之后，在前端被无声过滤掉，导致展示少于应有数量。
 * 这里与商户侧 / 匹配管理侧保持一致，传 pageSize=1000 拉取全量。
 *
 * @param eventId - 活动 ID
 * @returns 参与者列表
 */
export async function getParticipants(eventId: string) {
  const response = await api.get(`/api/enrollments/${eventId}`, {
    params: { page: 1, pageSize: 1000 },
  });
  console.log("[matchApi] getParticipants 原始响应:", response);
  return response;
}

/**
 * 获取用户的匹配寄语
 *
 * @param eventId - 活动 ID
 * @param userId - 用户 ID
 * @returns 匹配寄语
 */
export async function getMatchMessage(eventId: string, userId: string) {
  const response = await api.get(`/api/match/${eventId}/${userId}/match_message`);
  return response;
}

