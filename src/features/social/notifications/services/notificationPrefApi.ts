import { api } from "@/services/api/client";

// ========================================
// 类型
// ========================================

export interface NotificationPreferences {
  push_enabled: boolean;
  sound_enabled: boolean;
  type_settings: Record<string, boolean>; // 各类型开关：message/follow/enrollment...
  dnd_enabled: boolean;
  dnd_start: string | null; // 'HH:MM' or 'HH:MM:SS'
  dnd_end: string | null;
}

export interface NotificationMute {
  id: string;
  muted_user_id: string;
  mute_message: boolean;
  mute_activity: boolean;
  created_at: string;
  user: {
    id: string;
    name: string | null;
    avatar?: string | null;
    account?: string | null;
    user_type?: string;
  } | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ========================================
// API
// ========================================

export async function getPreferences(): Promise<NotificationPreferences> {
  const res = await api.get<ApiResponse<NotificationPreferences>>(
    "/api/notification/preferences",
  );
  return res.data;
}

export async function updatePreferences(
  body: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const res = await api.put<ApiResponse<NotificationPreferences>>(
    "/api/notification/preferences",
    body,
  );
  return res.data;
}

export async function listMutes(): Promise<NotificationMute[]> {
  const res = await api.get<ApiResponse<{ list: NotificationMute[] }>>(
    "/api/notification/mutes",
  );
  return res.data.list;
}

export async function muteUser(
  userId: string,
  body?: { mute_message?: boolean; mute_activity?: boolean },
): Promise<void> {
  await api.post<ApiResponse<NotificationMute>>(
    `/api/notification/mutes/${userId}`,
    body ?? {},
  );
}

export async function unmuteUser(userId: string): Promise<void> {
  await api.delete<ApiResponse<null>>(`/api/notification/mutes/${userId}`);
}
