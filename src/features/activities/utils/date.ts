/**
 * Date Utils - 日期时间格式化工具
 * 基于 dayjs 实现
 */

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import "dayjs/locale/zh-cn";

// 配置 dayjs
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale("zh-cn");

/**
 * 格式化时间段
 * @param start 开始时间
 * @param end 结束时间
 * @returns 格式化的时间段字符串
 *
 * @example
 * formatTimeRange('2025-10-20T00:00:00Z', '2025-10-27T23:59:59Z')
 * // => '10/20 00:00 - 10/27 23:59'
 */
export function formatTimeRange(start: string, end: string): string {
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  // 同一天
  if (startDate.isSame(endDate, "day")) {
    return `${startDate.format("MM/DD HH:mm")} - ${endDate.format("HH:mm")}`;
  }

  // 同一年
  if (startDate.isSame(endDate, "year")) {
    return `${startDate.format("MM/DD HH:mm")} - ${endDate.format(
      "MM/DD HH:mm"
    )}`;
  }

  // 跨年
  return `${startDate.format("YYYY/MM/DD HH:mm")} - ${endDate.format(
    "YYYY/MM/DD HH:mm"
  )}`;
}

/**
 * 格式化单个日期时间
 * @param date 日期字符串
 * @param format 格式类型
 * @returns 格式化的日期时间字符串
 */
export function formatDateTime(
  date: string,
  format: "relative" | "full" | "date" | "time" = "full"
): string {
  const d = dayjs(date);

  switch (format) {
    case "relative":
      // "2小时前", "3天前"
      return d.fromNow();

    case "date":
      // "2025-10-27"
      return d.format("YYYY-MM-DD");

    case "time":
      // "14:30"
      return d.format("HH:mm");

    case "full":
    default:
      // "2025-10-27 14:30"
      return d.format("YYYY-MM-DD HH:mm");
  }
}

/**
 * 格式化相对时间（更友好的显示）
 * @param date 日期字符串
 * @returns 友好的相对时间
 *
 * @example
 * formatRelativeTime('2025-10-27T14:00:00Z')
 * // 刚刚、5分钟前、2小时前、昨天、3天前、2025-10-20
 */
export function formatRelativeTime(date: string): string {
  const d = dayjs(date);
  const now = dayjs();
  const diffMinutes = now.diff(d, "minute");
  const diffHours = now.diff(d, "hour");
  const diffDays = now.diff(d, "day");

  if (diffMinutes < 1) {
    return "刚刚";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }

  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }

  if (diffDays === 1) {
    return "昨天";
  }

  if (diffDays < 7) {
    return `${diffDays}天前`;
  }

  // 超过7天显示具体日期
  return d.format("MM-DD");
}

/**
 * 判断时间段是否正在进行中
 */
export function isOngoing(start: string, end: string): boolean {
  const now = dayjs();
  return now.isAfter(start) && now.isBefore(end);
}

/**
 * 判断时间段是否已结束
 */
export function isEnded(end: string): boolean {
  return dayjs().isAfter(end);
}

/**
 * 判断时间段是否未开始
 */
export function isNotStarted(start: string): boolean {
  return dayjs().isBefore(start);
}

/**
 * 获取剩余天数
 */
export function getDaysUntil(date: string): number {
  return dayjs(date).diff(dayjs(), "day");
}

/**
 * 格式化剩余时间
 */
export function formatTimeUntil(date: string): string {
  const days = getDaysUntil(date);

  if (days < 0) {
    return "已过期";
  }

  if (days === 0) {
    const hours = dayjs(date).diff(dayjs(), "hour");
    if (hours < 1) {
      const minutes = dayjs(date).diff(dayjs(), "minute");
      return `还剩 ${minutes} 分钟`;
    }
    return `还剩 ${hours} 小时`;
  }

  if (days === 1) {
    return "明天";
  }

  if (days < 7) {
    return `还剩 ${days} 天`;
  }

  return dayjs(date).format("MM月DD日");
}
