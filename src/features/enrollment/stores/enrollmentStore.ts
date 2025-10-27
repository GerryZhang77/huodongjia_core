/**
 * 报名状态管理 Store
 */

import { create } from "zustand";
import type { EnrollmentState, Enrollment, FilterOptions } from "../types";

export const useEnrollmentStore = create<EnrollmentState>((set) => ({
  enrollments: [],
  total: 0,
  loading: false,
  selectedIds: [],
  filterOptions: {
    status: [],
    gender: [],
    city: [],
    searchText: "",
  },

  setEnrollments: (enrollments: Enrollment[], total: number) => {
    set({ enrollments, total });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setSelectedIds: (ids: string[]) => {
    set({ selectedIds: ids });
  },

  setFilterOptions: (options: Partial<FilterOptions>) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options },
    }));
  },

  clearEnrollments: () => {
    set({
      enrollments: [],
      total: 0,
      selectedIds: [],
      filterOptions: {
        status: [],
        gender: [],
        city: [],
        searchText: "",
      },
    });
  },
}));
