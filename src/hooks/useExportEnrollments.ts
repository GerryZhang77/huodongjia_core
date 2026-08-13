/**
 * 导出报名数据 Hook
 * 支持导出为 Excel 文件
 */

import { useState, useCallback } from "react";
import { Toast } from "@/components/ui/Toast";
import * as XLSX from "xlsx";
import type { Enrollment } from "@/types/enrollment";
import {
  buildEnrollmentExportFields,
  buildEnrollmentExportRow,
} from "@/features/enrollment/utils/enrollmentExportModel";

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
        const fields = buildEnrollmentExportFields(enrollments);
        const exportData = enrollments.map((enrollment, index) =>
          buildEnrollmentExportRow(enrollment, index, fields),
        );

        // 创建工作簿
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // 设置列宽
        const columnWidths = fields.map((field) => ({
          wch: field.key === "index"
            ? 6
            : field.key === "enrolledAt"
              ? 20
              : Math.min(Math.max(field.label.length + 4, 10), 36),
        }));
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
