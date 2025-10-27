/**
 * AI 生成匹配规则 Hook
 */

import { useState } from "react";
import { Toast } from "antd-mobile";
import { generateMatchRules } from "../services";
import { useMatchingStore } from "../stores";

export const useGenerateRules = () => {
  const [loading, setLoading] = useState(false);
  const { setRules } = useMatchingStore();

  const generate = async (activityId: string, description: string) => {
    if (!description.trim()) {
      Toast.show({
        icon: "fail",
        content: "请输入匹配需求描述",
      });
      return null;
    }

    setLoading(true);

    try {
      const result = await generateMatchRules({ activityId, description });

      setRules(result.rules);

      Toast.show({
        icon: "success",
        content: "规则生成成功",
      });

      return result.rules;
    } catch (error) {
      console.error("生成规则失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "生成失败",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading };
};
