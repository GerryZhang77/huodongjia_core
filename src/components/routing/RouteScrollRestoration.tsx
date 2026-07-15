import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const storageKey = (locationKey: string) =>
  `merchant-route-scroll:${locationKey}`;

/**
 * BrowserRouter 版滚动恢复：返回历史页面时恢复原位置，新页面从顶部开始。
 * 位置只保存在当前标签页的 sessionStorage，不跨账号或浏览器会话持久化。
 */
export function RouteScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    const key = storageKey(location.key);
    const saved = Number(sessionStorage.getItem(key));
    const target =
      navigationType === "POP" && Number.isFinite(saved) ? saved : 0;
    let firstFrame = 0;
    let secondFrame = 0;
    const retryTimers: number[] = [];

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        window.scrollTo({ top: target, behavior: "auto" });
      });
    });

    if (target > 0) {
      for (const delay of [120, 400]) {
        retryTimers.push(
          window.setTimeout(() => {
            // 页面异步内容撑开后补一次；用户已主动滚动时不再抢位置。
            if (window.scrollY < 8 || Math.abs(window.scrollY - target) < 8) {
              window.scrollTo({ top: target, behavior: "auto" });
            }
          }, delay),
        );
      }
    }

    return () => {
      sessionStorage.setItem(key, String(window.scrollY));
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      retryTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [location.key, navigationType]);

  return null;
}
