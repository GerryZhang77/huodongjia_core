/**
 * 统一图片上传 Hook（pending + tempId 乐观更新）
 *
 * 解决的痛点：
 * - 头像 / 相册 / 活动封面 / 回顾图 之前各自处理 loading 与错误回滚，写法分散且会闪烁
 * - 网速差时用户看不到任何反馈
 *
 * 用法：
 *   const { uploadWithPreview } = useImageUpload({ kind: "photo" });
 *
 *   const handleAdd = (file: File) => {
 *     const { tempUrl, finalUrlPromise } = uploadWithPreview(file);
 *     setList(prev => [...prev, tempUrl]);                         // 立即出现预览
 *     finalUrlPromise
 *       .then(real => setList(prev => prev.map(u => u === tempUrl ? real : u)))
 *       .catch(() => setList(prev => prev.filter(u => u !== tempUrl)));
 *   };
 *
 * 设计要点：
 * - tempUrl 用 URL.createObjectURL 即时生成，立即在 UI 显示
 * - finalUrlPromise resolve 时调用方负责把 tempUrl 替换成真实 url
 * - hook 内部统一在 settle 时 revokeObjectURL，避免内存泄漏
 * - 文件类型 / 大小校验前置（默认 5MB），不通过直接 reject
 * - kind 决定调用哪个上传 API；新增类型只改 dispatch
 */

import { useCallback } from "react";
import { Toast } from "@/components/ui/Toast";
import { uploadCoverImage } from "@/features/activities/services/activityApi";
import { userApi, uploadMerchantAvatar } from "@/services";

export type ImageUploadKind =
  | "avatar"
  | "photo"
  | "cover"
  | "recap"
  | "merchant-avatar";

export interface UploadHandle {
  /** 立即可用的本地预览 URL（blob:）— 上传成功/失败后会自动 revoke */
  tempUrl: string;
  /** 上传成功 → 返回 server 真实 URL；失败 → reject */
  finalUrlPromise: Promise<string>;
}

interface Options {
  kind: ImageUploadKind;
  /** 单文件最大字节数，默认 5MB */
  maxBytes?: number;
  /** 校验失败时是否自动 toast，默认 true */
  showToastOnError?: boolean;
}

const DEFAULT_MAX = 5 * 1024 * 1024;

/**
 * 根据 kind 派发到具体上传函数
 */
async function dispatchUpload(kind: ImageUploadKind, file: File): Promise<string> {
  switch (kind) {
    case "avatar": {
      const res = await userApi.uploadAvatar(file);
      if (!res.success || !res.avatarUrl) throw new Error("上传失败");
      return res.avatarUrl;
    }
    case "merchant-avatar": {
      const res = await uploadMerchantAvatar(file);
      if (!res.success || !res.data?.url) throw new Error(res.message || "上传失败");
      return res.data.url;
    }
    case "photo": {
      const res = await userApi.uploadPhoto(file);
      if (!res.success || !res.url) throw new Error("上传失败");
      return res.url;
    }
    case "cover":
    case "recap":
      // 二者都用活动图片 bucket
      return uploadCoverImage(file);
  }
}

export function useImageUpload(opts: Options) {
  const { kind, maxBytes = DEFAULT_MAX, showToastOnError = true } = opts;

  const uploadWithPreview = useCallback(
    (file: File): UploadHandle => {
      // 1) 前置校验
      if (!file.type.startsWith("image/")) {
        if (showToastOnError) {
          Toast.show({ icon: "fail", content: "请选择图片文件" });
        }
        // 仍返回一个 handle，但 promise reject；tempUrl 用空字符串避免污染列表
        return {
          tempUrl: "",
          finalUrlPromise: Promise.reject(new Error("file is not image")),
        };
      }
      if (file.size > maxBytes) {
        if (showToastOnError) {
          Toast.show({
            icon: "fail",
            content: `图片大小不能超过 ${(maxBytes / 1024 / 1024).toFixed(0)}MB`,
          });
        }
        return {
          tempUrl: "",
          finalUrlPromise: Promise.reject(new Error("file too large")),
        };
      }

      // 2) 立即生成 blob URL 给调用方做预览
      const tempUrl = URL.createObjectURL(file);

      // 3) 异步上传，settle 时统一 revoke
      const finalUrlPromise = dispatchUpload(kind, file)
        .then((realUrl) => {
          URL.revokeObjectURL(tempUrl);
          return realUrl;
        })
        .catch((err) => {
          URL.revokeObjectURL(tempUrl);
          if (showToastOnError) {
            Toast.show({
              icon: "fail",
              content: err instanceof Error ? err.message : "上传失败",
            });
          }
          throw err;
        });

      return { tempUrl, finalUrlPromise };
    },
    [kind, maxBytes, showToastOnError],
  );

  return { uploadWithPreview };
}
