/**
 * ActivityManage Page - 活动管理页面
 * 包含报名管理、匹配管理等功能
 */

import { FC, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, NavBar, ErrorBlock, DotLoading } from "antd-mobile";
import { useActivityDetail } from "@/features/activities/hooks/useActivityDetail";
import { EnrollmentManageTab } from "@/features/enrollment/components/EnrollmentManageTab";

/**
 * Tab 类型定义
 */
type TabKey = "enroll" | "match";

/**
 * ActivityManage 页面组件
 */
export const ActivityManage: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>("enroll");

  // 获取活动详情
  const { activity, loading } = useActivityDetail(id!);

  // 返回上一页
  const handleBack = () => {
    navigate("/dashboard");
  };

  // 加载态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar onBack={handleBack}>活动管理</NavBar>
        <div className="flex flex-col items-center justify-center py-20">
          <DotLoading color="primary" />
          <p className="text-gray-500 mt-4">正在加载活动信息...</p>
        </div>
      </div>
    );
  }

  // 错误态
  if (!activity && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar onBack={handleBack}>活动管理</NavBar>
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">
          <ErrorBlock
            status="default"
            title="加载失败"
            description="活动不存在或已被删除"
          />
        </div>
      </div>
    );
  }

  if (!activity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <NavBar onBack={handleBack} className="bg-white border-b border-gray-200">
        活动管理
      </NavBar>

      {/* 活动信息卡片 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-4">
          <div className="flex items-start gap-4">
            {/* 封面图 */}
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0 overflow-hidden">
              {activity.coverImage ? (
                <img
                  src={activity.coverImage}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl opacity-60">🎉</span>
                </div>
              )}
            </div>

            {/* 活动信息 */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                {activity.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  📅 {new Date(activity.activityStart).toLocaleDateString()}
                </span>
                <span>
                  👥 {activity.enrolledCount}/{activity.capacity}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              // 如果切换到匹配管理，跳转到完整的匹配配置页面
              if (key === "match") {
                // 🔥 临时修改：Mock 生产环境专用 - 强制使用正确的 event ID
                const CORRECT_EVENT_ID = "00000000-0000-0000-0000-000000000000";
                navigate(`/activity/${CORRECT_EVENT_ID}/matching`);
              } else {
                setActiveTab(key as TabKey);
              }
            }}
            className="activity-manage-tabs"
          >
            <Tabs.Tab title="报名管理" key="enroll" />
            <Tabs.Tab title="匹配管理" key="match" />
          </Tabs>
        </div>
      </div>

      {/* Tab 内容区 */}
      <div className="max-w-4xl mx-auto">
        {activeTab === "enroll" && <EnrollmentManageTab activityId={id!} />}
      </div>
    </div>
  );
};
