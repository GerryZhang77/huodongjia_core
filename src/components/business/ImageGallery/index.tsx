/**
 * 九宫格图片画廊组件
 * 用于展示活动图片，支持 1-9 张图片的智能布局
 * 采用业界通用的九宫格布局方案（Instagram/微信朋友圈风格）
 */

import { FC, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface ImageGalleryProps {
  /** 图片 URL 数组（最多 9 张） */
  images: string[];
  /** 图片间距 */
  gap?: number;
  /** 是否显示图片数量指示器（当超过显示数量时） */
  showOverlay?: boolean;
  /** 最大显示数量 */
  maxDisplay?: number;
  /** 点击图片回调 */
  onImageClick?: (index: number) => void;
  /** 组件尺寸模式 */
  size?: "small" | "medium" | "large";
}

/**
 * 图片预览弹窗组件
 */
interface ImageViewerProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const ImageViewer: FC<ImageViewerProps> = ({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <X size={20} className="text-white" />
      </button>

      {/* 上一张 */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
      )}

      {/* 图片 */}
      <img
        src={images[currentIndex]}
        alt={`图片 ${currentIndex + 1}`}
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* 下一张 */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      )}

      {/* 图片指示器 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
        <span className="text-white text-sm">
          {currentIndex + 1} / {images.length}
        </span>
      </div>
    </div>
  );
};

/**
 * 九宫格图片画廊组件
 */
export const ImageGallery: FC<ImageGalleryProps> = ({
  images,
  gap = 4,
  showOverlay = true,
  maxDisplay = 9,
  onImageClick,
  size = "medium",
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  // 限制显示的图片数量
  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;
  const count = displayImages.length;

  // 根据尺寸模式设置基础尺寸
  const sizeConfig = {
    small: { base: 60, gap: 2 },
    medium: { base: 80, gap: 4 },
    large: { base: 100, gap: 6 },
  };

  const config = sizeConfig[size];

  // 处理图片点击
  const handleImageClick = (index: number) => {
    if (onImageClick) {
      onImageClick(index);
    } else {
      setCurrentViewIndex(index);
      setViewerOpen(true);
    }
  };

  // 查看器导航
  const handlePrev = () => {
    setCurrentViewIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentViewIndex((prev) => Math.min(images.length - 1, prev + 1));
  };

  // 如果没有图片，返回空
  if (count === 0) {
    return null;
  }

  // 单图布局
  if (count === 1) {
    return (
      <>
        <div className="w-full">
          <div
            className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => handleImageClick(0)}
          >
            <img
              src={displayImages[0]}
              alt="活动图片"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
        {viewerOpen && (
          <ImageViewer
            images={images}
            currentIndex={currentViewIndex}
            onClose={() => setViewerOpen(false)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </>
    );
  }

  // 两图布局：2 列等分
  if (count === 2) {
    return (
      <>
        <div
          className={`grid grid-cols-2 gap-${config.gap}`}
          style={{ gap: `${gap}px` }}
        >
          {displayImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image}
                alt={`活动图片 ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
        {viewerOpen && (
          <ImageViewer
            images={images}
            currentIndex={currentViewIndex}
            onClose={() => setViewerOpen(false)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </>
    );
  }

  // 三图布局：3 列等分
  if (count === 3) {
    return (
      <>
        <div className="grid grid-cols-3" style={{ gap: `${gap}px` }}>
          {displayImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image}
                alt={`活动图片 ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
        {viewerOpen && (
          <ImageViewer
            images={images}
            currentIndex={currentViewIndex}
            onClose={() => setViewerOpen(false)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </>
    );
  }

  // 四图布局：2x2 网格
  if (count === 4) {
    return (
      <>
        <div className="grid grid-cols-2" style={{ gap: `${gap}px` }}>
          {displayImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image}
                alt={`活动图片 ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
        {viewerOpen && (
          <ImageViewer
            images={images}
            currentIndex={currentViewIndex}
            onClose={() => setViewerOpen(false)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </>
    );
  }

  // 5-9 图布局：3 列网格
  return (
    <>
      <div className="grid grid-cols-3" style={{ gap: `${gap}px` }}>
        {displayImages.map((image, index) => {
          const isLast = index === displayImages.length - 1;
          const showRemaining = isLast && remainingCount > 0 && showOverlay;

          return (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image}
                alt={`活动图片 ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {showRemaining && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {viewerOpen && (
        <ImageViewer
          images={images}
          currentIndex={currentViewIndex}
          onClose={() => setViewerOpen(false)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </>
  );
};

export default ImageGallery;
