import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api/client";

interface BatchResp {
  success: boolean;
  data?: { statusMap?: Record<string, boolean> };
}

const STALE_MS = 30 * 1000; // 与 ActivityCard 的 staleTime 一致

/**
 * 列表页一次性预热多张卡片的"是否已收藏"缓存。
 *
 * 原本每张 ActivityCard 在 mount 时各自 GET /api/user/favorites/:id/status，
 * 列表 20 张就 = 20 次往返。这里改成一次 GET /api/user/favorites/status?ids=...，
 * 把结果直接 setQueryData 到每个 id 对应的 ["user","favorite-status",id] 上。
 *
 * 后续 ActivityCard 内部的 useQuery 命中已新鲜的缓存，不再触发请求。
 *
 * @param ids 当前列表里所有需要展示收藏态的活动 id（顺序无关）
 * @param enabled 默认 true；切换 Tab/编辑态等不需要预热时可关
 */
export function useSeedFavoriteStatus(ids: string[], enabled = true) {
  const qc = useQueryClient();

  // 用 join 当 deps key，避免 ids 引用每次渲染都变
  const idsKey = ids.join(",");

  useEffect(() => {
    if (!enabled || ids.length === 0) return;

    // 跳过缓存里已新鲜的 id，最小化 payload
    const now = Date.now();
    const idsToFetch = ids.filter((id) => {
      const state = qc.getQueryState(["user", "favorite-status", id]);
      const fresh =
        !!state?.data && !!state.dataUpdatedAt && now - state.dataUpdatedAt < STALE_MS;
      return !fresh;
    });
    if (idsToFetch.length === 0) return;

    let cancelled = false;
    api
      .get<BatchResp>("/api/user/favorites/status", {
        params: { ids: idsToFetch.join(",") },
      })
      .then((res) => {
        if (cancelled || !res.success) return;
        const map = res.data?.statusMap || {};
        Object.entries(map).forEach(([id, favorited]) => {
          // 写入 ActivityCard 期望的形状：{ success, data: { favorited } }
          qc.setQueryData(["user", "favorite-status", id], {
            success: true,
            data: { favorited: !!favorited },
          });
        });
      })
      .catch(() => {
        // 失败时不影响 UI——单卡的 useQuery 会按需各自回退
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, enabled, qc]);
}
