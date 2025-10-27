/**
 * Activity Utils - 活动相关工具函数
 * 包括状态映射、时间格式化等
 */

import type { ActivityStatus } from "../types";

/**
 * 状态信息类型
 */
export interface StatusInfo {
  text: string;
  color: "success" | "warning" | "primary" | "default" | "danger";
  dotColor: string; // 用于显示状态点的颜色
}

/**
 * 获取活动状态信息
 */
export function getStatusInfo(status: ActivityStatus): StatusInfo {
  const statusMap: Record<ActivityStatus, StatusInfo> = {
    recruiting: {
      text: "报名中",
      color: "success",
      dotColor: "#10B981", // 绿色
    },
    recruiting_ended: {
      text: "报名结束",
      color: "warning",
      dotColor: "#F59E0B", // 黄色
    },
    ongoing: {
      text: "活动中",
      color: "primary",
      dotColor: "#4A78FF", // 蓝色
    },
    ended: {
      text: "已结束",
      color: "default",
      dotColor: "#6B7280", // 灰色
    },
    cancelled: {
      text: "已取消",
      color: "danger",
      dotColor: "#EF4444", // 红色
    },
  };

  return (
    statusMap[status] || { text: "未知", color: "default", dotColor: "#9CA3AF" }
  );
}

/**
 * 检查活动是否可以编辑
 */
export function canEditActivity(status: ActivityStatus): boolean {
  // 已结束或已取消的活动不能编辑
  return status !== "ended" && status !== "cancelled";
}

/**
 * 检查活动是否可以删除
 * @param enrolledCount - 已报名人数
 * @returns true 表示可以删除,false 表示不可删除
 */
export function canDeleteActivity(enrolledCount: number): boolean {
  // 有报名者的活动不允许删除
  return enrolledCount === 0;
}

/**
 * 检查活动是否已满员
 */
export function isActivityFull(
  enrolledCount: number,
  capacity: number
): boolean {
  return enrolledCount >= capacity;
}

/**
 * 获取活动容量状态
 */
export function getCapacityStatus(enrolledCount: number, capacity: number) {
  const percentage = (enrolledCount / capacity) * 100;

  if (percentage >= 100) {
    return {
      text: "已满员",
      color: "danger" as const,
      percentage: 100,
    };
  }

  if (percentage >= 80) {
    return {
      text: "即将满员",
      color: "warning" as const,
      percentage,
    };
  }

  return {
    text: "可报名",
    color: "success" as const,
    percentage,
  };
}
