/**
 * 创建活动 Hook
 * 使用 TanStack Query useMutation 进行状态管理
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Toast } from "antd-mobile";
import { createActivity, getActivities } from "../services";
import { activitiesKeys } from "./useActivities";
import type { ActivityFormData, CreateActivityRequest } from "../types";

/**
 * 转换表单数据为 API 请求格式
 * 注意: API 使用 snake_case，且只有报名截止时间 (registration_deadline)
 */
const transformFormDataToRequest = (
  data: ActivityFormData
): CreateActivityRequest => {
  // 确保 tags 是字符串数组
  const tags = (data.tags || []).map((tag) => String(tag));

  const request: CreateActivityRequest = {
    title: data.title,
    description: data.description,
    cover_image: data.cover_image,
    start_time: data.start_time.toISOString(),
    end_time: data.end_time.toISOString(),
    location: data.location,
    max_participants: data.max_participants,
    fee: 0, // 默认免费，后续可扩展
    tags: tags,
    expectation: data.requirements || "", // 将参与要求映射为期望
    registration_deadline: data.registration_end.toISOString(), // 使用报名截止时间
  };

  console.log("[transformFormDataToRequest] 转换后的数据:", {
    ...request,
    tags: request.tags,
    tagsType: typeof request.tags,
    tagsIsArray: Array.isArray(request.tags),
  });

  return request;
};

/**
 * 创建活动 Hook
 */
export const useCreateActivity = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ActivityFormData) => {
      console.log("useCreateActivity - 开始创建", data);

      // 数据转换
      const requestData = transformFormDataToRequest(data);
      console.log("useCreateActivity - 转换后的请求数据", requestData);

      // 调用 API
      const result = await createActivity(requestData);
      console.log("useCreateActivity - API 返回结果", result);

      return result;
    },
    onSuccess: async (data) => {
      console.log("useCreateActivity - 创建成功", data);

      // 清除可能存在的加载提示
      Toast.clear();

      // 显示成功提示
      Toast.show({
        icon: "success",
        content: "活动创建成功",
        duration: 1500,
      });

      // 🚀 优化：预取最新活动列表数据
      // 在用户看到成功提示的同时，后台预先加载数据
      try {
        await queryClient.prefetchQuery({
          queryKey: activitiesKeys.list(),
          queryFn: getActivities,
        });
        console.log("useCreateActivity - 数据预取成功");
      } catch (error) {
        console.error("useCreateActivity - 数据预取失败:", error);
        // 预取失败不影响跳转，跳转后会自动重新请求
      }

      // 延迟跳转，让用户看到成功提示，同时数据已在后台加载
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    },
    onError: (error: Error) => {
      console.error("useCreateActivity - 创建失败:", error);

      // 清除可能存在的加载提示
      Toast.clear();

      // 分析错误类型并显示对应提示
      let errorMessage = "创建活动失败，请稍后重试";

      if (error.message) {
        if (
          error.message.includes("网络") ||
          error.message.includes("Network")
        ) {
          errorMessage = "网络连接失败，请检查网络后重试";
        } else if (error.message.includes("timeout")) {
          errorMessage = "请求超时，请稍后重试";
        } else if (
          error.message.includes("401") ||
          error.message.includes("未授权")
        ) {
          errorMessage = "登录已过期，请重新登录";
        } else if (
          error.message.includes("403") ||
          error.message.includes("权限")
        ) {
          errorMessage = "没有权限执行此操作";
        } else if (
          error.message.includes("400") ||
          error.message.includes("参数")
        ) {
          errorMessage = "提交的数据格式不正确，请检查";
        } else {
          errorMessage = error.message;
        }
      }

      // 显示错误提示
      Toast.show({
        icon: "fail",
        content: errorMessage,
        duration: 3000,
      });
    },
  });

  return {
    create: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
};
