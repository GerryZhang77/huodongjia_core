import { api } from "@/services/api";

export interface EventRecap {
  id: string;
  eventId: string;
  organizerId: string;
  title: string | null;
  content: string | null;
  images: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecapAccess {
  canView: boolean;
  isOrganizer: boolean;
  hasRecap: boolean;
}

/**
 * 查询当前用户对该活动回顾的可见性 + 是否存在
 */
export const getRecapAccess = (eventId: string) =>
  api.get<{ success: boolean; data: RecapAccess }>(
    `/api/events/${eventId}/recap/access`,
  );

/**
 * 拉取回顾内容（403 时表示无权限）
 */
export const getRecap = (eventId: string) =>
  api.get<{
    success: boolean;
    data: { recap: EventRecap | null; isOrganizer?: boolean };
    message?: string;
  }>(`/api/events/${eventId}/recap`);

/**
 * 创建/更新回顾（仅商家本人）
 * publish=true → 立即发布；false 或不传 → 草稿
 */
export const upsertRecap = (
  eventId: string,
  payload: {
    title?: string | null;
    content?: string | null;
    images?: string[];
    publish?: boolean;
  },
) =>
  api.put<{ success: boolean; data?: { recap: EventRecap }; message?: string }>(
    `/api/events/${eventId}/recap`,
    payload,
  );

export const deleteRecap = (eventId: string) =>
  api.delete<{ success: boolean }>(`/api/events/${eventId}/recap`);
