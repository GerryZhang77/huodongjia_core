/**
 * DashboardActivityCard Component
 * 管理后台专用活动卡片组件 - 重新设计版本
 */

import { FC } from "react";
import { Card, Tag } from "antd-mobile";
import {
  EditSOutline,
  UserContactOutline,
  DeleteOutline,
  EyeOutline,
} from "antd-mobile-icons";
import type { Activity } from "../../types";
import {
  getStatusInfo,
  formatTimeRange,
  formatRelativeTime,
  canDeleteActivity,
} from "../../utils";
import { isDemoActivity } from "@/mocks/demo-activity";

/**
 * 组件 Props
 */
export interface DashboardActivityCardProps {
  activity: Activity;
  onEdit: (id: string) => void;
  onManageEnroll: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetail?: (id: string) => void; // 新增：查看详情回调
}

/**
 * 管理后台活动卡片组件
 */
export const DashboardActivityCard: FC<DashboardActivityCardProps> = ({
  activity,
  onEdit,
  onManageEnroll,
  onDelete,
  onViewDetail,
}) => {
  const statusInfo = getStatusInfo(activity.status);
  const isFull = activity.enrolledCount >= activity.capacity;
  const canDelete = canDeleteActivity(activity.enrolledCount);
  const isDemo = isDemoActivity(activity.id);

  return (
    <Card
      className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      bodyClassName="p-0"
    >
      {/* 卡片头部：封面图区域 */}
      <div className="relative w-full h-40 bg-gradient-to-br from-blue-50 to-indigo-100">
        {activity.coverImage ? (
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-60">🎉</div>
          </div>
        )}

        {/* 状态标签 */}
        <div className="absolute top-3 right-3">
          <Tag
            color={statusInfo.color}
            fill="solid"
            className="px-2 py-1 text-xs font-medium rounded-md shadow-sm"
          >
            {statusInfo.text}
          </Tag>
        </div>
      </div>

      {/* 卡片内容区域 */}
      <div className="p-5">
        {/* 标题和简介 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
            {activity.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        </div>

        {/* 核心信息：时间、地点、人数 */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {/* 活动时间 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 text-sm">📅</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 mb-0.5">活动时间</div>
              <div className="text-sm text-gray-900 font-medium truncate">
                {formatTimeRange(activity.activityStart, activity.activityEnd)}
              </div>
            </div>
          </div>

          {/* 地点和人数 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 地点 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-accent-100 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-600 text-xs">📍</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500">地点</div>
                <div className="text-sm text-gray-900 truncate">
                  {activity.location}
                </div>
              </div>
            </div>

            {/* 人数 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-secondary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-secondary-600 text-xs">👥</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500">报名人数</div>
                <div
                  className={`text-sm font-medium ${
                    isFull ? "text-error-500" : "text-gray-900"
                  }`}
                >
                  {activity.enrolledCount}/{activity.capacity}
                  {isFull && <span className="text-xs ml-1">(已满)</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 更新时间 */}
        <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            更新于 {formatRelativeTime(activity.updatedAt)}
          </p>
          {isFull && (
            <Tag color="danger" fill="outline" className="text-xs">
              已满员
            </Tag>
          )}
        </div>

        {/* 操作按钮组 */}
        <div className={`grid ${isDemo ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
          {/* 演示活动：显示详情和管理按钮 */}
          {isDemo ? (
            <>
              <button
                className="flex items-center justify-center gap-1 rounded-lg bg-success-500/10 text-success-600 border-0 hover:bg-success-500/20 transition-all duration-150 h-8 font-medium text-sm px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail?.(activity.id);
                }}
              >
                <EyeOutline fontSize={14} />
                <span>查看详情</span>
              </button>

              <button
                className="flex items-center justify-center gap-1 rounded-lg bg-accent-500/10 text-accent-600 border-0 hover:bg-accent-500/20 transition-all duration-150 h-8 font-medium text-sm px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onManageEnroll(activity.id);
                }}
              >
                <UserContactOutline fontSize={14} />
                <span>管理</span>
              </button>
            </>
          ) : (
            <>
              {/* 正常活动：显示编辑、管理、删除按钮 */}
              <button
                className="flex items-center justify-center gap-1 rounded-lg bg-primary-500/10 text-primary-600 border-0 hover:bg-primary-500/20 transition-all duration-150 h-8 font-medium text-sm px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(activity.id);
                }}
              >
                <EditSOutline fontSize={14} />
                <span>编辑</span>
              </button>

              <button
                className="flex items-center justify-center gap-1 rounded-lg bg-accent-500/10 text-accent-600 border-0 hover:bg-accent-500/20 transition-all duration-150 h-8 font-medium text-sm px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onManageEnroll(activity.id);
                }}
              >
                <UserContactOutline fontSize={14} />
                <span>管理</span>
              </button>

              <button
                disabled={!canDelete}
                className={`flex items-center justify-center gap-1 rounded-lg transition-all duration-150 h-8 font-medium text-sm px-2 border-0 ${
                  !canDelete
                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                    : "bg-error-50 text-error-600 hover:bg-error-100"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(activity.id);
                }}
              >
                <DeleteOutline fontSize={14} />
                <span>删除</span>
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
