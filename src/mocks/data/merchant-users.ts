/**
 * 商家用户池 Mock 数据
 *
 * 从现有 enrollment 数据聚合生成
 * 包含自定义标签和推送相关数据
 */

import { mockEnrollments } from "./enrollments";
import { mockMerchantActivities } from "./merchant";
import { aggregateUsersFromEnrollments } from "@/features/merchant/user-pool/utils";
import type {
  CustomTag,
  UserPoolStats,
  MerchantUser,
} from "@/features/merchant/user-pool/types";

// ========================================
// 自定义标签 Mock
// ========================================

export const mockCustomTags: CustomTag[] = [
  {
    id: "tag_001",
    name: "高价值用户",
    color: "secondary",
    createdAt: "2025-01-10T10:00:00Z",
    userCount: 5,
  },
  {
    id: "tag_002",
    name: "种子用户",
    color: "accent",
    createdAt: "2025-01-12T14:00:00Z",
    userCount: 3,
  },
  {
    id: "tag_003",
    name: "社交达人",
    color: "primary",
    createdAt: "2025-01-15T09:00:00Z",
    userCount: 4,
  },
  {
    id: "tag_004",
    name: "KOL/KOC",
    color: "warning",
    createdAt: "2025-01-18T16:00:00Z",
    userCount: 2,
  },
  {
    id: "tag_005",
    name: "待跟进",
    color: "error",
    createdAt: "2025-01-20T11:00:00Z",
    userCount: 6,
  },
  {
    id: "tag_006",
    name: "企业客户",
    color: "success",
    createdAt: "2025-02-01T10:00:00Z",
    userCount: 3,
  },
];

// ========================================
// 自定义标签映射 (userId -> tagNames[])
// ========================================

export const customTagsMap: Record<string, string[]> = {
  user_101: ["高价值用户", "社交达人"],
  user_102: ["高价值用户", "KOL/KOC"],
  user_103: ["种子用户"],
  user_104: ["高价值用户", "种子用户"],
  user_201: ["社交达人", "高价值用户"],
  user_205: ["高价值用户", "企业客户"],
  user_209: ["种子用户", "KOL/KOC"],
  user_213: ["企业客户", "高价值用户"],
  user_218: ["社交达人", "KOL/KOC"],
  user_001: ["待跟进"],
  user_002: ["待跟进", "社交达人"],
  user_005: ["企业客户"],
};

// ========================================
// 聚合生成用户池数据
// ========================================

/**
 * 获取商家所有活动的报名数据
 * 仅包含 ma_ 前缀的活动（商家自己的活动）
 */
function getMerchantEnrollments() {
  const merchantActivityIds = mockMerchantActivities.map((a) => a.id);
  return mockEnrollments.filter((e) =>
    merchantActivityIds.includes(e.activity_id),
  );
}

/** 商家用户池（聚合后） */
export const mockMerchantUsers: MerchantUser[] = aggregateUsersFromEnrollments(
  getMerchantEnrollments(),
  customTagsMap,
);

// ========================================
// 统计数据
// ========================================

export function getMerchantUserPoolStats(): UserPoolStats {
  const users = mockMerchantUsers;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    totalUsers: users.length,
    activeUsers: users.filter(
      (u) => new Date(u.lastParticipatedAt) > thirtyDaysAgo,
    ).length,
    newUsersThisMonth: users.filter(
      (u) => new Date(u.firstParticipatedAt) > thisMonthStart,
    ).length,
    avgParticipation:
      users.length > 0
        ? Math.round(
            (users.reduce((sum, u) => sum + u.participationCount, 0) /
              users.length) *
              10,
          ) / 10
        : 0,
  };
}

/**
 * 获取指定活动的用户列表
 */
export function getUsersByActivityId(activityId: string): MerchantUser[] {
  const activityEnrollments = mockEnrollments.filter(
    (e) => e.activity_id === activityId,
  );
  return aggregateUsersFromEnrollments(activityEnrollments, customTagsMap);
}
