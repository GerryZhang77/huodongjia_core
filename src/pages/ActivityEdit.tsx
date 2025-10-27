/**
 * 编辑活动页面
 */

import React from "react";
import { NavBar } from "antd-mobile";
import { useNavigate, useParams } from "react-router-dom";
import { ActivityForm, useEditActivity } from "../features/activities";

const ActivityEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { edit, loading } = useEditActivity(id || "");

  if (!id) {
    navigate("/dashboard");
    return null;
  }

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
        编辑活动
      </NavBar>

      <ActivityForm activityId={id} onSubmit={edit} loading={loading} />
    </div>
  );
};

export default ActivityEdit;
