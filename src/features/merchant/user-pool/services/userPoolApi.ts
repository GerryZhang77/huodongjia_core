import { api } from "@/services/api";

// =====================================================================
// 我的用户 / 发现用户 / 配额
// =====================================================================

export const getMerchantUserPool = (page = 1, pageSize = 50) =>
  api.get("/api/merchant/user-pool", { params: { page, pageSize } });

export const getPlatformUsers = (page = 1, pageSize = 50, keyword?: string) =>
  api.get("/api/merchant/platform-users", { params: { page, pageSize, keyword } });

export const getDiscoveryQuota = () =>
  api.get("/api/merchant/discovery-quota");

// =====================================================================
// 自定义标签 CRUD
// =====================================================================

export const listCustomTags = () =>
  api.get<{
    success: boolean;
    data: { tags: Array<{ id: string; name: string; color: string; userCount: number; createdAt: string }> };
  }>("/api/merchant/user-pool/tags");

export const createCustomTag = (name: string, color: string) =>
  api.post<{
    success: boolean;
    data: { tag: { id: string; name: string; color: string; userCount: number; createdAt: string } };
  }>("/api/merchant/user-pool/tags", { name, color });

export const deleteCustomTag = (tagId: string) =>
  api.delete<{ success: boolean }>(`/api/merchant/user-pool/tags/${tagId}`);

// =====================================================================
// 批量操作
// =====================================================================

export const batchTagUsers = (userIds: string[], tagIds: string[]) =>
  api.post<{
    success: boolean;
    data?: { taggedUsers: number; taggedTags: number; illegalUserIds?: string[] };
    message?: string;
  }>("/api/merchant/user-pool/users/batch-tag", { userIds, tagIds });

export const removeUserTag = (userId: string, tagId: string) =>
  api.delete<{ success: boolean }>(
    `/api/merchant/user-pool/users/${userId}/tags/${tagId}`,
  );

export const pushActivityToUsers = (
  userIds: string[],
  activityId: string,
  message?: string,
  channels: Array<"notification"> = ["notification"],
) =>
  api.post<{
    success: boolean;
    data?: { pushedCount: number; skippedCount: number };
    message?: string;
  }>("/api/merchant/user-pool/push-activity", { userIds, activityId, message, channels });

// =====================================================================
// 发现池操作
// =====================================================================

export const unlockDiscoveryUser = (userId: string) =>
  api.post<{
    success: boolean;
    data?: { alreadyUnlocked?: boolean; quota?: unknown };
    message?: string;
  }>(`/api/merchant/user-pool/discovery/unlock/${userId}`);

export const toggleDiscoveryFavorite = (userId: string) =>
  api.post<{ success: boolean; data?: { isFavorited: boolean } }>(
    `/api/merchant/user-pool/discovery/favorite/${userId}`,
  );

export const inviteDiscoveryUser = (
  userId: string,
  activityId: string,
  message?: string,
) =>
  api.post<{ success: boolean; message?: string }>(
    `/api/merchant/user-pool/discovery/invite/${userId}`,
    { activityId, message },
  );
