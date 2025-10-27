/**
 * Enrollment Module - Constants
 * 报名模块 - 常量定义
 */

import type { EnrollmentStatus } from "../types";

/**
 * 报名状态选项
 */
export const ENROLLMENT_STATUS_OPTIONS = [
  { label: "全部", value: "all" },
  { label: "待审核", value: "pending" },
  { label: "已通过", value: "approved" },
  { label: "已拒绝", value: "rejected" },
  { label: "已取消", value: "cancelled" },
];

/**
 * 获取状态标签颜色
 */
export const getStatusColor = (status: EnrollmentStatus): string => {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "cancelled":
      return "default";
    default:
      return "warning";
  }
};

/**
 * 获取状态文本
 */
export const getStatusText = (status: EnrollmentStatus): string => {
  switch (status) {
    case "approved":
      return "已通过";
    case "rejected":
      return "已拒绝";
    case "cancelled":
      return "已取消";
    default:
      return "待审核";
  }
};
