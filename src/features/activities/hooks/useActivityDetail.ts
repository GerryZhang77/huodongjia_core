/**
 * 获取活动详情 Hook
 */

import { useState, useEffect } from "react";
import { Toast } from "antd-mobile";
import { getActivityById } from "../services";
import { useActivityStore } from "../stores";
import type { Activity } from "../types";
import { demoActivity, isDemoActivity } from "@/mocks/demo-activity";

export const useActivityDetail = (activityId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);
  const { setCurrentActivity } = useActivityStore();

  useEffect(() => {
    if (!activityId) return;

    const fetchActivity = async () => {
      // 【Mock 环境】如果是演示活动，直接返回静态数据
      if (isDemoActivity(activityId)) {
        console.log("✅ useActivityDetail - 检测到演示活动 ID，使用静态数据");
        setActivity(demoActivity);
        setCurrentActivity(demoActivity);
        return;
      }

      // 【正常流程】从后端获取活动详情
      setLoading(true);

      try {
        const activity = await getActivityById(activityId);
        console.log("✅ useActivityDetail - 从后端获取活动详情成功");
        setActivity(activity);
        setCurrentActivity(activity);
      } catch (error) {
        console.error("获取活动详情失败:", error);
        Toast.show({
          icon: "fail",
          content: "获取活动详情失败",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activityId, setCurrentActivity]);

  return { activity, loading };
};
