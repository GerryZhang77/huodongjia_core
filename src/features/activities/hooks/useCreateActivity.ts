/**
 * 创建活动 Hook
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "antd-mobile";
import { createActivity } from "../services";
import { useActivityStore } from "../stores";
import type { ActivityFormData } from "../types";

export const useCreateActivity = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentActivity } = useActivityStore();

  const create = async (data: ActivityFormData) => {
    setLoading(true);

    try {
      // 转换表单数据为 API 请求格式
      const requestData = {
        title: data.title,
        description: data.description,
        coverImage: data.cover_image,
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
      };

      const activity = await createActivity(requestData);

      Toast.show({
        icon: "success",
        content: "活动创建成功",
      });

      setCurrentActivity(activity);
      navigate(`/activities/${activity.id}`);
    } catch (error) {
      console.error("创建活动失败:", error);
      Toast.show({
        icon: "fail",
        content: "创建活动失败，请稍后重试",
      });
    } finally {
      setLoading(false);
    }
  };

  return { create, loading };
};
