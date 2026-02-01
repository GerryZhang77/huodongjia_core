/**
 * 匹配状态管理 Store
 * 使用新的类型定义
 */

import { create } from "zustand";
import type { MatchingRule, MatchingGroup } from "../types";

// Store 专用接口 (不要与 types.ts 的 MatchingState 混淆)
interface MatchingStoreState {
  // 数据
  rules: MatchingRule[];
  groups: MatchingGroup[];

  // 状态
  loading: boolean;
  matchingProgress: number;

  // Actions
  setRules: (rules: MatchingRule[]) => void;
  addRule: (rule: MatchingRule) => void;
  updateRule: (ruleId: string, updates: Partial<MatchingRule>) => void;
  removeRule: (ruleId: string) => void;
  setGroups: (groups: MatchingGroup[]) => void;
  addGroup: (group: MatchingGroup) => void;
  updateGroup: (groupId: string, updates: Partial<MatchingGroup>) => void;
  setLoading: (loading: boolean) => void;
  setMatchingProgress: (progress: number) => void;
  clearMatching: () => void;
}

export const useMatchingStore = create<MatchingStoreState>((set) => ({
  rules: [],
  groups: [],
  loading: false,
  matchingProgress: 0,

  setRules: (rules: MatchingRule[]) => {
    set({ rules });
  },

  addRule: (rule: MatchingRule) => {
    set((state) => ({ rules: [...state.rules, rule] }));
  },

  updateRule: (ruleId: string, updates: Partial<MatchingRule>) => {
    set((state) => ({
      rules: state.rules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...updates } : rule,
      ),
    }));
  },

  removeRule: (ruleId: string) => {
    set((state) => ({
      rules: state.rules.filter((rule) => rule.id !== ruleId),
    }));
  },

  setGroups: (groups: MatchingGroup[]) => {
    set({ groups });
  },

  addGroup: (group: MatchingGroup) => {
    set((state) => ({ groups: [...state.groups, group] }));
  },

  updateGroup: (groupId: string, updates: Partial<MatchingGroup>) => {
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group,
      ),
    }));
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
      matchingProgress: 0,
    });
  },
}));
