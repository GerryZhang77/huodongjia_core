/**
 * 获取报名列表 Hook
 */

import { useState, useEffect } from "react";
import { Toast } from "antd-mobile";
import { getEnrollments } from "../services";
import { useEnrollmentStore } from "../stores";
import type { EnrollmentListQuery } from "../types";

export const useEnrollmentList = (activityId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const { enrollments, total, setEnrollments } = useEnrollmentStore();

  const fetchEnrollments = async (query?: Partial<EnrollmentListQuery>) => {
    if (!activityId) return;

    setLoading(true);

    try {
      const result = await getEnrollments({
        activityId,
        ...query,
      });

      setEnrollments(result.data, result.total);
    } catch (error) {
      console.error("获取报名列表失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "获取报名列表失败",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activityId) {
      fetchEnrollments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const refresh = () => {
    fetchEnrollments();
  };

  return { enrollments, total, loading, refresh, fetchEnrollments };
};
