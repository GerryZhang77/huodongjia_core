/**
 * 匹配规则管理 Hook
 */

import { useState, useEffect } from "react";
import { Toast } from "antd-mobile";
import {
  getMatchRules,
  createMatchRule,
  updateMatchRule as updateRuleApi,
  deleteMatchRule,
} from "../services";
import { useMatchingStore } from "../stores";
import type { MatchRule } from "../types";

export const useMatchRules = (activityId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const { rules, setRules, addRule, updateRule, removeRule } =
    useMatchingStore();

  const fetchRules = async () => {
    if (!activityId) return;

    setLoading(true);

    try {
      const result = await getMatchRules(activityId);
      setRules(result);
    } catch (error) {
      console.error("获取匹配规则失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "获取规则失败",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activityId) {
      fetchRules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const createRule = async (rule: Omit<MatchRule, "id" | "createdAt">) => {
    setLoading(true);

    try {
      const newRule = await createMatchRule(rule);
      addRule(newRule);

      Toast.show({
        icon: "success",
        content: "规则添加成功",
      });
    } catch (error) {
      console.error("创建规则失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "创建失败",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRuleById = async (
    ruleId: string,
    updates: Partial<MatchRule>
  ) => {
    setLoading(true);

    try {
      const updated = await updateRuleApi(ruleId, updates);
      updateRule(ruleId, updated);

      Toast.show({
        icon: "success",
        content: "规则更新成功",
      });
    } catch (error) {
      console.error("更新规则失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "更新失败",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRuleById = async (ruleId: string) => {
    setLoading(true);

    try {
      await deleteMatchRule(ruleId);
      removeRule(ruleId);

      Toast.show({
        icon: "success",
        content: "规则删除成功",
      });
    } catch (error) {
      console.error("删除规则失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "删除失败",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    rules,
    loading,
    fetchRules,
    createRule,
    updateRule: updateRuleById,
    deleteRule: deleteRuleById,
  };
};
