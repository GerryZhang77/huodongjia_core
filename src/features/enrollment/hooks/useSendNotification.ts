/**
 * 发送通知 Hook
 */

import { useState } from "react";
import { Toast } from "antd-mobile";
import { sendNotification } from "../services";

export const useSendNotification = () => {
  const [loading, setLoading] = useState(false);

  const send = async (
    activityId: string,
    message: string,
    enrollmentIds?: string[],
    onSuccess?: () => void
  ) => {
    if (!message.trim()) {
      Toast.show({
        icon: "fail",
        content: "请输入通知内容",
      });
      return;
    }

    setLoading(true);

    try {
      await sendNotification({
        activityId,
        message,
        enrollmentIds,
        sendToAll: !enrollmentIds || enrollmentIds.length === 0,
      });

      const recipientCount = enrollmentIds?.length || "所有";

      Toast.show({
        icon: "success",
        content: `已向 ${recipientCount} 位用户发送通知`,
      });

      onSuccess?.();
    } catch (error) {
      console.error("发送通知失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "发送通知失败",
      });
    } finally {
      setLoading(false);
    }
  };

  return { send, loading };
};
