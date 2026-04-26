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
  /** 鼠标进入事件（用于详情预拉） */
  onMouseEnter?: (id: string) => void;
  /** 是否显示用户状态 */
  showUserStatus?: boolean;
  /** 是否显示收藏按钮（外部受控；当传入 onToggleFavorite 时启用） */
  showFavorite?: boolean;
  /** 外部受控的收藏状态 */
  isFavorited?: boolean;
  /** 外部受控的收藏/取消收藏回调 */
  onToggleFavorite?: (id: string) => void;
  /**
   * 是否启用内置快捷收藏按钮（默认 true）。
   * 不需要外部传 isFavorited / onToggleFavorite，组件内部用 useToggleFavorite，
   * 自动从 activity.isFavorite 读初始状态。
   * 商家端等场景可显式设为 false 关闭。
   */
  enableQuickFavorite?: boolean;
  /** 是否编辑模式 */
  editMode?: boolean;
  /** 删除回调 */
  onRemove?: (id: string) => void;
  /** 自定义类名 */
  className?: string;
  /**
   * 高优先级：列表首屏前几张应设为 true。
   * - true: loading="eager" + fetchpriority="high"，确保首屏图片立刻并发解析
   * - false（默认）: loading="lazy" + decoding="async"，滚动接近时再加载
   */
  priority?: boolean;
}
