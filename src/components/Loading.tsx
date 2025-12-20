import { SpinLoading, DotLoading } from "antd-mobile";
import { FC } from "react";

interface LoadingProps {
  /** 是否全屏显示 */
  fullScreen?: boolean;
  /** 加载提示文字 */
  tip?: string;
  /** 加载动画大小 */
  size?: "small" | "default" | "large";
  /** 使用点状加载动画 */
  dots?: boolean;
}

/**
 * 通用加载组件
 * 支持全屏和局部加载两种模式
 */
export const Loading: FC<LoadingProps> = ({
  fullScreen = false,
  tip,
  size = "default",
  dots = false,
}) => {
  const sizeMap = {
    small: 24,
    default: 32,
    large: 48,
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-2">
      {dots ? (
        <DotLoading color="primary" />
      ) : (
        <SpinLoading
          style={{ "--size": `${sizeMap[size]}px` }}
          color="primary"
        />
      )}
      {tip && <span className="text-sm text-gray-500">{tip}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{content}</div>;
};

export default Loading;
