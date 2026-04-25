/**
 * 导出报名数据 Hook
 * 支持导出为 Excel 文件
 */

import { useState, useCallback } from "react";
import { Toast } from "@/components/ui/Toast";
import * as XLSX from "xlsx";
import type { Enrollment } from "@/types/enrollment";

interface UseExportEnrollmentsOptions {
  activityId?: string;
  activityTitle?: string;
}

interface UseExportEnrollmentsReturn {
  isExporting: boolean;
  exportToExcel: (enrollments: Enrollment[], filename?: string) => void;
  downloadFromServer: (token: string, activityId: string) => Promise<void>;
}

/**
 * 状态标签映射
 */
const STATUS_MAP: Record<string, string> = {
  approved: "已通过",
  pending: "待审核",
  rejected: "已拒绝",
  cancelled: "已取消",
  waitlist: "候补",
};

/**
 * 性别映射
 */
const GENDER_MAP: Record<string, string> = {
  male: "男",
  female: "女",
  other: "其他",
};

/**
 * 导出报名数据 Hook
 */
export function useExportEnrollments(
  options: UseExportEnrollmentsOptions = {},
): UseExportEnrollmentsReturn {
  const { activityTitle = "活动" } = options;
  const [isExporting, setIsExporting] = useState(false);

  /**
   * 前端直接导出为 Excel
   */
  const exportToExcel = useCallback(
    (enrollments: Enrollment[], filename?: string) => {
      if (enrollments.length === 0) {
        Toast.show({ content: "暂无数据可导出" });
        return;
      }

      setIsExporting(true);

      try {
        // 转换数据格式
        const exportData = enrollments.map((e, index) => ({
          序号: index + 1,
          姓名: e.name,
          性别: GENDER_MAP[e.gender || ""] || e.gender || "",
          年龄: e.age || "",
          手机号: e.phone || "",
          邮箱: e.email || "",
          职业: e.occupation || "",
          公司: e.company || "",
          城市: e.city || "",
          兴趣标签: e.tags?.join("、") || "",
          个人简介: e.bio || "",
          匹配需求: e.matchingNeeds || "",
          状态: STATUS_MAP[e.status] || e.status,
          报名时间: e.enrolledAt
            ? new Date(e.enrolledAt).toLocaleString("zh-CN")
            : "",
        }));

        // 创建工作簿
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // 设置列宽
        const columnWidths = [
          { wch: 6 }, // 序号
          { wch: 10 }, // 姓名
          { wch: 6 }, // 性别
          { wch: 6 }, // 年龄
          { wch: 14 }, // 手机号
          { wch: 24 }, // 邮箱
          { wch: 12 }, // 职业
          { wch: 16 }, // 公司
          { wch: 10 }, // 城市
          { wch: 20 }, // 兴趣标签
          { wch: 30 }, // 个人简介
          { wch: 30 }, // 匹配需求
          { wch: 10 }, // 状态
          { wch: 20 }, // 报名时间
        ];
        worksheet["!cols"] = columnWidths;

        // 添加工作表
        XLSX.utils.book_append_sheet(workbook, worksheet, "报名数据");

        // 生成文件名
        const date = new Date().toISOString().slice(0, 10);
        const defaultFilename = `${activityTitle}_报名数据_${date}.xlsx`;

        // 下载文件
        XLSX.writeFile(workbook, filename || defaultFilename);

        Toast.show({
          content: `成功导出 ${enrollments.length} 条数据`,
          icon: "success",
        });
      } catch (error) {
        console.error("导出失败:", error);
        Toast.show({ content: "导出失败，请重试" });
      } finally {
        setIsExporting(false);
      }
    },
    [activityTitle],
  );

  /**
   * 从服务器下载导出文件
   */
  const downloadFromServer = useCallback(
    async (token: string, activityId: string) => {
      setIsExporting(true);

      try {
        const response = await fetch(
          `/api/events/${activityId}/enrollments/export`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (result.success && result.data?.download_url) {
          // 触发下载
          const link = document.createElement("a");
          link.href = result.data.download_url;
          link.download = `报名数据_${activityId}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          Toast.show({
            content: "文件下载已开始",
            icon: "success",
          });
        } else {
          Toast.show({ content: result.message || "导出失败" });
        }
      } catch (error) {
        console.error("下载失败:", error);
        Toast.show({ content: "网络错误，请检查网络连接" });
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return {
    isExporting,
    exportToExcel,
    downloadFromServer,
  };
}

export default useExportEnrollments;
