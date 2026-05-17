/**
 * 商家端：活动回顾编辑页
 * 路由：/dashboard/activity/:id/recap/edit
 *
 * 功能：
 * - 标题 / 文字内容
 * - 多图上传（最多 16 张，复用 /api/events/upload-image）
 * - 顶部固定隐私提示横幅
 * - 「保存草稿」与「发布」两个按钮
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Input, TextArea, Button, ImageUploader } from "antd-mobile";
import type { ImageUploadItem } from "antd-mobile/es/components/image-uploader";
import { Toast } from "@/components/ui/Toast";
import { AlertTriangle, Loader2 } from "lucide-react";
import { MerchantLayout } from "@/components/layout";
import { uploadCoverImage } from "@/features/activities/services/activityApi";
import { getRecap, upsertRecap } from "@/features/recap/services/recapApi";

const MAX_IMAGES = 16;

const ActivityRecapEditPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: eventId } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [images, setImages] = useState<ImageUploadItem[]>([]);
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);

  // 拉现有回顾（含草稿）
  const { data: recapResp, isLoading } = useQuery({
    queryKey: ["recap", eventId],
    queryFn: () => getRecap(eventId!),
    enabled: !!eventId,
  });
  const recap = recapResp?.data?.recap;

  useEffect(() => {
    if (!recap) return;
    form.setFieldsValue({
      title: recap.title || "",
      content: recap.content || "",
    });
    setImages((recap.images || []).map((url) => ({ url, key: url })));
  }, [recap, form]);

  // 上传单张图片：返回 server URL
  const handleUploadImage = async (file: File): Promise<{ url: string }> => {
    const url = await uploadCoverImage(file);
    return { url };
  };

  // 提交：publish=true → 发布，false → 草稿
  const handleSubmit = async (publish: boolean) => {
    if (!eventId) return;
    if (images.length > MAX_IMAGES) {
      Toast.show({ icon: "fail", content: `图片不能超过 ${MAX_IMAGES} 张` });
      return;
    }
    setSubmitting(publish ? "publish" : "draft");
    try {
      const values = await form.validateFields();
      const res = await upsertRecap(eventId, {
        title: values.title || null,
        content: values.content || null,
        images: images.map((i) => i.url).filter(Boolean) as string[],
        publish,
      });
      if (!res.success) {
        Toast.show({ icon: "fail", content: res.message || "保存失败" });
        return;
      }
      Toast.show({ icon: "success", content: publish ? "回顾已发布" : "草稿已保存" });
      queryClient.invalidateQueries({ queryKey: ["recap", eventId] });
      queryClient.invalidateQueries({ queryKey: ["recap-access", eventId] });
      if (publish) {
        navigate(`/dashboard/activity/${eventId}/manage`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "保存失败";
      Toast.show({ icon: "fail", content: msg });
    } finally {
      setSubmitting(null);
    }
  };

  if (isLoading) {
    return (
      <MerchantLayout
        title="编辑活动回顾"
        showBack
        showTabBar={false}
        onBack={() => navigate(-1)}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout
      title="编辑活动回顾"
      showBack
      showTabBar={false}
      onBack={() => navigate(-1)}
    >
      <div className="pb-24">
        {/* 隐私提示 banner */}
        <div className="mx-4 mt-2 mb-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            请保护参与者隐私：避免上传可识别个人身份的敏感画面（车牌、证件、住址等），
            上传含他人正脸的图片前请征得当事人同意。
          </p>
        </div>

        <Form form={form} layout="vertical" className="space-y-4 px-4">
          {/* 标题 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                标题
              </h3>
            </div>
            <div className="p-4">
              <Form.Item name="title">
                <Input
                  placeholder="为这次活动起个回顾标题（选填）"
                  maxLength={80}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>
            </div>
          </div>

          {/* 正文 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                回顾内容
              </h3>
            </div>
            <div className="p-4">
              <Form.Item name="content">
                <TextArea
                  placeholder="分享活动的精彩瞬间、收获与故事..."
                  maxLength={2000}
                  showCount
                  rows={8}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>
            </div>
          </div>

          {/* 图片墙 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                活动照片
              </h3>
              <span className="text-xs text-gray-400">
                {images.length}/{MAX_IMAGES}
              </span>
            </div>
            <div className="p-4">
              <ImageUploader
                value={images}
                onChange={setImages}
                upload={handleUploadImage}
                multiple
                maxCount={MAX_IMAGES}
                showUpload={images.length < MAX_IMAGES}
                onCountExceed={(exceed) =>
                  Toast.show({ content: `最多 ${MAX_IMAGES} 张，超过 ${exceed} 张` })
                }
              />
              <p className="text-xs text-gray-400 mt-3">
                建议上传清晰横版照片；含他人头像的请先获授权。
              </p>
            </div>
          </div>
        </Form>
      </div>

      {/* 底部固定操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-4 safe-area-pb bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 z-10">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            block
            fill="outline"
            loading={submitting === "draft"}
            onClick={() => handleSubmit(false)}
            className="flex-1"
            style={
              {
                "--border-radius": "12px",
                height: "44px",
              } as React.CSSProperties
            }
          >
            保存草稿
          </Button>
          <Button
            block
            color="primary"
            loading={submitting === "publish"}
            onClick={() => handleSubmit(true)}
            className="flex-1"
            style={
              {
                "--border-radius": "12px",
                height: "44px",
              } as React.CSSProperties
            }
          >
            {recap?.publishedAt ? "更新回顾" : "发布回顾"}
          </Button>
        </div>
      </div>
    </MerchantLayout>
  );
};

export default ActivityRecapEditPage;
