/**
 * 执行智能匹配 Hook
 */

import { useState } from "react";
import { Toast } from "antd-mobile";
import { submitMatchingTask, getMatchingTaskStatus, getMatchGroups } from "../services";
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
      // 1. 提交匹配任务
      await submitMatchingTask(activityId, enabledRules);

      Toast.show({
        icon: "success",
        content: "匹配任务已提交，正在后台执行...",
      });

      // 2. 轮询查询匹配进度
      let pollCount = 0;
      const maxPolls = 60; // 最多轮询60次（5分钟）

      const pollProgress = async (): Promise<boolean> => {
        try {
          const statusData = await getMatchingTaskStatus(activityId);

          // 更新进度条
          setMatchingProgress(statusData.progress);

          if (statusData.status === "completed") {
            return true; // 匹配完成
          } else if (statusData.status === "failed") {
            throw new Error(statusData.message || "匹配失败");
          }

          // 继续轮询
          pollCount++;
          if (pollCount >= maxPolls) {
            throw new Error("匹配超时，请稍后查看结果");
          }

          // 等待3秒后继续轮询
          await new Promise(resolve => setTimeout(resolve, 3000));
          return pollProgress();

        } catch (error) {
          throw error;
        }
      };

      // 开始轮询
      await pollProgress();

      // 3. 匹配完成，获取结果（新 shape：per-user top5）
      setMatchingProgress(100);
      const { results } = await getMatchGroups(activityId);
      setGroups([]); // 新模型下 groups 已弃用，置空避免旧 UI 误渲染

      Toast.show({
        icon: "success",
        content: `匹配完成！共 ${results.length} 位参与者已生成 top5`,
      });

      return { groups: [] };
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
      await getMatchGroups(activityId);
      setGroups([]); // 新模型下 groups 已弃用
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
