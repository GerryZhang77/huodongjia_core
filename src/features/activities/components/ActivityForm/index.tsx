/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 活动表单组件
 * 支持创建和编辑两种模式
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  TextArea,
  DatePicker,
  Button,
  Toast,
  ImageUploader,
  Selector,
  Stepper,
  Switch,
  Card,
} from "antd-mobile";
import { PictureOutline } from "antd-mobile-icons";
import { useActivityDetail } from "../../hooks";
import { uploadCoverImage } from "../../services";
import { CATEGORY_OPTIONS, TAG_OPTIONS } from "../../utils";
import type { ActivityFormData } from "../../types";

interface ActivityFormProps {
  /**
   * 活动 ID (编辑模式需要)
   */
  activityId?: string;
  /**
   * 提交表单的回调函数
   */
  onSubmit: (data: ActivityFormData) => Promise<void>;
  /**
   * 是否正在加载
   */
  loading?: boolean;
}

/**
 * 活动表单组件
 */
export const ActivityForm: React.FC<ActivityFormProps> = ({
  activityId,
  onSubmit,
  loading = false,
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const isEdit = Boolean(activityId);
  const { activity, loading: detailLoading } = useActivityDetail(
    isEdit ? activityId : undefined
  );

  // 编辑模式：填充表单数据
  useEffect(() => {
    if (isEdit && activity) {
      form.setFieldsValue({
        title: activity.title,
        description: activity.description,
        start_time: new Date(activity.activityStart),
        end_time: new Date(activity.activityEnd),
        location: activity.location,
        max_participants: activity.capacity,
        registration_start: new Date(activity.registrationStart),
        registration_end: new Date(activity.registrationEnd),
        category: activity.category,
        tags: activity.tags || [],
        requirements: activity.requirements,
        contact_info: activity.contactInfo,
        is_public: activity.isPublic !== false,
        allow_waitlist: activity.allowWaitlist === true,
      });

      if (activity.coverImage) {
        setFileList([
          {
            url: activity.coverImage,
            key: "cover",
          },
        ]);
      }
    }
  }, [isEdit, activity, form]);

  // 新建模式：设置默认值
  useEffect(() => {
    if (!isEdit) {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      form.setFieldsValue({
        registration_start: now,
        registration_end: tomorrow,
        start_time: tomorrow,
        end_time: nextWeek,
        max_participants: 50,
        is_public: true,
        allow_waitlist: false,
        category: "business",
        tags: [],
      });
    }
  }, [isEdit, form]);

  // 图片上传处理
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadCoverImage(file);
      return {
        url,
        key: Date.now().toString(),
      };
    } catch (error) {
      console.error("Image upload error:", error);
      Toast.show("图片上传失败，请重试");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // 表单提交
  const handleSubmit = async (values: ActivityFormData) => {
    try {
      // 添加封面图片
      const submitData = {
        ...values,
        cover_image: fileList[0]?.url,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // 表单验证
  const validateTime = (_: any, value: Date) => {
    const formValues = form.getFieldsValue();

    if (formValues.registration_start && formValues.registration_end) {
      if (formValues.registration_start >= formValues.registration_end) {
        return Promise.reject("报名结束时间必须晚于开始时间");
      }
    }

    if (formValues.start_time && formValues.end_time) {
      if (formValues.start_time >= formValues.end_time) {
        return Promise.reject("活动结束时间必须晚于开始时间");
      }
    }

    if (
      formValues.registration_end &&
      formValues.start_time &&
      formValues.registration_end > formValues.start_time
    ) {
      return Promise.reject("报名结束时间不能晚于活动开始时间");
    }

    return Promise.resolve();
  };

  if (isEdit && detailLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-8">
      <Form
        form={form}
        onFinish={handleSubmit}
        {...({ validateTrigger: "onBlur" } as any)}
        mode="card"
        style={
          {
            "--border-radius": "12px",
          } as any
        }
      >
        {/* 基本信息 */}
        <Card
          title="基本信息"
          className="mb-4"
          style={{ "--border-radius": "12px" } as any}
        >
          <Form.Item
            name="title"
            label="活动标题"
            rules={[{ required: true, message: "请输入活动标题" }]}
          >
            <Input
              placeholder="请输入活动标题"
              maxLength={50}
              {...({ showCount: true } as any)}
              style={{ "--border-radius": "8px" } as any}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="活动描述"
            rules={[{ required: true, message: "请输入活动描述" }]}
          >
            <TextArea
              placeholder="请详细描述活动内容、目的和亮点"
              maxLength={500}
              {...({ showCount: true } as any)}
              rows={4}
              style={{ "--border-radius": "8px" } as any}
            />
          </Form.Item>

          <Form.Item name="category" label="活动分类">
            <Selector
              options={CATEGORY_OPTIONS}
              style={{ "--border-radius": "8px" } as any}
            />
          </Form.Item>

          <Form.Item name="tags" label="活动标签">
            <Selector
              options={TAG_OPTIONS}
              {...({ multiple: true } as any)}
              style={{ "--border-radius": "8px" } as any}
            />
          </Form.Item>

          <Form.Item name="cover_image" label="封面图片">
            <ImageUploader
              value={fileList}
              onChange={setFileList}
              upload={handleImageUpload}
              maxCount={1}
              style={{ "--border-radius": "8px" } as any}
            >
              <div className="flex flex-col items-center justify-center h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <PictureOutline className="text-2xl text-gray-400 mb-1" />
                <span className="text-sm text-gray-500">
                  {uploading ? "上传中..." : "点击上传封面"}
                </span>
              </div>
            </ImageUploader>
          </Form.Item>
        </Card>

        {/* 时间地点 */}
        <Card
          title="时间地点"
          className="mb-4"
          style={{ "--border-radius": "12px" } as any}
        >
          <Form.Item
            name="location"
            label="活动地点"
            rules={[{ required: true, message: "请输入活动地点" }]}
          >
            <Input
              placeholder="请输入详细地址"
              style={{ "--border-radius": "8px" } as any}
            />
          </Form.Item>

          <Form.Item
            name="start_time"
            label="开始时间"
            rules={[
              { required: true, message: "请选择开始时间" },
              { validator: validateTime },
            ]}
          >
            <DatePicker {...({ precision: "minute" } as any)}>
              {(value: Date | null) =>
                value ? value.toLocaleString() : "请选择开始时间"
              }
            </DatePicker>
          </Form.Item>

          <Form.Item
            name="end_time"
            label="结束时间"
            rules={[
              { required: true, message: "请选择结束时间" },
              { validator: validateTime },
            ]}
          >
            <DatePicker {...({ precision: "minute" } as any)}>
              {(value: Date | null) =>
                value ? value.toLocaleString() : "请选择结束时间"
              }
            </DatePicker>
          </Form.Item>
        </Card>

        {/* 报名设置 */}
        <Card
          title="报名设置"
          className="mb-4"
          style={{ "--border-radius": "12px" } as any}
        >
          <Form.Item
            name="registration_start"
            label="报名开始"
            rules={[
              { required: true, message: "请选择报名开始时间" },
              { validator: validateTime },
            ]}
          >
            <DatePicker {...({ precision: "minute" } as any)}>
              {(value: Date | null) =>
                value ? value.toLocaleString() : "请选择报名开始时间"
              }
            </DatePicker>
          </Form.Item>

          <Form.Item
            name="registration_end"
            label="报名截止"
            rules={[
              { required: true, message: "请选择报名截止时间" },
              { validator: validateTime },
            ]}
          >
            <DatePicker {...({ precision: "minute" } as any)}>
              {(value: Date | null) =>
                value ? value.toLocaleString() : "请选择报名截止时间"
              }
            </DatePicker>
          </Form.Item>

          <Form.Item
            name="max_participants"
            label="最大参与人数"
            rules={[{ required: true, message: "请设置参与人数" }]}
          >
            <Stepper
              min={1}
              max={1000}
              style={{ "--border-radius": "8px" } as any}
            />
          </Form.Item>

          <Form.Item name="allow_waitlist" label="允许候补">
            <Switch />
          </Form.Item>

          <Form.Item name="is_public" label="公开活动">
            <Switch />
          </Form.Item>
        </Card>

        {/* 其他信息 */}
        <Card
          title="其他信息"
          className="mb-4"
          style={{ "--border-radius": "12px" } as any}
        >
          <Form.Item name="requirements" label="参与要求">
            <TextArea
              placeholder="请描述参与者需要满足的条件或准备的物品"
              maxLength={200}
              {...({ showCount: true } as any)}
              rows={3}
              style={{ "--border-radius": "8px" } as any}
            />
          </Form.Item>

          <Form.Item name="contact_info" label="联系方式">
            <Input
              placeholder="请输入联系电话或微信号"
              style={{ "--border-radius": "8px" } as any}
            />
          </Form.Item>
        </Card>

        {/* 提交按钮 */}
        <div className="mt-6 space-y-3">
          <Button
            type="submit"
            color="primary"
            size="large"
            block
            loading={loading}
            style={
              {
                "--border-radius": "12px",
                "--background-color": "var(--adm-color-primary)",
                height: "48px",
                fontSize: "16px",
                fontWeight: "500",
              } as any
            }
          >
            {loading
              ? isEdit
                ? "更新中..."
                : "创建中..."
              : isEdit
              ? "更新活动"
              : "创建活动"}
          </Button>

          <Button
            size="large"
            block
            fill="outline"
            onClick={() => navigate("/dashboard")}
            style={
              {
                "--border-radius": "12px",
                height: "48px",
                fontSize: "16px",
              } as any
            }
          >
            取消
          </Button>
        </div>
      </Form>
    </div>
  );
};
