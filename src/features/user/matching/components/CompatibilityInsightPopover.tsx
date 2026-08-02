import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Info, Sparkles } from "lucide-react";
import type { MatchCompatibilityInsight } from "@/features/user/services/matchApi";
import { cn } from "@/utils/cn";

const CARD_MAX_WIDTH = 320;
const VIEWPORT_GAP = 8;
const HIDE_DELAY_MS = 120;

interface CompatibilityInsightPopoverProps {
  children: ReactNode;
  fieldLabel: string;
  insight?: MatchCompatibilityInsight;
  canLoad?: boolean;
  triggerVariant?: "inline" | "card";
  className?: string;
  onOpenIntent?: () => void;
}

export const CompatibilityInsightPopover: FC<
  CompatibilityInsightPopoverProps
> = ({
  children,
  fieldLabel,
  insight,
  canLoad = false,
  triggerVariant = "inline",
  className,
  onOpenIntent,
}) => {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const active = Boolean(insight || canLoad);
  const usesTouchInteraction = () =>
    window.matchMedia?.("(hover: none)").matches ?? false;
  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | HTMLDivElement | null) => {
      triggerRef.current = node;
    },
    [],
  );

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const updatePosition = useCallback(() => {
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    if (!triggerRect) return;

    const width = Math.min(CARD_MAX_WIDTH, window.innerWidth - VIEWPORT_GAP * 2);
    const left = Math.max(
      VIEWPORT_GAP,
      Math.min(
        window.innerWidth - width - VIEWPORT_GAP,
        triggerRect.left + triggerRect.width / 2 - width / 2,
      ),
    );
    const cardHeight = cardRef.current?.getBoundingClientRect().height || 180;
    const belowTop = triggerRect.bottom + 8;
    const top =
      belowTop + cardHeight <= window.innerHeight - VIEWPORT_GAP
        ? belowTop
        : Math.max(VIEWPORT_GAP, triggerRect.top - cardHeight - 8);

    setPosition({ top, left, width });
  }, []);

  const show = useCallback(() => {
    if (!active) return;
    clearHideTimer();
    onOpenIntent?.();
    updatePosition();
    setVisible(true);
  }, [active, clearHideTimer, onOpenIntent, updatePosition]);

  const hideSoon = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(
      () => setVisible(false),
      HIDE_DELAY_MS,
    );
  }, [clearHideTimer]);

  useEffect(() => {
    if (!active) setVisible(false);
  }, [active]);

  useEffect(() => {
    if (!visible) return;

    const frame = window.requestAnimationFrame(updatePosition);
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !cardRef.current?.contains(target)
      ) {
        setVisible(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVisible(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [insight, updatePosition, visible]);

  useEffect(
    () => () => {
      clearHideTimer();
    },
    [clearHideTimer],
  );

  if (!active) {
    return triggerVariant === "card" ? (
      <div className={className}>{children}</div>
    ) : (
      <span className={className}>{children}</span>
    );
  }

  const handleMouseEnter = () => {
    if (!usesTouchInteraction()) show();
  };
  const handleFocus = (currentTarget: HTMLElement) => {
    if (
      !usesTouchInteraction() ||
      currentTarget.matches(":focus-visible")
    ) {
      show();
    }
  };
  const handleClick = () => {
    if (usesTouchInteraction()) {
      clearHideTimer();
      onOpenIntent?.();
      updatePosition();
      setVisible((current) => !current);
      return;
    }
    show();
  };

  const trigger =
    triggerVariant === "card" ? (
      <div
        ref={setTriggerRef}
        role="button"
        tabIndex={0}
        aria-label={`查看${fieldLabel}匹配说明`}
        aria-describedby={visible && insight ? tooltipId : undefined}
        aria-expanded={Boolean(visible && insight)}
        className={cn(
          "relative block w-full cursor-default text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-300",
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={hideSoon}
        onFocus={(event) => handleFocus(event.currentTarget)}
        onBlur={hideSoon}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            show();
          }
        }}
      >
        {children}
        <Info
          size={14}
          aria-hidden="true"
          className="absolute right-4 top-4 text-gray-400"
        />
      </div>
    ) : (
      <button
        ref={setTriggerRef}
        type="button"
        aria-label={`查看${fieldLabel}匹配说明`}
        aria-describedby={visible && insight ? tooltipId : undefined}
        aria-expanded={Boolean(visible && insight)}
        className={cn(
          "inline-flex items-center gap-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-300",
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={hideSoon}
        onFocus={(event) => handleFocus(event.currentTarget)}
        onBlur={hideSoon}
        onClick={handleClick}
      >
        {children}
        <Info size={12} aria-hidden="true" className="shrink-0 opacity-70" />
      </button>
    );

  return (
    <>
      {trigger}

      {visible && insight
        ? createPortal(
            <div
              ref={cardRef}
              id={tooltipId}
              role="tooltip"
              onMouseEnter={clearHideTimer}
              onMouseLeave={hideSoon}
              className="fixed z-[1080] rounded-2xl border border-accent-100 bg-white p-4 text-left shadow-xl"
              style={position}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Sparkles size={15} className="text-accent-500" />
                {insight.title}
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {insight.reason}
              </p>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
