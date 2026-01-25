/**
 * 编辑活动页面 (新版)
 * 使用 MerchantLayout 布局
 * 支持实时预览功能
 */

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MerchantLayout } from "@/components/layout";
import {
  ActivityFormWithPreview,
  useEditActivity,
} from "@/features/activities";

const ActivityEditNew: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { edit, loading } = useEditActivity(id || "");

  if (!id) {
    navigate("/dashboard");
    return null;
  }

  return (
    <MerchantLayout
      title="编辑活动"
      showBack
      onBack={() => navigate("/dashboard")}
      contentClassName="!p-0 lg:!p-6"
    >
      <ActivityFormWithPreview
        activityId={id}
        onSubmit={edit}
        loading={loading}
      />
    </MerchantLayout>
  );
};

export default ActivityEditNew;
