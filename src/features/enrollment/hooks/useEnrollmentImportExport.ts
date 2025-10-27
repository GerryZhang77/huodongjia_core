/**
 * 导入导出报名数据 Hook
 */

import { useState } from "react";
import { Toast } from "antd-mobile";
import { importEnrollments, exportEnrollments } from "../services";

export const useEnrollmentImportExport = () => {
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleImport = async (
    activityId: string,
    file: File,
    onSuccess?: () => void
  ) => {
    setImportLoading(true);

    try {
      const result = await importEnrollments({ activityId, file });

      Toast.show({
        icon: "success",
        content: `成功导入 ${result.imported} 条记录${
          result.failed > 0 ? `，失败 ${result.failed} 条` : ""
        }`,
      });

      onSuccess?.();
    } catch (error) {
      console.error("导入失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "导入失败",
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleExport = async (activityId: string) => {
    setExportLoading(true);

    try {
      const blob = await exportEnrollments(activityId);

      // 下载文件
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `enrollments_${activityId}_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      Toast.show({
        icon: "success",
        content: "导出成功",
      });
    } catch (error) {
      console.error("导出失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "导出失败",
      });
    } finally {
      setExportLoading(false);
    }
  };

  return {
    handleImport,
    handleExport,
    importLoading,
    exportLoading,
  };
};
