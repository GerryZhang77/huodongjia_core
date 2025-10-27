/**
 * 更新报名状态 Hook
 */

import { useState } from "react";
import { Toast } from "antd-mobile";
import { updateEnrollmentStatus as updateStatusApi } from "../services";
import type { EnrollmentStatus } from "../types";

export const useUpdateEnrollmentStatus = () => {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (
    enrollmentIds: string[],
    status: EnrollmentStatus,
    onSuccess?: () => void
  ) => {
    if (enrollmentIds.length === 0) {
      Toast.show({
        icon: "fail",
        content: "请先选择要操作的报名",
      });
      return;
    }

    setLoading(true);

    try {
      await updateStatusApi({
        enrollmentIds,
        status,
      });

      const statusText =
        status === "approved"
          ? "通过"
          : status === "rejected"
          ? "拒绝"
          : "更新";

      Toast.show({
        icon: "success",
        content: `已${statusText} ${enrollmentIds.length} 条报名`,
      });

      onSuccess?.();
    } catch (error) {
      console.error("更新报名状态失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "更新失败",
      });
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading };
};
