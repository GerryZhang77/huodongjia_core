/**
 * useImportEnrollments - 批量导入报名
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importEnrollments } from "../services/enrollmentManageApi";

/**
 * 批量导入报名 Hook
 */
export function useImportEnrollments(activityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return importEnrollments(activityId, formData);
    },
    onSuccess: () => {
      // 刷新报名列表
      queryClient.invalidateQueries({
        queryKey: ["merchant", "enrollment", "list", activityId],
      });
    },
  });
}
