/**
 * 创建活动页面
 */

import React from "react";
import { NavBar } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import { ActivityForm, useCreateActivity } from "../features/activities";

const ActivityCreate: React.FC = () => {
  const navigate = useNavigate();
  const { create, loading } = useCreateActivity();

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

      <ActivityForm onSubmit={create} loading={loading} />
    </div>
  );
};

export default ActivityCreate;
