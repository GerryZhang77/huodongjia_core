import { useState, useEffect } from "react";
import { Toast } from "antd-mobile";
import { getMatchRules } from "../services";
import { useMatchingStore } from "../stores";
import type { MatchingRule as MatchRule } from "../types";

export const useMatchRules = (activityId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const { rules, setRules } = useMatchingStore();

  const fetchRules = async () => {
    if (!activityId) return;
    setLoading(true);
    try {
      const result = await getMatchRules(activityId);
      setRules(result);
    } catch (error) {
      Toast.show({ icon: "fail", content: error instanceof Error ? error.message : "获取规则失败" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activityId) fetchRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  return { rules, loading, fetchRules };
};
