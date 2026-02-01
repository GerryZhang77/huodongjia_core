/**
 * ImageCarousel - 图片轮播组件
 * 用于活动详情页顶部 Hero 区域的多图轮播展示
 * 支持手势滑动、指示点、左右箭头
 */

import { FC, useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export interface ImageCarouselProps {
  /** 图片数组 */
  images: string[];
  /** 高度类名 (默认 h-56 md:h-72 lg:h-80) */
  heightClass?: string;
  /** 是否显示指示点 (默认 true) */
  showIndicators?: boolean;
  /** 是否显示箭头 (默认 true，PC 端 hover 时显示) */
  showArrows?: boolean;
  /** 自动播放间隔 (ms)，0 表示不自动播放 */
  autoPlayInterval?: number;
  /** 自定义占位内容 */
  placeholder?: React.ReactNode;
  /** 图片点击回调 */
  onImageClick?: (index: number) => void;
  /** 自定义类名 */
  className?: string;
  /** 渲染覆盖层内容 (如返回按钮、状态标签等) */
  renderOverlay?: () => React.ReactNode;
}

export const ImageCarousel: FC<ImageCarouselProps> = ({
  images,
  heightClass = "h-56 md:h-72 lg:h-80",
  showIndicators = true,
  showArrows = true,
  autoPlayInterval = 0,
  placeholder,
  onImageClick,
  className = "",
  renderOverlay,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 有效图片数组（过滤空值）
  const validImages = images.filter((img) => img && img.trim() !== "");
  const hasMultipleImages = validImages.length > 1;

  // 切换到上一张
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  }, [validImages.length]);

  // 切换到下一张
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  }, [validImages.length]);

  // 切换到指定索引
  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  // 自动播放
  useEffect(() => {
    if (autoPlayInterval > 0 && hasMultipleImages && !isHovering) {
      const timer = setInterval(goToNext, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [autoPlayInterval, hasMultipleImages, isHovering, goToNext]);

  // 触摸事件处理
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasMultipleImages) {
      goToNext();
    } else if (isRightSwipe && hasMultipleImages) {
      goToPrevious();
    }
  };

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasMultipleImages) return;

      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("keydown", handleKeyDown);
      return () => container.removeEventListener("keydown", handleKeyDown);
    }
  }, [hasMultipleImages, goToPrevious, goToNext]);

  // 无图片时显示占位
  if (validImages.length === 0) {
    return (
      <div
        className={`relative ${heightClass} bg-gradient-to-br from-primary-400 to-primary-600 ${className}`}
      >
        <div className="w-full h-full flex items-center justify-center">
          {placeholder || <Calendar size={48} className="text-white/50" />}
        </div>
        {renderOverlay && renderOverlay()}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${heightClass} overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
      role="region"
      aria-label="图片轮播"
      aria-roledescription="carousel"
    >
      {/* 图片容器 */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {validImages.map((image, index) => (
          <div
            key={index}
            className="w-full h-full flex-shrink-0"
            onClick={() => onImageClick?.(index)}
          >
            <img
              src={image}
              alt={`图片 ${index + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* 渐变遮罩 - 用于上层内容可见性 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* 左右箭头 (PC 端 hover 时显示) */}
      {showArrows && hasMultipleImages && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white transition-opacity duration-200 hover:bg-black/50 ${
              isHovering ? "opacity-100" : "opacity-0 md:opacity-0"
            } focus:opacity-100`}
            aria-label="上一张"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white transition-opacity duration-200 hover:bg-black/50 ${
              isHovering ? "opacity-100" : "opacity-0 md:opacity-0"
            } focus:opacity-100`}
            aria-label="下一张"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* 指示点 */}
      {showIndicators && hasMultipleImages && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`切换到第 ${index + 1} 张图片`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}

      {/* 图片计数 (移动端显示) */}
      {hasMultipleImages && (
        <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs md:hidden">
          {currentIndex + 1} / {validImages.length}
        </div>
      )}

      {/* 覆盖层内容 (返回按钮、状态标签等) */}
      {renderOverlay && renderOverlay()}
    </div>
  );
};

export default ImageCarousel;
