/**
 * Activity Utils - 活动工具函数 (共享)
 */

import dayjs from "dayjs";
import type { ActivityStatus } from "../types";

/**
 * 格式化活动时间范围
 */
export function formatActivityTimeRange(
  startTime: string,
  endTime: string
): string {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  if (start.isSame(end, "day")) {
    // 同一天
    return `${start.format("MM月DD日 HH:mm")} - ${end.format("HH:mm")}`;
  } else {
    // 不同天
    return `${start.format("MM月DD日 HH:mm")} - ${end.format(
      "MM月DD日 HH:mm"
    )}`;
  }
}

/**
 * 判断活动是否可报名
 */
export function canEnroll(
  status: ActivityStatus,
  registrationEndTime: string,
  enrolledCount: number,
  maxParticipants: number
): boolean {
  if (status !== "registration") return false;
  if (dayjs().isAfter(registrationEndTime)) return false;
  if (enrolledCount >= maxParticipants) return false;
  return true;
}

/**
 * 获取报名状态文本
 */
export function getEnrollmentStatusText(
  status: ActivityStatus,
  registrationEndTime: string,
  enrolledCount: number,
  maxParticipants: number
): string {
  if (status === "draft") return "未发布";
  if (status === "completed") return "已结束";
  if (status === "cancelled") return "已取消";
  if (dayjs().isAfter(registrationEndTime)) return "报名已截止";
  if (enrolledCount >= maxParticipants) return "名额已满";
  return "立即报名";
}
