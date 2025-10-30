/**
 * Participants API Service
 * 参与者 API 服务
 */

import { api } from "@/lib/api";
import {
  CreateParticipantsRequest,
  CreateParticipantsResponse,
} from "../types";

/**
 * 参与者 API
 */
export const participantsApi = {
  /**
   * 创建参与者（批量导入报名）
   * @param eventId - 活动 ID
   * @param payload - 导入请求数据（文件路径和字段映射）
   * @returns 导入结果
   */
  createParticipants: async (
    eventId: string,
    payload: CreateParticipantsRequest
  ): Promise<CreateParticipantsResponse> => {
    const response = await api.post<CreateParticipantsResponse>(
      `/api/events/${eventId}/participants`,
      payload
    );

    return response;
  },
};
