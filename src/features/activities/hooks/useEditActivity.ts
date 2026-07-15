/**
 * 编辑活动 Hook
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "@/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { updateActivity } from "../services";
import { useActivityStore } from "../stores";
import { isOnlineOnlyActivity } from "../utils";
import type { ActivityFormData } from "../types";
import { merchantQueryKeys } from "@/features/merchant/queryKeys";

export const useEditActivity = (activityId: string) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCurrentActivity } = useActivityStore();

  const invalidateActivityCaches = (id: string) => {
    const options = { refetchType: "none" as const };

    queryClient.invalidateQueries({ queryKey: ["activities"], ...options });
    queryClient.invalidateQueries({ queryKey: merchantQueryKeys.activities(), ...options });
    queryClient.invalidateQueries({ queryKey: merchantQueryKeys.activity(id), ...options });
    queryClient.invalidateQueries({ queryKey: merchantQueryKeys.matchingCatalog(id), ...options });
    queryClient.invalidateQueries({ queryKey: merchantQueryKeys.matchingParticipants(id), ...options });
    queryClient.invalidateQueries({ queryKey: ["public", "activity", id], ...options });
    queryClient.invalidateQueries({ queryKey: ["user", "activity", id], ...options });
    queryClient.invalidateQueries({ queryKey: ["user", "activities"], ...options });
  };

  const edit = async (data: ActivityFormData) => {
    setLoading(true);

    try {
      const tags = (data.tags || []).map((tag) => String(tag));
      const location = isOnlineOnlyActivity(tags)
        ? ""
        : String(data.location || "").trim();

      // 转换表单数据为 API 请求格式
      const requestData: any = {
        id: activityId,
        title: data.title,
        description: data.description,
        registrationStart: data.registration_start.toISOString(),
        registrationEnd: data.registration_end.toISOString(),
        activityStart: data.start_time.toISOString(),
        activityEnd: data.end_time.toISOString(),
        location,
        capacity: data.max_participants,
        category: Array.isArray(data.category) ? data.category[0] || "other" : data.category || "other",
        tags,
        requirements: data.requirements,
        contactInfo: data.contact_info,
        isPublic: data.is_public,
        allowWaitlist: data.allow_waitlist,
        enableNfc: data.enable_nfc === true,
        status: "published",
        registrationFormSchema: data.registration_form_schema || undefined,
        registrationTypes: data.registration_types || undefined,
      };

      // 只有当有封面图片时才添加 coverImage 和 images 字段
      if (data.cover_image) {
        requestData.coverImage = data.cover_image;
      }
      if (data.images) {
        requestData.images = data.images;
      }

      const activity = await updateActivity(activityId, requestData);
      queryClient.setQueryData(
        merchantQueryKeys.activity(activityId),
        activity,
      );

      Toast.clear();
      Toast.show({
        icon: "success",
        content: "活动更新成功",
      });

      invalidateActivityCaches(activityId);

      setCurrentActivity(activity);
      navigate(`/dashboard/activity/${activity.id}/detail`);
    } catch (error) {
      console.error("更新活动失败:", error);
      Toast.clear();
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
