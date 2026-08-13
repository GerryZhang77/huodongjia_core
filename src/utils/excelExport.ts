/**
 * Excel 导出工具
 * 用于将报名数据导出为 Excel 文件
 */

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { Enrollment } from "@/features/enrollment/types";
import {
  buildEnrollmentExportFields,
  buildEnrollmentExportRow,
} from "@/features/enrollment/utils/enrollmentExportModel";

/**
 * 导出报名数据为 Excel
 * @param enrollments 报名数据列表
 * @param activityTitle 活动标题（用于文件名）
 */
export const exportEnrollmentsToExcel = (
  enrollments: Enrollment[],
  activityTitle: string = "活动"
): void => {
  try {
    const fields = buildEnrollmentExportFields(enrollments);
    const allHeaders = fields.map((field) => field.label);
    const data = enrollments.map((enrollment, index) => {
      const row = buildEnrollmentExportRow(enrollment, index, fields);
      return fields.map((field) => row[field.label] ?? "");
    });

    // 5. 将表头和数据合并
    const worksheetData = [allHeaders, ...data];

    // 6. 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // 7. 设置列宽
    const columnWidths = allHeaders.map((header) => {
      // 根据表头长度和内容设置合适的列宽
      let maxLength = header.length;

      // 检查该列的最大内容长度
      data.forEach((row) => {
        const cellValue = String(row[allHeaders.indexOf(header)] || "");
        if (cellValue.length > maxLength) {
          maxLength = cellValue.length;
        }
      });

      // 限制最大宽度，避免过宽
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
    });

    worksheet["!cols"] = columnWidths;

    // 8. 设置表头样式（加粗）
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!worksheet[address]) continue;
      if (!worksheet[address].s) worksheet[address].s = {};
      worksheet[address].s.font = { bold: true };
    }

    // 9. 创建工作簿
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "报名名单");

    // 10. 生成文件名（含时间戳）
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "")
      .replace("T", "_");
    const filename = `${activityTitle}_报名名单_${timestamp}.xlsx`;

    // 11. 导出文件
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, filename);
  } catch (error) {
    console.error("导出 Excel 失败:", error);
    throw new Error("导出失败，请稍后重试");
  }
};

/**
 * 导出选中的报名数据为 Excel
 * @param allEnrollments 所有报名数据
 * @param selectedIds 选中的报名 ID 列表
 * @param activityTitle 活动标题
 */
export const exportSelectedEnrollments = (
  allEnrollments: Enrollment[],
  selectedIds: string[],
  activityTitle: string = "活动"
): void => {
  // 筛选出选中的报名数据
  const selectedEnrollments = allEnrollments.filter((enrollment) =>
    selectedIds.includes(enrollment.id)
  );

  if (selectedEnrollments.length === 0) {
    throw new Error("没有可导出的数据");
  }

  exportEnrollmentsToExcel(selectedEnrollments, activityTitle);
};
