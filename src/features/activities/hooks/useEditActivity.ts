/**
 * 编辑活动 Hook
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "antd-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { updateActivity } from "../services";
import { useActivityStore } from "../stores";
import type { ActivityFormData } from "../types";

export const useEditActivity = (activityId: string) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCurrentActivity } = useActivityStore();

  const edit = async (data: ActivityFormData) => {
    setLoading(true);

    try {
      // 转换表单数据为 API 请求格式
      const requestData: any = {
        id: activityId,
        title: data.title,
        description: data.description,
        registrationStart: data.registration_start.toISOString(),
        registrationEnd: data.registration_end.toISOString(),
        activityStart: data.start_time.toISOString(),
        activityEnd: data.end_time.toISOString(),
        location: data.location,
        capacity: data.max_participants,
        category: data.category,
        tags: data.tags,
        requirements: data.requirements,
        contactInfo: data.contact_info,
        isPublic: data.is_public,
        allowWaitlist: data.allow_waitlist,
        status: "published",
      };

      // 只有当有封面图片时才添加 coverImage 字段
      if (data.cover_image) {
        requestData.coverImage = data.cover_image;
      }

      const activity = await updateActivity(activityId, requestData);

      Toast.show({
        icon: "success",
        content: "活动更新成功",
      });

      // 手动失效相关查询缓存，确保数据更新
      queryClient.invalidateQueries({
        queryKey: ["activity", "detail", activityId],
      });
      queryClient.invalidateQueries({
        queryKey: ["merchant", "activities"],
      });

      setCurrentActivity(activity);
      navigate(`/dashboard/activity/${activity.id}/detail`);
    } catch (error) {
      console.error("更新活动失败:", error);
      Toast.show({
        icon: "fail",
        content: "更新活动失败，请稍后重试",
      });
    } finally {
      setLoading(false);
    }
  };

  return { edit, loading };
};
