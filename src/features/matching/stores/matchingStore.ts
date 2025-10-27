/**
 * 匹配状态管理 Store
 */

import { create } from "zustand";
import type {
  MatchingState,
  MatchRule,
  MatchGroup,
  BubbleData,
} from "../types";

export const useMatchingStore = create<MatchingState>((set) => ({
  rules: [],
  groups: [],
  bubbleData: [],
  loading: false,
  matchingProgress: 0,

  setRules: (rules: MatchRule[]) => {
    set({ rules });
  },

  addRule: (rule: MatchRule) => {
    set((state) => ({ rules: [...state.rules, rule] }));
  },

  updateRule: (ruleId: string, updates: Partial<MatchRule>) => {
    set((state) => ({
      rules: state.rules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      ),
    }));
  },

  removeRule: (ruleId: string) => {
    set((state) => ({
      rules: state.rules.filter((rule) => rule.id !== ruleId),
    }));
  },

  setGroups: (groups: MatchGroup[]) => {
    set({ groups });
  },

  addGroup: (group: MatchGroup) => {
    set((state) => ({ groups: [...state.groups, group] }));
  },

  updateGroup: (groupId: string, updates: Partial<MatchGroup>) => {
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      ),
    }));
  },

  setBubbleData: (data: BubbleData[]) => {
    set({ bubbleData: data });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setMatchingProgress: (progress: number) => {
    set({ matchingProgress: progress });
  },

  clearMatching: () => {
    set({
      rules: [],
      groups: [],
      bubbleData: [],
      matchingProgress: 0,
    });
  },
}));
