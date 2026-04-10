/**
 * 用户侧匹配结果 API 服务
 */

import { api } from "@/services/api";

/**
 * 获取用户的最佳匹配列表（TopK）
 *
 * @param eventId - 活动 ID
 * @returns 最佳匹配用户列表
 */
export async function getBestMatches(eventId: string) {
  const response = await api.get(`/api/match/${eventId}/best-matches`);

  // 注意：api.get 已经通过拦截器返回了 response.data
  // 所以这里的 response 就是后端返回的数据对象
  console.log("[matchApi] getBestMatches 原始响应:", response);

  return response;
}

/**
 * 获取活动参与者列表
 *
 * @param eventId - 活动 ID
 * @returns 参与者列表
 */
export async function getParticipants(eventId: string) {
  const response = await api.get(`/api/match/${eventId}/participants`);
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

/**
 * 获取用户的分组信息（匹配结果）
 *
 * @param eventId - 活动 ID
 * @returns 用户的分组信息
 */
export async function getMyGroup(eventId: string) {
  const response = await api.get(`/api/match/${eventId}/results`);
  console.log("[matchApi] getMyGroup 原始响应:", response);
  return response;
}
