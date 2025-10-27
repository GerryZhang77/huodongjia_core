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
  Button,
  Toast,
  ImageUploader,
  Selector,
  Stepper,
  Switch,
  Card,
  Dialog,
} from "antd-mobile";
import { PictureOutline } from "antd-mobile-icons";
import { useActivityDetail } from "../../hooks";
import { uploadCoverImage } from "../../services";
import {
  CATEGORY_OPTIONS,
  TAG_OPTIONS,
  validateTitle,
  validateDescription,
  validateLocation,
  validateParticipants,
  createTimeValidationRules,
} from "../../utils";
import type { ActivityFormData } from "../../types";
import { DatePickerField } from "./DatePickerField";

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
      form.setFieldsValue({
        max_participants: 50,
        is_public: true,
        allow_waitlist: false,
        category: "business",
        tags: [],
        // 不设置时间字段的默认值，让用户主动选择
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
      Toast.show({ icon: "fail", content: "图片上传失败，请重试" });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // 表单提交
  const handleSubmit = async (values: ActivityFormData) => {
    try {
      console.log("表单提交 - 开始", values);

      // 验证必填字段
      if (!values.title || !values.description) {
        Toast.show({
          icon: "fail",
          content: "请填写活动标题和描述",
        });
        return;
      }

      // 验证时间字段
      if (
        !values.start_time ||
        !values.end_time ||
        !values.registration_start ||
        !values.registration_end
      ) {
        Toast.show({
          icon: "fail",
          content: "请选择完整的活动时间和报名时间",
        });
        return;
      }

      // 添加封面图片
      const submitData = {
        ...values,
        cover_image: fileList[0]?.url,
      };

      console.log("表单提交 - 调用 onSubmit", submitData);

      // 显示加载提示
      Toast.show({
        icon: "loading",
        content: "正在提交...",
        duration: 0,
      });

      await onSubmit(submitData);

      console.log("表单提交 - 成功");
    } catch (error) {
      console.error("表单提交错误:", error);

      // 清除加载提示
      Toast.clear();

      // 判断错误类型
      if (error instanceof Error) {
        const errorMessage = error.message;

        if (errorMessage.includes("网络") || errorMessage.includes("timeout")) {
          Toast.show({
            icon: "fail",
            content: "网络连接失败，请检查网络后重试",
            duration: 3000,
          });
        } else if (
          errorMessage.includes("验证") ||
          errorMessage.includes("字段")
        ) {
          Toast.show({
            icon: "fail",
            content: `数据验证失败: ${errorMessage}`,
            duration: 3000,
          });
        } else {
          Toast.show({
            icon: "fail",
            content: errorMessage || "提交失败，请稍后重试",
            duration: 3000,
          });
        }
      } else {
        Toast.show({
          icon: "fail",
          content: "提交失败，请稍后重试",
          duration: 3000,
        });
      }
    }
  };

  // 取消操作 - 有内容时确认
  const handleCancel = () => {
    const values = form.getFieldsValue();
    const hasContent =
      values.title || values.description || fileList.length > 0;

    if (hasContent) {
      Dialog.confirm({
        content: "确定要放弃当前编辑的内容吗？",
        onConfirm: () => navigate("/dashboard"),
      });
    } else {
      navigate("/dashboard");
    }
  };

  if (isEdit && detailLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-6">
      <Form
        form={form}
        onFinish={handleSubmit}
        onFinishFailed={(errorInfo) => {
          console.log("表单验证失败:", errorInfo);

          // 获取第一个错误信息
          const firstError = errorInfo.errorFields?.[0];
          if (firstError && firstError.errors?.[0]) {
            Toast.show({
              icon: "fail",
              content: firstError.errors[0],
              duration: 3000,
            });
          } else {
            Toast.show({
              icon: "fail",
              content: "请检查表单填写是否完整",
              duration: 3000,
            });
          }
        }}
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
          <Form.Item name="title" label="活动标题" rules={validateTitle}>
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
            rules={validateDescription}
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

          <Form.Item
            name="cover_image"
            label="封面图片"
            rules={[
              {
                required: true,
                message: "请上传活动封面图片",
              },
              {
                validator: () => {
                  if (fileList.length === 0) {
                    return Promise.reject(new Error("请上传活动封面图片"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <ImageUploader
              value={fileList}
              onChange={setFileList}
              upload={handleImageUpload}
              maxCount={1}
            >
              <div className="flex flex-col items-center justify-center h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <PictureOutline className="text-2xl text-gray-400 mb-1" />
                <span className="text-sm text-gray-500">
                  {uploading ? "上传中..." : "点击上传封面（必填）"}
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
          <Form.Item name="location" label="活动地点" rules={validateLocation}>
            <Input
              placeholder="请输入详细地址"
              style={{ "--border-radius": "8px" } as any}
            />
          </Form.Item>

          <Form.Item
            name="start_time"
            label="活动开始时间"
            rules={createTimeValidationRules(form, "start_time")}
          >
            <DatePickerField
              placeholder="请选择活动开始时间"
              onValidate={() => {
                // 当活动开始时间变化时，触发活动结束时间的重新验证
                form.validateFields(["end_time"]).catch(() => {
                  // 忽略验证错误，只是触发重新验证
                });
              }}
            />
          </Form.Item>

          <Form.Item
            name="end_time"
            label="活动结束时间"
            rules={createTimeValidationRules(form, "end_time")}
          >
            <DatePickerField
              placeholder="请选择活动结束时间"
              onValidate={() => {
                // 当活动结束时间变化时，触发活动开始时间的重新验证
                form.validateFields(["start_time"]).catch(() => {
                  // 忽略验证错误，只是触发重新验证
                });
              }}
            />
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
            label="报名开始时间"
            rules={createTimeValidationRules(form, "registration_start")}
          >
            <DatePickerField
              placeholder="请选择报名开始时间"
              onValidate={() => {
                // 当报名开始时间变化时，触发报名截止时间的重新验证
                form.validateFields(["registration_end"]).catch(() => {
                  // 忽略验证错误，只是触发重新验证
                });
              }}
            />
          </Form.Item>

          <Form.Item
            name="registration_end"
            label="报名截止时间"
            rules={createTimeValidationRules(form, "registration_end")}
          >
            <DatePickerField
              placeholder="请选择报名截止时间"
              onValidate={() => {
                // 当报名截止时间变化时，触发报名开始时间的重新验证
                form.validateFields(["registration_start"]).catch(() => {
                  // 忽略验证错误，只是触发重新验证
                });
              }}
            />
          </Form.Item>

          <Form.Item
            name="max_participants"
            label="最大参与人数"
            rules={validateParticipants}
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
            onClick={handleCancel}
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
