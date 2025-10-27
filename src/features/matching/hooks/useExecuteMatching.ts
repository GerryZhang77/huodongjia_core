/**
 * 执行智能匹配 Hook
 */

import { useState } from "react";
import { Toast } from "antd-mobile";
import { executeMatching, getMatchGroups } from "../services";
import { useMatchingStore } from "../stores";

export const useExecuteMatching = () => {
  const [loading, setLoading] = useState(false);
  const { rules, setGroups, setMatchingProgress } = useMatchingStore();

  const execute = async (activityId: string) => {
    const enabledRules = rules.filter((rule) => rule.enabled);

    if (enabledRules.length === 0) {
      Toast.show({
        icon: "fail",
        content: "请先添加并启用匹配规则",
      });
      return null;
    }

    setLoading(true);
    setMatchingProgress(0);

    try {
      // 模拟进度更新
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress >= 90) {
          clearInterval(progressInterval);
        } else {
          setMatchingProgress(progress);
        }
      }, 300);

      const result = await executeMatching({ activityId, rules: enabledRules });

      clearInterval(progressInterval);
      setMatchingProgress(100);

      setGroups(result.groups);

      Toast.show({
        icon: "success",
        content: `匹配完成！共生成 ${result.groups.length} 个小组`,
      });

      return result;
    } catch (error) {
      console.error("执行匹配失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "匹配失败",
      });
      return null;
    } finally {
      setLoading(false);
      setMatchingProgress(0);
    }
  };

  const fetchGroups = async (activityId: string) => {
    setLoading(true);

    try {
      const groups = await getMatchGroups(activityId);
      setGroups(groups);
    } catch (error) {
      console.error("获取匹配结果失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "获取失败",
      });
    } finally {
      setLoading(false);
    }
  };

  return { execute, fetchGroups, loading };
};
