/**
 * UserHoverCard 类型定义
 */

export interface UserBrief {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  occupation?: string;
  city?: string;
  tags?: string[];
}

export interface UserHoverCardProps {
  /** 用户简要信息 */
  user: UserBrief;
  /** 匹配度分数 (0-100)，可选 */
  matchScore?: number;
  /** 子元素（触发器，通常是头像） */
  children: React.ReactNode;
  /** 卡片位置 */
  placement?: "top" | "bottom" | "left" | "right";
  /** 是否禁用悬浮 */
  disabled?: boolean;
  /** 点击查看详情回调 */
  onViewProfile?: (userId: string) => void;
  /** 额外的类名 */
  className?: string;
}

export interface UserCardContentProps {
  /** 用户简要信息 */
  user: UserBrief;
  /** 匹配度分数 (0-100)，可选 */
  matchScore?: number;
  /** 点击查看详情回调 */
  onViewProfile?: () => void;
  /** 额外的类名 */
  className?: string;
}
