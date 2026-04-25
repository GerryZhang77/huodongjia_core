/**
 * Toast - 品牌化轻提示组件
 *
 * API 与 antd-mobile 的 Toast 兼容，支持：
 * - Toast.show("提示文字")
 * - Toast.show({ content, icon, duration, position, afterClose })
 * - Toast.clear()
 *
 * 视觉对标 src/components/ui/Dialog 的 typeConfig，统一品牌风格。
 */

import { createRoot, type Root } from "react-dom/client";
import { useEffect, useState, type FC, type ReactNode } from "react";
import { clsx } from "clsx";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

export type ToastIcon =
  | "success"
  | "fail"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | ReactNode;

export type ToastPosition = "top" | "center" | "bottom";

export interface ToastProps {
  icon?: ToastIcon;
  content?: ReactNode;
  duration?: number;
  position?: ToastPosition;
  maskClickable?: boolean;
  afterClose?: () => void;
}

interface ToastInstance extends ToastProps {
  id: string;
  closing?: boolean;
}

const iconConfig: Record<
  string,
  { Icon: typeof CheckCircle2; color: string; spin?: boolean }
> = {
  success: { Icon: CheckCircle2, color: "text-success-500" },
  fail: { Icon: XCircle, color: "text-error-500" },
  error: { Icon: XCircle, color: "text-error-500" },
  warning: { Icon: AlertTriangle, color: "text-warning-500" },
  info: { Icon: Info, color: "text-primary-500" },
  loading: { Icon: Loader2, color: "text-primary-500", spin: true },
};

const ToastItem: FC<{ toast: ToastInstance }> = ({ toast }) => {
  const { icon, content, closing } = toast;
  const isStringIcon = typeof icon === "string";
  const config = isStringIcon ? iconConfig[icon as string] : null;
  const IconComp = config?.Icon;
  const hasIconBlock = Boolean(IconComp || (icon && !isStringIcon));

  return (
    <div
      className={clsx(
        "pointer-events-auto",
        "max-w-[80vw] min-w-[112px]",
        "rounded-2xl shadow-xl backdrop-blur-md",
        "transition-all duration-200",
        closing
          ? "opacity-0 translate-y-1 scale-95"
          : "opacity-100 translate-y-0 scale-100 animate-fade-in",
        hasIconBlock
          ? "bg-white/95 dark:bg-gray-800/95 border border-gray-100 dark:border-gray-700"
          : "bg-gray-900/90 dark:bg-gray-900/95 text-white"
      )}
    >
      <div
        className={clsx(
          "flex items-center",
          hasIconBlock
            ? "flex-col gap-3 px-6 py-5 text-center"
            : "flex-row gap-2 px-4 py-2.5"
        )}
      >
        {IconComp && (
          <IconComp
            size={32}
            className={clsx(config?.color, config?.spin && "animate-spin")}
            strokeWidth={2}
          />
        )}
        {!IconComp && !isStringIcon && icon}
        {content !== undefined && content !== null && content !== "" && (
          <div
            className={clsx(
              "text-sm leading-relaxed",
              hasIconBlock
                ? "text-gray-900 dark:text-gray-100 font-medium"
                : "text-white"
            )}
          >
            {content}
          </div>
        )}
      </div>
    </div>
  );
};

const ToastContainer: FC<{ toasts: ToastInstance[] }> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  const top: ToastInstance[] = [];
  const center: ToastInstance[] = [];
  const bottom: ToastInstance[] = [];
  for (const t of toasts) {
    if (t.position === "top") top.push(t);
    else if (t.position === "bottom") bottom.push(t);
    else center.push(t);
  }

  return (
    <div className="fixed inset-0 z-[1100] pointer-events-none flex flex-col">
      {top.length > 0 && (
        <div className="flex flex-col items-center gap-2 pt-12 px-4">
          {top.map((t) => (
            <ToastItem key={t.id} toast={t} />
          ))}
        </div>
      )}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
        {center.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
      {bottom.length > 0 && (
        <div className="flex flex-col items-center gap-2 pb-16 px-4">
          {bottom.map((t) => (
            <ToastItem key={t.id} toast={t} />
          ))}
        </div>
      )}
    </div>
  );
};

let _toasts: ToastInstance[] = [];
let _setter: ((next: ToastInstance[]) => void) | null = null;
let _root: Root | null = null;
let _container: HTMLDivElement | null = null;
let _idCounter = 0;
const CLOSE_ANIMATION_MS = 180;

const ToastHost: FC = () => {
  const [list, setList] = useState<ToastInstance[]>([]);
  useEffect(() => {
    _setter = setList;
    return () => {
      _setter = null;
    };
  }, []);
  return <ToastContainer toasts={list} />;
};

function ensureRoot() {
  if (_root || typeof document === "undefined") return;
  _container = document.createElement("div");
  _container.setAttribute("data-toast-root", "");
  document.body.appendChild(_container);
  _root = createRoot(_container);
  _root.render(<ToastHost />);
}

function publish() {
  _setter?.([..._toasts]);
}

function dismiss(id: string) {
  const idx = _toasts.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const target = _toasts[idx];
  if (target.closing) return;
  _toasts[idx] = { ...target, closing: true };
  publish();
  setTimeout(() => {
    _toasts = _toasts.filter((t) => t.id !== id);
    publish();
    target.afterClose?.();
  }, CLOSE_ANIMATION_MS);
}

function show(propsOrContent: ToastProps | ReactNode): { close: () => void } {
  ensureRoot();

  let props: ToastProps;
  if (
    propsOrContent !== null &&
    typeof propsOrContent === "object" &&
    !Array.isArray(propsOrContent) &&
    !(propsOrContent as { $$typeof?: symbol }).$$typeof
  ) {
    props = propsOrContent as ToastProps;
  } else {
    props = { content: propsOrContent as ReactNode };
  }

  const id = `toast-${++_idCounter}`;
  const duration = props.duration ?? 2000;
  const instance: ToastInstance = { id, ...props };
  _toasts.push(instance);
  publish();

  let timer: ReturnType<typeof setTimeout> | null = null;
  if (duration > 0) {
    timer = setTimeout(() => dismiss(id), duration);
  }

  return {
    close: () => {
      if (timer) clearTimeout(timer);
      dismiss(id);
    },
  };
}

function clear() {
  _toasts.forEach((t) => t.afterClose?.());
  _toasts = [];
  publish();
}

export const Toast = {
  show,
  clear,
};

export default Toast;
