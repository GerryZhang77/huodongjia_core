/**
 * C端活动浏览 - 类型定义
 */

import type {
  ActivityListItem,
  ActivityQueryParams,
} from "@/features/shared/activity/types";

/**
 * 活动分类
 */
export interface ActivityCategory {
  id: string;
  name: string;
  icon?: string;
  count?: number;
}

/**
 * 用户活动筛选参数
 */
export interface UserActivityFilterParams extends ActivityQueryParams {
  city?: string;
  distance?: number; // 距离筛选 (km)
  priceRange?: [number, number];
  sortBy?: "time" | "distance" | "popularity";
}

/**
 * 用户活动列表项 (增加用户相关信息)
 */
export interface UserActivityListItem extends ActivityListItem {
  isFavorited?: boolean; // 是否已收藏
  isEnrolled?: boolean; // 是否已报名
  distance?: number; // 距离 (km)
}

/**
 * 用户活动列表响应
 */
export interface UserActivityListResponse {
  success: boolean;
  activities: UserActivityListItem[];
  total: number;
  page: number;
  pageSize: number;
  categories?: ActivityCategory[];
}

/**
 * 收藏活动响应
 */
export interface FavoriteActivityResponse {
  success: boolean;
  isFavorited: boolean;
}
