import { api } from "@/services/api";

export interface DiscoverableUser {
  id: string;
  name: string;
  avatar: string | null;
  age: number | null;
  city: string | null;
  occupation: string | null;
  industry: string | null;
  bio: string | null;
  tags: string[];
  /** 与当前用户共同的兴趣标签数 */
  sharedTagCount?: number;
}

export interface DiscoverUsersResponse {
  success: boolean;
  data?: {
    users: DiscoverableUser[];
    nextCursor: string | null;
    hasMore: boolean;
  };
  message?: string;
}

export async function listDiscoverableUsers(params?: {
  cursor?: string | null;
  limit?: number;
  keyword?: string;
}): Promise<DiscoverUsersResponse> {
  return api.get("/api/user/discover-users", {
    params: {
      cursor: params?.cursor || undefined,
      limit: params?.limit ?? 20,
      keyword: params?.keyword || undefined,
    },
  });
}
