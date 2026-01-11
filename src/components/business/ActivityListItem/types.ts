/**
 * ActivityListItem 组件类型定义
 */

import type { UserActivity } from "@/mocks/data/user-activities";

/**
 * ActivityListItem Props
 */
export interface ActivityListItemProps {
  /** 活动数据 */
  activity: UserActivity;
  /** 点击事件 */
  onClick?: (id: string) => void;
  /** 尺寸变体 */
  size?: "compact" | "default" | "large";
  /** 是否显示用户状态 */
  showUserStatus?: boolean;
  /** 自定义类名 */
  className?: string;
}
