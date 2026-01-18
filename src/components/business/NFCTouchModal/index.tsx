/**
 * NFCTouchModal - NFC 碰一碰弹窗组件
 *
 * 展示 NFC 碰一碰的动画效果和操作指引
 *
 * @example
 * ```tsx
 * <NFCTouchModal
 *   open={showNFC}
 *   onClose={() => setShowNFC(false)}
 *   activityId="act_001"
 * />
 * ```
 */

import { FC } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui";
import { NFCAnimation } from "./NFCAnimation";
import type { NFCTouchModalProps } from "./types";

// NFC 指引项
const nfcGuideItems = [
  {
    icon: "📱",
    label: "iPhone",
    description: "触碰机身顶部",
  },
  {
    icon: "📱",
    label: "安卓/华为",
    description: "触碰机身背部",
  },
  {
    icon: "🌐",
    label: "自动跳转",
    description: "自动打开浏览器跳转",
  },
  {
    icon: "💡",
    label: "轻量体验",
    description: "轻量网页 · 无需 App",
  },
];

/**
 * NFCTouchModal 组件
 */
export const NFCTouchModal: FC<NFCTouchModalProps> = ({
  open,
  onClose,
  // activityId 预留用于未来扩展（如记录 NFC 匹配日志）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activityId: _activityId,
  className,
}) => {
  if (!open) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal 内容 */}
      <div
        className={clsx(
          "fixed inset-x-4 top-1/2 -translate-y-1/2 z-[1001]",
          "max-w-md mx-auto",
          "bg-white dark:bg-gray-800 rounded-2xl",
          "shadow-2xl",
          "animate-scale-in",
          className
        )}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
          aria-label="关闭"
        >
          <X size={20} className="text-gray-400" />
        </button>

        {/* 内容区域 */}
        <div className="px-6 pt-8 pb-6">
          {/* 标题 */}
          <h2 className="text-center text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            NFC 碰一碰
          </h2>

          {/* 动画区域 */}
          <div className="flex justify-center my-6">
            <NFCAnimation isAnimating={true} />
          </div>

          {/* 描述文案 */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            手机碰一碰对方的 NFC，
            <br />
            基于兴趣与方向的相似度计算，
            <br />
            活动现场快速发现同频点。
          </p>

          {/* 分割线 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              NFC 触碰指南
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* 指引列表 */}
          <div className="space-y-3 mb-6">
            {nfcGuideItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.label}
                  </span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 底部按钮 */}
          <Button
            variant="primary"
            size="large"
            block
            onClick={onClose}
            className="rounded-[22px]"
          >
            知道了
          </Button>
        </div>
      </div>
    </>
  );
};

export { NFCAnimation } from "./NFCAnimation";
export type { NFCTouchModalProps, NFCAnimationProps } from "./types";
export default NFCTouchModal;
