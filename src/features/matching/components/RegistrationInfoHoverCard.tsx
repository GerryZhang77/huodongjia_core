import React, { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buildRegistrationInfoItems } from "./registrationInfo";

const HOVER_DELAY_MS = 2000;
const HIDE_DELAY_MS = 120;
const CARD_WIDTH = 320;

interface Props {
  name: string;
  registrationTypeName?: string;
  formData?: Record<string, unknown> | null;
  fieldLabels?: Record<string, string>;
  children: React.ReactNode;
}

const RegistrationInfoHoverCard: React.FC<Props> = ({ name, registrationTypeName, formData, fieldLabels, children }) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const items = useMemo(() => buildRegistrationInfoItems(formData, fieldLabels), [fieldLabels, formData]);

  const clearShowTimer = () => {
    if (showTimerRef.current !== null) window.clearTimeout(showTimerRef.current);
    showTimerRef.current = null;
  };
  const clearHideTimer = () => {
    if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  };
  const show = useCallback(() => {
    clearHideTimer();
    clearShowTimer();
    showTimerRef.current = window.setTimeout(() => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.max(8, Math.min(window.innerWidth - CARD_WIDTH - 8, rect.left + rect.width / 2 - CARD_WIDTH / 2));
      const preferredTop = rect.bottom + 8;
      setPosition({ left, top: preferredTop + 360 > window.innerHeight ? Math.max(8, rect.top - 368) : preferredTop });
      setVisible(true);
    }, HOVER_DELAY_MS);
  }, []);
  const hide = useCallback(() => {
    clearShowTimer();
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => setVisible(false), HIDE_DELAY_MS);
  }, []);

  return <>
    <div ref={triggerRef} className="shrink-0" onMouseEnter={show} onMouseLeave={hide}>{children}</div>
    {visible && createPortal(
      <div
        role="tooltip"
        onMouseEnter={clearHideTimer}
        onMouseLeave={hide}
        className="fixed z-[90] w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        style={position}
      >
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-sm font-semibold text-gray-900">{name}的报名信息</p>
          <p className="mt-0.5 text-xs text-gray-500">{registrationTypeName || "未设置参会类型"}</p>
        </div>
        <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-3">
          {items.length ? items.map((item) => <div key={item.label}>
            <p className="text-xs text-gray-400">{item.label}</p>
            {item.tags ? <div className="mt-1 flex flex-wrap gap-1">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">{tag}</span>)}</div> : <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-gray-700">{item.value}</p>}
          </div>) : <p className="py-5 text-center text-sm text-gray-400">暂无可展示的报名信息</p>}
        </div>
      </div>,
      document.body,
    )}
  </>;
};

export default RegistrationInfoHoverCard;
