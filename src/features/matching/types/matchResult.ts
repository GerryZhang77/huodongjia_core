/**
 * 匹配结果类型定义
 *
 * 基于 OpenAPI 文档: 匹配结果发布.openapi.json
 * API 路径: /api/match-groups/{activityId}
 */

/**
 * 分组成员信息
 */
export interface GroupMember {
  /** 报名记录 ID */
  enrollmentId: string;

  /** 成员姓名 */
  name: string;

  /** 在组内的位置（用于排序） */
  position?: number;

  /** 成员头像 URL */
  avatar?: string;

  /** 成员标签 */
  tags?: string[];
}

/**
 * 匹配分组
 */
export interface MatchGroup {
  /** 分组唯一标识 */
  groupId: string;

  /** 分组名称 */
  groupName: string;

  /** 组内成员列表 */
  members: GroupMember[];

  /** 是否锁定该分组（锁定后重新匹配时不会改变） */
  isLocked: boolean;

  /** 匹配得分（0-100） */
  score?: number;
}

/**
 * 未分组成员
 */
export interface UngroupedMember {
  /** 报名记录 ID */
  enrollmentId: string;

  /** 成员姓名 */
  name: string;

  /** 成员头像 URL */
  avatar?: string;

  /** 成员标签 */
  tags?: string[];

  /** 推荐加入的分组建议（可选，仅在前端展示） */
  suggestedGroups?: Array<{
    groupId: string;
    groupName: string;
    scoreIncrease: number; // 加入后该组的得分增益
  }>;
}

/**
 * 匹配统计信息
 */
export interface MatchStatistics {
  /** 总分组数 */
  totalGroups: number;

  /** 已分组成员总数 */
  totalMembers: number;

  /** 未分组成员数 */
  ungroupedCount: number;

  /** 平均匹配得分 */
  averageScore: number;

  /** 最低得分 */
  minScore: number;

  /** 最高得分 */
  maxScore: number;
}

/**
 * 匹配结果数据
 */
export interface MatchResultData {
  /** 活动 ID */
  activityId: string;

  /** 匹配时间 */
  matchedAt: string;

  /** 是否已发布 */
  isPublished: boolean;

  /** 所有分组 */
  groups: MatchGroup[];

  /** 未分组成员 */
  ungroupedMembers: UngroupedMember[];

  /** 统计信息 */
  statistics: MatchStatistics;
}

/**
 * 获取匹配结果 - API 响应
 */
export interface GetMatchResultResponse {
  success: boolean;
  data: MatchResultData;
}

/**
 * 发布匹配结果 - API 请求
 */
export interface PublishMatchResultRequest {
  /** 所有分组信息（包括锁定和未锁定的） */
  groups: MatchGroup[];

  /** 未分组的成员列表 */
  ungroupedMembers?: UngroupedMember[];

  /** 是否发送通知给参与者 */
  sendNotification: boolean;
}

/**
 * 发布匹配结果 - API 响应数据
 */
export interface PublishMatchResultData {
  /** 发布时间 */
  publishedAt: string;

  /** 总分组数 */
  totalGroups: number;

  /** 总成员数 */
  totalMembers: number;

  /** 未分组成员数 */
  ungroupedCount: number;

  /** 通知发送状态 */
  notificationStatus?: {
    sent: boolean;
    successCount: number;
    failedCount: number;
  };
}

/**
 * 发布匹配结果 - API 响应
 */
export interface PublishMatchResultResponse {
  success: boolean;
  message: string;
  data: PublishMatchResultData;
}

/**
 * API 错误响应
 */
export interface MatchResultError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
