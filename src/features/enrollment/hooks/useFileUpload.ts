/**
 * File Upload Hook
 * 文件上传自定义 Hook
 */

import { useMutation } from "@tanstack/react-query";
import { Toast } from "antd-mobile";
import { fileUploadApi } from "../services";
import type { FileUploadResponse } from "../types";

/**
 * 文件上传 Hook
 * @returns useMutation 实例
 */
export const useFileUpload = () => {
  return useMutation<FileUploadResponse, Error, File>({
    mutationFn: (file: File) => fileUploadApi.uploadExcel(file),
    onSuccess: (response) => {
      console.log("文件上传成功，完整响应:", response);
      console.log("文件路径:", response?.path); // 使用 path 字段
      console.log("原始文件名:", response?.originalname);
    },
    onError: (error) => {
      console.error("文件上传失败:", error);
      Toast.show({
        icon: "fail",
        content: error.message || "文件上传失败，请重试",
      });
    },
  });
};
