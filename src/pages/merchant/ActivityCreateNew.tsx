/**
 * 创建活动页面 (新版)
 * 使用 MerchantLayout 布局
 * 支持实时预览功能
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { MerchantLayout } from "@/components/layout";
import {
  ActivityFormWithPreview,
  useCreateActivity,
} from "@/features/activities";
import type { ActivityFormData } from "@/features/activities";

const ActivityCreateNew: React.FC = () => {
  const navigate = useNavigate();
  const { create, loading } = useCreateActivity();

  const handleSubmit = async (data: ActivityFormData) => {
    try {
      console.log("提交活动数据:", data);
      await create(data);
      // 成功后跳转回 Dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("创建活动失败:", error);
    }
  };

  return (
    <MerchantLayout
      title="创建活动"
      showBack
      onBack={() => navigate("/dashboard")}
      contentClassName="!p-0 lg:!p-6"
    >
      <ActivityFormWithPreview onSubmit={handleSubmit} loading={loading} />
    </MerchantLayout>
  );
};

export default ActivityCreateNew;
