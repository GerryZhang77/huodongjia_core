/**
 * 活动状态管理 Store
 */

import { create } from "zustand";
import type { ActivityState, Activity } from "../types";

export const useActivityStore = create<ActivityState>((set) => ({
  currentActivity: null,
  activityList: [],
  total: 0,
  loading: false,

  setCurrentActivity: (activity: Activity | null) => {
    set({ currentActivity: activity });
  },

  setActivityList: (list: Activity[], total: number) => {
    set({ activityList: list, total });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  clearActivity: () => {
    set({ currentActivity: null });
  },
}));
