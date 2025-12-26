/**
 * ActivityCard 组件类型定义
 */

import type { UserActivity } from "@/mocks/data/user-activities";

/**
 * ActivityCard Props
 */
export interface ActivityCardProps {
  /** 活动数据 */
  activity: UserActivity;
  /** 点击事件 */
  onClick?: (id: string) => void;
  /** 是否显示用户状态 */
  showUserStatus?: boolean;
  /** 是否显示收藏按钮 */
  showFavorite?: boolean;
  /** 收藏状态 */
  isFavorited?: boolean;
  /** 收藏/取消收藏回调 */
  onToggleFavorite?: (id: string) => void;
  /** 是否编辑模式 */
  editMode?: boolean;
  /** 删除回调 */
  onRemove?: (id: string) => void;
  /** 自定义类名 */
  className?: string;
}
