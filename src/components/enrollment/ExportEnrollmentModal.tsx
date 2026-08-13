/**
 * 导出报名数据预览弹窗
 * 显示导出预览，让用户确认后下载 Excel 文件
 */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  X,
  Download,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import type { Enrollment } from "@/types/enrollment";
import {
  buildEnrollmentExportFields,
  buildEnrollmentExportRow,
  type EnrollmentExportField,
  type EnrollmentExportRegistrationType,
} from "@/features/enrollment/utils/enrollmentExportModel";

// ========================================
// 类型定义
// ========================================

interface ExportEnrollmentModalProps {
  visible: boolean;
  activityId: string;
  activityTitle?: string;
  enrollments: Enrollment[];
  registrationFormSchema?: Enrollment["formSchemaSnapshot"];
  registrationTypes?: EnrollmentExportRegistrationType[];
  onClose: () => void;
}

function areFieldsSame(a: EnrollmentExportField[], b: EnrollmentExportField[]) {
  if (a.length !== b.length) return false;
  return a.every(
    (field, index) =>
      field.key === b[index].key &&
      field.label === b[index].label &&
      field.enabled === b[index].enabled &&
      field.semantic === b[index].semantic &&
      JSON.stringify(field.stableKeys || []) ===
        JSON.stringify(b[index].stableKeys || []) &&
      JSON.stringify(field.labels || []) === JSON.stringify(b[index].labels || []),
  );
}

// ========================================
// 组件实现
// ========================================

const ExportEnrollmentModal: React.FC<ExportEnrollmentModalProps> = ({
  visible,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activityId,
  activityTitle = "活动",
  enrollments,
  registrationFormSchema,
  registrationTypes,
  onClose,
}) => {
  const availableFields = useMemo(
    () =>
      buildEnrollmentExportFields(enrollments, {
        registrationFormSchema,
        registrationTypes,
      }),
    [enrollments, registrationFormSchema, registrationTypes],
  );
  // 导出字段配置
  const [exportFields, setExportFields] = useState<EnrollmentExportField[]>(
    availableFields,
  );
  // 导出状态
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  // 预览分页
  const [previewPage, setPreviewPage] = useState(0);
  const previewPageSize = 5;

  useEffect(() => {
    setExportFields((prev) => {
      const previousEnabled = new Map(prev.map((field) => [field.key, field.enabled]));
      const next = availableFields.map((field) => ({
        ...field,
        enabled: previousEnabled.get(field.key) ?? field.enabled,
      }));
      return areFieldsSame(prev, next) ? prev : next;
    });
  }, [availableFields]);

  // 启用的字段
  const enabledFields = useMemo(
    () => exportFields.filter((f) => f.enabled),
    [exportFields],
  );
  const formFields = useMemo(
    () => exportFields.filter((field) => field.source === "form"),
    [exportFields],
  );
  const systemFields = useMemo(
    () => exportFields.filter((field) => field.source === "system"),
    [exportFields],
  );

  // 转换单条数据
  const transformEnrollment = useCallback(
    (e: Enrollment, index: number) =>
      buildEnrollmentExportRow(e, index, enabledFields),
    [enabledFields],
  );

  // 预览数据
  const previewData = useMemo(() => {
    const start = previewPage * previewPageSize;
    return enrollments
      .slice(start, start + previewPageSize)
      .map((e, i) => transformEnrollment(e, start + i));
  }, [enrollments, previewPage, transformEnrollment]);

  // 总页数
  const totalPages = Math.ceil(enrollments.length / previewPageSize);

  // 切换字段启用状态
  const toggleField = (key: string) => {
    setExportFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)),
    );
  };

  const renderFieldButtons = (fields: EnrollmentExportField[]) =>
    fields.map((field) => (
      <button
        key={field.key}
        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
          field.enabled
            ? "bg-green-50 border-green-300 text-green-700"
            : "bg-gray-50 border-gray-200 text-gray-500"
        }`}
        onClick={() => toggleField(field.key)}
      >
        {field.enabled && (
          <CheckCircle2
            size={14}
            className="inline-block mr-1 -mt-0.5"
          />
        )}
        {field.label}
      </button>
    ));

  // 执行导出
  const handleExport = useCallback(() => {
    if (enrollments.length === 0) return;

    setIsExporting(true);

    try {
      // 转换所有数据
      const exportData = enrollments.map((e, i) => transformEnrollment(e, i));

      // 创建工作簿
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // 设置列宽 (根据字段数量动态设置)
      const columnWidths = enabledFields.map((field) => {
        switch (field.key) {
          case "index":
            return { wch: 6 };
          case "name":
            return { wch: 10 };
          case "gender":
            return { wch: 6 };
          case "age":
            return { wch: 6 };
          case "phone":
            return { wch: 14 };
          case "email":
            return { wch: 24 };
          case "occupation":
            return { wch: 12 };
          case "company":
            return { wch: 16 };
          case "city":
            return { wch: 10 };
          case "tags":
            return { wch: 20 };
          case "registrationTypeName":
            return { wch: 14 };
          case "bio":
          case "matchingNeeds":
            return { wch: 30 };
          case "status":
            return { wch: 10 };
          case "enrolledAt":
            return { wch: 20 };
          default:
            return { wch: 12 };
        }
      });
      worksheet["!cols"] = columnWidths;

      // 添加工作表
      XLSX.utils.book_append_sheet(workbook, worksheet, "报名数据");

      // 生成文件名
      const date = new Date().toISOString().slice(0, 10);
      const filename = `${activityTitle}_报名数据_${date}.xlsx`;

      // 下载文件
      XLSX.writeFile(workbook, filename);

      setExportSuccess(true);
    } catch (error) {
      console.error("导出失败:", error);
    } finally {
      setIsExporting(false);
    }
  }, [enrollments, enabledFields, transformEnrollment, activityTitle]);

  // 关闭时重置状态
  const handleClose = () => {
    setExportSuccess(false);
    setPreviewPage(0);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 bottom-mobile-tabbar z-50 flex items-center justify-center bg-black/50 px-4 py-4 lg:inset-0 lg:p-0">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-full lg:mx-4 lg:max-h-[90vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              导出报名数据
            </h2>
          </div>
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            onClick={handleClose}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 导出成功状态 */}
          {exportSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                导出成功
              </h3>
              <p className="text-gray-500 text-center">
                已成功导出{" "}
                <span className="text-green-600 font-medium">
                  {enrollments.length}
                </span>{" "}
                条报名数据
              </p>
              <p className="text-sm text-gray-400 mt-2">文件已下载到您的设备</p>
            </div>
          ) : (
            <>
              {/* 导出概要 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      共 {enrollments.length} 条报名数据
                    </p>
                    <p className="text-sm text-gray-500">
                      将导出为 Excel 文件 (.xlsx)
                    </p>
                  </div>
                </div>
              </div>

              {/* 字段选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择导出字段
                </label>
                <div className="space-y-3">
                  <div>
                    <p className="mb-1.5 text-xs text-gray-500">报名表字段</p>
                    <div className="flex flex-wrap gap-2">
                      {renderFieldButtons(formFields)}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs text-gray-500">系统字段</p>
                    <div className="flex flex-wrap gap-2">
                      {renderFieldButtons(systemFields)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  已选择 {enabledFields.length} 个字段
                </p>
              </div>

              {/* 数据预览 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    数据预览
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
                      disabled={previewPage === 0}
                      onClick={() => setPreviewPage((p) => p - 1)}
                    >
                      <ChevronLeft size={16} className="text-gray-500" />
                    </button>
                    <span className="text-xs text-gray-500">
                      {previewPage + 1} / {totalPages || 1}
                    </span>
                    <button
                      className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
                      disabled={previewPage >= totalPages - 1}
                      onClick={() => setPreviewPage((p) => p + 1)}
                    >
                      <ChevronRight size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {enabledFields.map((field) => (
                            <th
                              key={field.key}
                              className="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap border-b border-gray-200"
                            >
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.length > 0 ? (
                          previewData.map((row, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 last:border-0"
                            >
                              {enabledFields.map((field) => (
                                <td
                                  key={field.key}
                                  className="px-3 py-2 text-gray-900 whitespace-nowrap max-w-[200px] truncate"
                                >
                                  {row[field.label] || "-"}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={enabledFields.length}
                              className="px-3 py-8 text-center text-gray-500"
                            >
                              暂无数据
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  预览前{" "}
                  {Math.min(
                    enrollments.length,
                    (previewPage + 1) * previewPageSize,
                  )}{" "}
                  条数据中的第 {previewPage * previewPageSize + 1}-
                  {Math.min(
                    enrollments.length,
                    (previewPage + 1) * previewPageSize,
                  )}{" "}
                  条
                </p>
              </div>
            </>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
          {exportSuccess ? (
            <button
              className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap rounded-lg bg-green-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 [&>svg]:shrink-0"
              onClick={handleClose}
            >
              <CheckCircle2 size={16} />
              完成
            </button>
          ) : (
            <>
              <button
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg"
                onClick={handleClose}
                disabled={isExporting}
              >
                取消
              </button>
              <button
              className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50 [&>svg]:shrink-0"
                onClick={handleExport}
                disabled={
                  isExporting ||
                  enrollments.length === 0 ||
                  enabledFields.length === 0
                }
              >
                {isExporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    导出中...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    导出 Excel
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportEnrollmentModal;
