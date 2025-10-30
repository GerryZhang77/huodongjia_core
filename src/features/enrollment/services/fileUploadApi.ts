/**
 * File Upload API Service
 * 文件上传 API 服务
 */

import { api } from "@/lib/api";
import { FileUploadResponse } from "../types";

/**
 * 文件上传 API
 */
export const fileUploadApi = {
  /**
   * 上传 Excel 文件
   * @param file - 要上传的文件
   * @returns 文件上传响应（包含服务端文件路径）
   */
  uploadExcel: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<FileUploadResponse>(
      "/api/file/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response;
  },
};
