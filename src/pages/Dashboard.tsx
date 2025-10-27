/**
 * Dashboard Page - 活动管理后台
 * 重构后的简洁版本，使用 Feature-Based 架构
 */

import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar, Tabs, SearchBar, FloatingBubble, Dialog } from "antd-mobile";
import { AddOutline } from "antd-mobile-icons";
import { ActivityList } from "@/features/activities/components";
import type { ActivityStatus } from "@/features/activities/types";

type TabKey = "all" | ActivityStatus;

export const Dashboard: FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  // 退出登录
  const handleLogout = async () => {
    const result = await Dialog.confirm({
      content: "确定要退出登录吗？",
    });

    if (result) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  };

  return (
    <div style={{ paddingBottom: "60px" }}>
      {/* 导航栏 */}
      <NavBar
        back={null}
        right={
          <div onClick={handleLogout} style={{ cursor: "pointer" }}>
            退出
          </div>
        }
      >
        我的活动
      </NavBar>

      {/* 搜索框 */}
      <div style={{ padding: "12px 16px" }}>
        <SearchBar
          placeholder="搜索活动"
          value={searchText}
          onChange={setSearchText}
        />
      </div>

      {/* 标签页 */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
        style={{ "--title-font-size": "15px" }}
      >
        <Tabs.Tab title="全部" key="all" />
        <Tabs.Tab title="招募中" key="recruiting" />
        <Tabs.Tab title="招募结束" key="recruiting_ended" />
        <Tabs.Tab title="进行中" key="ongoing" />
        <Tabs.Tab title="已结束" key="ended" />
      </Tabs>

      {/* 活动列表 */}
      <div style={{ padding: "0 16px" }}>
        <ActivityList searchText={searchText} activeTab={activeTab} />
      </div>

      {/* 浮动创建按钮 */}
      <FloatingBubble
        style={{
          "--initial-position-bottom": "80px",
          "--initial-position-right": "24px",
          "--edge-distance": "24px",
          "--background": "var(--adm-color-primary)",
        }}
        onClick={() => navigate("/activity-create")}
      >
        <AddOutline fontSize={32} color="var(--adm-color-white)" />
      </FloatingBubble>
    </div>
  );
};
