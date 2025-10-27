/**
 * Activity Utils
 * 活动工具函数
 */

import type { ActivityStatus } from "../types";

/**
 * 格式化日期
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

/**
 * 获取参与率
 */
export function getParticipationRate(
  enrolledCount: number,
  capacity: number
): number {
  if (capacity === 0) return 0;
  return Math.round((enrolledCount / capacity) * 100);
}

/**
 * 获取状态标签配置
 */
export function getStatusTag(status: ActivityStatus): {
  text: string;
  color: string;
} {
  const statusMap: Record<ActivityStatus, { text: string; color: string }> = {
    recruiting: { text: "招募中", color: "primary" },
    recruiting_ended: { text: "招募结束", color: "warning" },
    ongoing: { text: "进行中", color: "success" },
    ended: { text: "已结束", color: "default" },
    cancelled: { text: "已取消", color: "danger" },
  };

  return statusMap[status] || { text: "未知", color: "default" };
}

/**
 * 获取参与率颜色 (使用 CSS 变量，符合设计系统规范)
 */
export function getParticipationRateColor(rate: number): string {
  if (rate >= 90) return "var(--adm-color-success)"; // 绿色 - 几乎满员
  if (rate >= 70) return "var(--adm-color-primary)"; // 蓝色 - 进展良好
  if (rate >= 50) return "var(--adm-color-warning)"; // 橙色 - 需要推广
  return "var(--adm-color-danger)"; // 红色 - 报名较少
}
