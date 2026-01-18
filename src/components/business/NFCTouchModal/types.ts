/**
 * NFCTouchModal 类型定义
 */

export interface NFCTouchModalProps {
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 活动 ID (用于生成 NFC 链接) */
  activityId?: string;
  /** 额外的类名 */
  className?: string;
}

export interface NFCAnimationProps {
  /** 是否播放动画 */
  isAnimating?: boolean;
  /** 额外的类名 */
  className?: string;
}
