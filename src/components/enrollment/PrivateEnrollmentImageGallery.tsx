import React, { useMemo, useState } from "react";
import { Image as ImageIcon, LoaderCircle, X } from "lucide-react";
import {
  useEnrollmentImages,
  type LoadedEnrollmentImage,
} from "@/features/enrollment/hooks/useEnrollmentImages";

interface PrivateEnrollmentImageGalleryProps {
  activityId: string;
  participantId: string;
  variant?: "full" | "compact" | "embedded";
  maxImages?: number;
  onOpenFullGallery?: () => void;
}

const PrivateEnrollmentImageGallery: React.FC<
  PrivateEnrollmentImageGalleryProps
> = ({
  activityId,
  participantId,
  variant = "full",
  maxImages,
  onOpenFullGallery,
}) => {
  const isCompact = variant === "compact";
  const isEmbedded = variant === "embedded";
  const isPreview = isCompact || isEmbedded;
  const { images, total, isLoading, isFetching, error } = useEnrollmentImages(
    activityId,
    participantId,
    { contentLimit: isPreview ? (maxImages ?? 4) : undefined },
  );
  const [previewId, setPreviewId] = useState<string | null>(null);
  const preview = images.find((image) => image.id === previewId);

  const groups = useMemo(() => {
    const result = new Map<string, LoadedEnrollmentImage[]>();
    for (const image of images) {
      const label = image.field_label_snapshot || "报名图片";
      result.set(label, [...(result.get(label) || []), image]);
    }
    return Array.from(result.entries());
  }, [images]);

  if (isLoading && images.length === 0) {
    return (
      <div
        className={`${isPreview ? "" : "mb-5"} flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500`}
      >
        <LoaderCircle size={16} className="animate-spin" />
        正在安全加载报名图片…
      </div>
    );
  }
  if (error && images.length === 0) {
    const apiMessage = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    return (
      <div
        className={`${isPreview ? "" : "mb-5"} rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600`}
      >
        {apiMessage || "报名图片加载失败"}
      </div>
    );
  }
  if (images.length === 0) return null;

  if (isPreview) {
    return (
      <div
        className={
          isCompact
            ? "w-72 rounded-xl border border-gray-100 bg-white p-3 shadow-xl"
            : "w-full"
        }
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <ImageIcon size={15} className="text-purple-500" />
            报名图片
            {isFetching && (
              <LoaderCircle size={12} className="animate-spin text-gray-400" />
            )}
          </div>
          <span className="text-[11px] text-gray-400">仅主办方可见</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={onOpenFullGallery}
              className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              title={image.objectUrl ? "打开完整图集" : "图片加载中"}
            >
              {image.objectUrl ? (
                <img
                  src={image.objectUrl}
                  alt={image.original_name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-gray-300">
                  {image.isLoading ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <ImageIcon size={18} />
                  )}
                </span>
              )}
              {index === images.length - 1 && total > images.length && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                  +{total - images.length}
                </span>
              )}
            </button>
          ))}
        </div>
        {onOpenFullGallery && (
          <button
            type="button"
            onClick={onOpenFullGallery}
            className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            查看全部 {total} 张
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-5">
      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
        <ImageIcon size={16} className="text-gray-500" />
        报名图片
        <span className="text-xs font-normal text-gray-400">
          仅本活动主办方可见
        </span>
        {isFetching && !isLoading && (
          <LoaderCircle size={13} className="animate-spin text-gray-400" />
        )}
      </h4>
      <div className="space-y-3 rounded-xl bg-gray-50 p-3">
        {groups.map(([label, fieldImages]) => (
          <div key={label}>
            <div className="mb-1.5 text-xs text-gray-500">{label}</div>
            <div className="grid grid-cols-3 gap-2">
              {fieldImages.map((image) => (
                <button
                  type="button"
                  key={image.id}
                  onClick={() => image.objectUrl && setPreviewId(image.id)}
                  className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white"
                  title={image.objectUrl ? "点击查看大图" : "图片加载中"}
                >
                  {image.objectUrl ? (
                    <img
                      src={image.objectUrl}
                      alt={image.original_name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-gray-300">
                      {image.isLoading ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <ImageIcon size={18} />
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {preview?.objectUrl && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewId(null)}
        >
          <button
            type="button"
            aria-label="关闭大图"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            onClick={() => setPreviewId(null)}
          >
            <X size={22} />
          </button>
          <img
            src={preview.objectUrl}
            alt={preview.original_name}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default PrivateEnrollmentImageGallery;
