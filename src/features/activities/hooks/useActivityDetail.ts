/**
 * 获取活动详情 Hook
 */

import { useState, useEffect } from "react";
import { Toast } from "antd-mobile";
import { getActivityById } from "../services";
import { useActivityStore } from "../stores";
import type { Activity } from "../types";

export const useActivityDetail = (activityId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);
  const { setCurrentActivity } = useActivityStore();

  useEffect(() => {
    if (!activityId) return;

    const fetchActivity = async () => {
      setLoading(true);

      try {
        const activity = await getActivityById(activityId);
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
