import { api } from "@/services/api/client";

// ========================================
// 类型定义
// ========================================

export interface SocialUserBrief {
  id: string;
  name: string | null;
  avatar?: string | null;
  account?: string | null;
  user_type?: string;
  bio?: string | null;
  followedAt?: string;
}

export interface FollowRelation {
  isSelf: boolean;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isFriend: boolean;
}

export interface SocialStats {
  followersCount: number;
  followingCount: number;
  friendsCount: number;
}

export interface PaginatedUserList {
  list: SocialUserBrief[];
  total: number;
  page: number;
  pageSize: number;
}

// ========================================
// API 响应包装类型
// ========================================

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ========================================
// API 函数
// ========================================

export async function followUser(userId: string): Promise<void> {
  await api.post<ApiResponse<null>>(`/api/social/follows/${userId}`);
}

export async function unfollowUser(userId: string): Promise<void> {
  await api.delete<ApiResponse<null>>(`/api/social/follows/${userId}`);
}

export async function getRelation(userId: string): Promise<FollowRelation> {
  const res = await api.get<ApiResponse<FollowRelation>>(
    `/api/social/follows/${userId}/relation`,
  );
  return res.data;
}

export async function getFollowers(
  userId: string,
  params?: { page?: number; pageSize?: number },
): Promise<PaginatedUserList> {
  const res = await api.get<ApiResponse<PaginatedUserList>>(
    `/api/social/users/${userId}/followers`,
    { params },
  );
  return res.data;
}

export async function getFollowing(
  userId: string,
  params?: { page?: number; pageSize?: number },
): Promise<PaginatedUserList> {
  const res = await api.get<ApiResponse<PaginatedUserList>>(
    `/api/social/users/${userId}/following`,
    { params },
  );
  return res.data;
}

export async function getFriends(
  userId: string,
): Promise<{ list: SocialUserBrief[]; total: number }> {
  const res = await api.get<
    ApiResponse<{ list: SocialUserBrief[]; total: number }>
  >(`/api/social/users/${userId}/friends`);
  return res.data;
}

export async function getSocialStats(userId: string): Promise<SocialStats> {
  const res = await api.get<ApiResponse<SocialStats>>(
    `/api/social/users/${userId}/social-stats`,
  );
  return res.data;
}
