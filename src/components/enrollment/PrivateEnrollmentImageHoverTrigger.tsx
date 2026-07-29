import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Image as ImageIcon } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores";
import { prefetchEnrollmentImages } from "@/features/enrollment/hooks/useEnrollmentImages";
import PrivateEnrollmentImageGallery from "./PrivateEnrollmentImageGallery";

const SHOW_DELAY = 240;
const HIDE_DELAY = 160;
const PREFETCH_DELAY = 120;
const CARD_WIDTH = 288;
const CARD_HEIGHT_ESTIMATE = 270;
const VIEWPORT_GAP = 8;

interface PrivateEnrollmentImageHoverTriggerProps {
  activityId: string;
  participantId: string;
  participantName: string;
  imageCount: number;
  onOpenFullGallery: () => void;
}

const PrivateEnrollmentImageHoverTrigger: FC<
  PrivateEnrollmentImageHoverTriggerProps
> = ({
  activityId,
  participantId,
  participantName,
  imageCount,
  onOpenFullGallery,
}) => {
  const queryClient = useQueryClient();
  const sessionScope = useAuthStore((state) => state.user?.id || "anonymous");
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const prefetchTimerRef = useRef<number | null>(null);

  const clearShowTimer = useCallback(() => {
    if (showTimerRef.current != null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const clearPrefetchTimer = useCallback(() => {
    if (prefetchTimerRef.current != null) {
      window.clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }
  }, []);

  const prefetchPreview = useCallback(() => {
    void prefetchEnrollmentImages(
      queryClient,
      sessionScope,
      activityId,
      participantId,
      { contentLimit: 4 },
    ).catch(() => undefined);
  }, [activityId, participantId, queryClient, sessionScope]);

  const calculatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + VIEWPORT_GAP;

    if (left + CARD_WIDTH > window.innerWidth - VIEWPORT_GAP) {
      left = window.innerWidth - CARD_WIDTH - VIEWPORT_GAP;
    }
    if (left < VIEWPORT_GAP) left = VIEWPORT_GAP;

    if (
      top + CARD_HEIGHT_ESTIMATE > window.innerHeight - VIEWPORT_GAP &&
      rect.top > CARD_HEIGHT_ESTIMATE + VIEWPORT_GAP
    ) {
      top = rect.top - CARD_HEIGHT_ESTIMATE - VIEWPORT_GAP;
    }
    if (top < VIEWPORT_GAP) top = VIEWPORT_GAP;

    setPosition({ top, left });
  }, []);

  const showPreview = useCallback(
    (prefetchImmediately = false) => {
      clearHideTimer();
      clearShowTimer();
      clearPrefetchTimer();
      if (prefetchImmediately) {
        prefetchPreview();
      } else {
        prefetchTimerRef.current = window.setTimeout(
          prefetchPreview,
          PREFETCH_DELAY,
        );
      }
      showTimerRef.current = window.setTimeout(() => {
        calculatePosition();
        setIsVisible(true);
      }, SHOW_DELAY);
    },
    [
      calculatePosition,
      clearHideTimer,
      clearPrefetchTimer,
      clearShowTimer,
      prefetchPreview,
    ],
  );

  const hidePreview = useCallback(() => {
    clearShowTimer();
    clearHideTimer();
    clearPrefetchTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, HIDE_DELAY);
  }, [clearHideTimer, clearPrefetchTimer, clearShowTimer]);

  const keepPreviewOpen = useCallback(() => {
    clearHideTimer();
  }, [clearHideTimer]);

  const openFullGallery = useCallback(() => {
    clearShowTimer();
    clearHideTimer();
    clearPrefetchTimer();
    setIsVisible(false);
    onOpenFullGallery();
  }, [
    clearHideTimer,
    clearPrefetchTimer,
    clearShowTimer,
    onOpenFullGallery,
  ]);

  useEffect(
    () => () => {
      clearShowTimer();
      clearHideTimer();
      clearPrefetchTimer();
    },
    [clearHideTimer, clearPrefetchTimer, clearShowTimer],
  );

  useEffect(() => {
    if (!isVisible) return;
    const closePreview = () => setIsVisible(false);
    window.addEventListener("scroll", closePreview, true);
    window.addEventListener("resize", closePreview);
    return () => {
      window.removeEventListener("scroll", closePreview, true);
      window.removeEventListener("resize", closePreview);
    };
  }, [isVisible]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isVisible}
        aria-label={`查看${participantName}的 ${imageCount} 张报名图片`}
        onClick={(event) => {
          event.stopPropagation();
          openFullGallery();
        }}
        onMouseEnter={() => showPreview(false)}
        onMouseLeave={hidePreview}
        onFocus={() => showPreview(true)}
        onBlur={hidePreview}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            clearShowTimer();
            clearPrefetchTimer();
            setIsVisible(false);
          }
        }}
        className="inline-flex items-center gap-1 rounded-md text-xs text-purple-600 hover:text-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
      >
        <ImageIcon size={12} aria-hidden="true" />
        报名图片 {imageCount}
      </button>

      {isVisible &&
        createPortal(
          <div
            ref={cardRef}
            role="dialog"
            aria-label={`${participantName}的报名图片预览`}
            className="fixed z-[1080]"
            style={position}
            onMouseEnter={keepPreviewOpen}
            onMouseLeave={hidePreview}
            onFocusCapture={keepPreviewOpen}
            onBlurCapture={(event) => {
              const nextFocused = event.relatedTarget;
              if (
                nextFocused instanceof Node &&
                cardRef.current?.contains(nextFocused)
              ) {
                return;
              }
              hidePreview();
            }}
          >
            <PrivateEnrollmentImageGallery
              activityId={activityId}
              participantId={participantId}
              variant="compact"
              maxImages={4}
              onOpenFullGallery={openFullGallery}
            />
          </div>,
          document.body,
        )}
    </>
  );
};

export default PrivateEnrollmentImageHoverTrigger;
