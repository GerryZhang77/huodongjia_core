import { useEffect, useRef } from "react";

const activeLocks = new Set<symbol>();
let originalBodyOverflow: string | null = null;

const acquireBodyScrollLock = (owner: symbol) => {
  if (typeof document === "undefined" || activeLocks.has(owner)) return;

  if (activeLocks.size === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  activeLocks.add(owner);
};

const releaseBodyScrollLock = (owner: symbol) => {
  if (typeof document === "undefined" || !activeLocks.delete(owner)) return;

  if (activeLocks.size === 0) {
    document.body.style.overflow = originalBodyOverflow || "";
    originalBodyOverflow = null;
  }
};

/**
 * Coordinates page scroll locking across every mounted overlay.
 * The final active overlay owns restoring the body's previous overflow value.
 */
export const useBodyScrollLock = (locked: boolean) => {
  const ownerRef = useRef<symbol | null>(null);
  if (ownerRef.current === null) {
    ownerRef.current = Symbol("body-scroll-lock");
  }

  useEffect(() => {
    if (!locked) return;

    const owner = ownerRef.current!;
    acquireBodyScrollLock(owner);
    return () => releaseBodyScrollLock(owner);
  }, [locked]);
};
