/**
 * HotActivityCarousel 组件类型定义
 */

import type { UserActivity } from "@/mocks/data/user-activities";

/**
 * HotActivityCarousel Props
 */
export interface HotActivityCarouselProps {
  /** 热门活动列表 */
  activities: UserActivity[];
  /** 点击活动回调 */
  onClick?: (id: string) => void;
  /** 是否自动播放 */
  autoplay?: boolean;
  /** 自动播放间隔 (ms) */
  autoplayInterval?: number;
  /** 自定义类名 */
  className?: string;
}

/**
 * 单个轮播卡片 Props
 */
export interface HotActivitySlideProps {
  activity: UserActivity;
  onClick?: () => void;
}
