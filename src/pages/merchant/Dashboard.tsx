/**
 * Dashboard Page - 商家管理后台
 * 商家登录后的第一个页面，展示所有创建的活动
 */

import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ErrorBlock, DotLoading, Dialog, Empty } from "antd-mobile";
import { AddOutline } from "antd-mobile-icons";
import {
  useActivities,
  useDeleteActivity,
} from "@/features/activities/hooks/useActivities";
import { DashboardActivityCard } from "@/features/activities/components/DashboardActivityCard";
import {
  demoActivity,
  isDemoMode,
  isDemoActivity,
} from "@/mocks/demo-activity";

/**
 * Dashboard 页面组件
 */
export const Dashboard: FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useActivities();
  const { deleteActivity, isDeleting } = useDeleteActivity();

  // 演示模式控制
  const showDemoMode = isDemoMode();

  // 处理操作
  const handleEdit = (id: string) => {
    navigate(`/activity-edit/${id}`);
  };

  const handleManageEnroll = (id: string) => {
    navigate(`/activity-manage/${id}`);
  };

  const handleViewDetail = (id: string) => {
    // 演示活动路由到预览详情页
    if (isDemoActivity(id)) {
      navigate(`/activity/preview/${id}`);
    } else {
      navigate(`/activity-detail/${id}`);
    }
  };

  const handleDelete = (id: string) => {
    const activity = data?.activities.find((a) => a.id === id);
    if (!activity) return;

    // 检查是否有报名者
    if (activity.enrolledCount > 0) {
      Dialog.alert({
        content: `该活动已有 ${activity.enrolledCount} 人报名,无法删除。\n\n如需删除,请先取消所有报名。`,
        confirmText: "我知道了",
      });
      return;
    }

    deleteActivity(id, activity.title);
  };

  // 加载态 - 演示模式下跳过加载提示
  if (isLoading && !showDemoMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 头部骨架屏 */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-5 md:px-8 py-4">
            <div>
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-9 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        {/* 加载动画 */}
        <div className="flex flex-col items-center justify-center py-20">
          <DotLoading color="primary" />
          <p className="text-gray-500 mt-4">正在加载活动列表...</p>
        </div>
      </div>
    );
  }

  // 错误态 - 演示模式下跳过错误提示
  if (error && !showDemoMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 简化头部 */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-5 md:px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-900">我的活动</h1>
          </div>
        </div>

        {/* 错误信息 */}
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">
          <ErrorBlock
            status="default"
            title="加载失败"
            description={error.message || "网络连接异常，请检查网络后重试"}
          >
            <Button
              color="primary"
              onClick={() => void refetch()}
              className="rounded-lg"
            >
              重新加载
            </Button>
          </ErrorBlock>
        </div>
      </div>
    );
  }

  // 合并真实活动和演示活动
  const realActivities = data?.activities || [];
  const activities = showDemoMode
    ? [demoActivity] // 演示模式：只显示演示活动
    : realActivities; // 正常模式：显示真实活动

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-5 md:px-8 py-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">我的活动</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* 通知图标 */}
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center relative">
              <span className="text-gray-600 text-lg">🔔</span>
              {/* 红点提示 */}
              <span className="absolute top-0 right-0 w-2 h-2 bg-error-500 rounded-full"></span>
            </div>
            {/* 用户头像 */}
            <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">张</span>
            </div>
          </div>
        </div>
      </div>

      {/* 创建活动按钮区域 - 独立一行 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-4">
          <Button
            color="primary"
            size="large"
            block
            onClick={() => navigate("/activity/create")}
            className="rounded-xl h-12 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-center gap-2">
              <AddOutline className="text-lg" />
              <span>创建活动</span>
            </div>
          </Button>
        </div>
      </div>

      {/* 活动列表 */}
      {/* 内容区域 */}
      <div className="pb-20">
        {/* 活动列表为空 */}
        {activities.length === 0 ? (
          <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">
            <Empty
              description="还没有创建任何活动"
              className="py-20"
              imageStyle={{ width: 120 }}
            />
            <div className="text-center mt-4">
              <Button
                color="primary"
                onClick={() => navigate("/activity/create")}
                className="rounded-lg"
              >
                创建第一个活动
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* 活动列表标题 */}
            <div className="max-w-4xl mx-auto px-5 md:px-8 pt-4 pb-2">
              <h2 className="text-base font-semibold text-gray-900">
                全部活动 ({activities.length})
              </h2>
            </div>

            {/* 活动卡片列表 */}
            <div className="max-w-4xl mx-auto px-5 md:px-8 pb-4 space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  style={{
                    animation: `slideInUp 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <DashboardActivityCard
                    activity={activity}
                    onEdit={() => handleEdit(activity.id)}
                    onManageEnroll={() => handleManageEnroll(activity.id)}
                    onDelete={() => void handleDelete(activity.id)}
                    onViewDetail={() => handleViewDetail(activity.id)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 删除加载遮罩 */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4">
            <DotLoading color="primary" />
            <div className="mt-2 text-sm text-gray-600">删除中...</div>
          </div>
        </div>
      )}
    </div>
  );
};
