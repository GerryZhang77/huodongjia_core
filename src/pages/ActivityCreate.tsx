/**
 * 创建活动页面
 */

import React from "react";
import { NavBar } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import { ActivityForm, useCreateActivity } from "../features/activities";
import type { ActivityFormData } from "../features/activities";

const ActivityCreate: React.FC = () => {
  const navigate = useNavigate();
  const { create, loading } = useCreateActivity();

  const handleSubmit = async (data: ActivityFormData) => {
    try {
      console.log("提交活动数据:", data);
      await create(data);
      // 成功提示在 useCreateActivity 的 onSuccess 中处理
    } catch (error) {
      console.error("创建活动失败:", error);
      // 错误提示在 useCreateActivity 的 onError 中处理
      // 这里额外捕获，防止未处理的 promise rejection
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        back="返回"
        onBack={() => navigate("/dashboard")}
        style={
          {
            "--height": "48px",
            "--border-bottom": "1px solid var(--adm-border-color)",
          } as React.CSSProperties
        }
      >
        创建活动
      </NavBar>

      <ActivityForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default ActivityCreate;
