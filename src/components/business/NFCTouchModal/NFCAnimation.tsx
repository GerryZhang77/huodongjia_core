/**
 * NFCAnimation - NFC 碰一碰动画组件
 * 参考支付宝碰一碰风格的波纹扩散动画
 */

import { FC } from "react";
import { Smartphone, Wifi } from "lucide-react";
import { clsx } from "clsx";
import type { NFCAnimationProps } from "./types";

/**
 * NFC 动画组件
 */
export const NFCAnimation: FC<NFCAnimationProps> = ({
  isAnimating = true,
  className,
}) => {
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center",
        "w-48 h-48",
        className
      )}
    >
      {/* 波纹圈 - 外层 */}
      <div
        className={clsx(
          "absolute w-44 h-44 rounded-full",
          "border-2 border-primary-300/40 dark:border-primary-400/30",
          isAnimating && "animate-ping-slow"
        )}
        style={{ animationDelay: "0s" }}
      />

      {/* 波纹圈 - 中层 */}
      <div
        className={clsx(
          "absolute w-36 h-36 rounded-full",
          "border-2 border-primary-400/50 dark:border-primary-400/40",
          isAnimating && "animate-ping-slow"
        )}
        style={{ animationDelay: "0.3s" }}
      />

      {/* 波纹圈 - 内层 */}
      <div
        className={clsx(
          "absolute w-28 h-28 rounded-full",
          "border-2 border-primary-500/60 dark:border-primary-400/50",
          isAnimating && "animate-ping-slow"
        )}
        style={{ animationDelay: "0.6s" }}
      />

      {/* 中心圆形背景 */}
      <div
        className={clsx(
          "relative z-10 w-20 h-20 rounded-full",
          "bg-gradient-to-br from-primary-400 to-primary-500",
          "shadow-lg shadow-primary-400/40",
          "flex items-center justify-center"
        )}
      >
        {/* 手机图标 + NFC 符号 */}
        <div className="relative">
          <Smartphone size={32} className="text-white" />
          {/* NFC 信号图标 */}
          <div className="absolute -top-1 -right-2">
            <Wifi
              size={16}
              className={clsx("text-white/90", isAnimating && "animate-pulse")}
              style={{ transform: "rotate(-45deg)" }}
            />
          </div>
        </div>
      </div>

      {/* 装饰性光点 */}
      <div className="absolute w-2 h-2 rounded-full bg-primary-400/60 top-4 left-1/3 animate-pulse" />
      <div
        className="absolute w-1.5 h-1.5 rounded-full bg-primary-300/50 bottom-6 right-1/4 animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className="absolute w-1 h-1 rounded-full bg-primary-500/40 top-1/3 right-4 animate-pulse"
        style={{ animationDelay: "1s" }}
      />
    </div>
  );
};

export default NFCAnimation;
