/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 带实时预览的活动表单组件
 * PC端：左侧编辑表单，右侧实时预览
 * 移动端：全宽表单 + 底部预览按钮
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  TextArea,
  Button,
  ImageUploader,
  Stepper,
  Switch,
  Card,
  Dialog,
  Popup,
} from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import { PictureOutline } from "antd-mobile-icons";
import {
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  FileText,
  Save,
} from "lucide-react";
import {
  TemplatePicker,
  TemplateSaveModal,
  type FormTemplate,
} from "@/features/merchant/form-templates";
import { useActivityDetail } from "../../hooks";
import { useImageUpload } from "@/features/uploads";
import {
  CATEGORY_OPTIONS,
  isOnlineOnlyActivity,
  TAG_OPTIONS,
  validateTitle,
  validateDescription,
  validateLocation,
  validateParticipants,
  createTimeValidationRules,
} from "../../utils";
import type {
  ActivityFormData,
  ActivityCategory,
  ActivityRegistrationType,
  RegistrationFormField,
} from "../../types";
import { DatePickerField } from "./DatePickerField";
import { CustomSelector } from "./CustomSelector";
import { RequirementListEditor } from "./RequirementListEditor";
import { RegistrationTypesBuilder } from "./RegistrationTypesBuilder";
import { createDefaultRegistrationTypes } from "./registrationTypeDefaults";
import { ActivityPreview } from "@/components/business";
import { useAuthStore } from "@/features/auth/stores";
import { useIsDesktop } from "@/hooks/useMediaQuery";

interface ActivityFormWithPreviewProps {
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

const getImageUrls = (items: any[]): string[] =>
  (Array.isArray(items) ? items : [])
    .map((item) => item?.url)
    .filter((url): url is string => typeof url === "string" && url.length > 0);

/**
 * 带实时预览的活动表单组件
 */
export const ActivityFormWithPreview: React.FC<
  ActivityFormWithPreviewProps
> = ({ activityId, onSubmit, loading = false }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const pendingUploadsRef = useRef(0);
  const activityImageUpload = useImageUpload({ kind: "cover" });
  const isDesktopViewport = useIsDesktop();

  // 预览相关状态
  const [showPreview, setShowPreview] = useState(true); // PC端默认显示
  const [showMobilePreview, setShowMobilePreview] = useState(false); // 移动端预览弹窗
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">(
    "mobile",
  ); // 预览模式
  const [formValues, setFormValues] = useState<Partial<ActivityFormData>>({});

  // 模板相关弹窗状态
  const [tplPickerType, setTplPickerType] = useState<
    "registration_form" | "requirements" | null
  >(null);
  const [tplSaveType, setTplSaveType] = useState<
    "registration_form" | "requirements" | null
  >(null);
  const [registrationTemplateTargetIndex, setRegistrationTemplateTargetIndex] =
    useState<number | null>(null);

  const syncRegistrationTypeSchema = useCallback(
    (typeIndex: number, schema: RegistrationFormField[]) => {
      const currentTypesRaw = form.getFieldValue("registration_types") as
        | ActivityRegistrationType[]
        | undefined;
      const currentTypes = currentTypesRaw?.length
        ? currentTypesRaw
        : createDefaultRegistrationTypes();
      const safeIndex = Math.min(Math.max(typeIndex, 0), currentTypes.length - 1);
      const nextTypes = currentTypes.map((type, index) =>
        index === safeIndex ? { ...type, formSchema: schema } : type,
      );
      const defaultType = nextTypes.find((type) => type.isDefault) || nextTypes[0];

      form.setFieldsValue({
        registration_types: nextTypes,
        registration_form_schema: defaultType?.formSchema || schema,
      });
      setFormValues((prev) => ({
        ...prev,
        registration_types: nextTypes,
        registration_form_schema: defaultType?.formSchema || schema,
      }));
    },
    [form],
  );

  // 从模板写回 Form 字段
  const applyTemplate = useCallback(
    (template: FormTemplate) => {
      if (template.type === "registration_form") {
        const schema = Array.isArray(template.schema)
          ? (template.schema as RegistrationFormField[])
          : [];
        syncRegistrationTypeSchema(
          registrationTemplateTargetIndex ?? 0,
          schema,
        );
      } else if (template.type === "requirements") {
        form.setFieldsValue({ requirements: template.schema });
        setFormValues((prev) => ({
          ...prev,
          requirements: template.schema as any,
        }));
      }
      Toast.show({
        icon: "success",
        content: `已应用模板「${template.name}」`,
      });
    },
    [form, registrationTemplateTargetIndex, syncRegistrationTypeSchema],
  );

  const closeTemplatePicker = useCallback(() => {
    setTplPickerType(null);
    setRegistrationTemplateTargetIndex(null);
  }, []);

  const closeTemplateSaveModal = useCallback(() => {
    setTplSaveType(null);
    setRegistrationTemplateTargetIndex(null);
  }, []);

  const getRegistrationTemplateSchema = useCallback(() => {
    const currentTypesRaw = form.getFieldValue("registration_types") as
      | ActivityRegistrationType[]
      | undefined;
    const currentTypes = currentTypesRaw?.length
      ? currentTypesRaw
      : createDefaultRegistrationTypes();
    const safeIndex = Math.min(
      Math.max(registrationTemplateTargetIndex ?? 0, 0),
      currentTypes.length - 1,
    );
    return currentTypes[safeIndex]?.formSchema || form.getFieldValue("registration_form_schema");
  }, [form, registrationTemplateTargetIndex]);

  const openRegistrationTemplatePicker = useCallback((typeIndex: number) => {
    setRegistrationTemplateTargetIndex(typeIndex);
    setTplPickerType("registration_form");
  }, []);

  const openRegistrationTemplateSave = useCallback((typeIndex: number) => {
    setRegistrationTemplateTargetIndex(typeIndex);
    setTplSaveType("registration_form");
  }, []);

  // 获取用户信息作为主办方
  const user = useAuthStore((state) => state.user);

  const isEdit = Boolean(activityId);
  const { activity, loading: detailLoading } = useActivityDetail(
    isEdit ? activityId : undefined,
  );

  const selectedTags = Array.isArray(formValues.tags) ? formValues.tags : [];
  const isOnlineOnly = isOnlineOnlyActivity(selectedTags);

  const handleImageListChange = useCallback(
    (items: any[]) => {
      const nextList = Array.isArray(items) ? items : [];
      const imageUrls = getImageUrls(nextList);

      setFileList(nextList);
      form.setFieldsValue({
        cover_image: imageUrls[0] || "",
        images: imageUrls,
      });
      setFormValues((prev) => ({
        ...prev,
        cover_image: imageUrls[0] || "",
        images: imageUrls,
      }));
    },
    [form],
  );

  // 编辑模式：填充表单数据
  useEffect(() => {
    if (isEdit && activity) {
      console.log("[EditForm] activity from API:", { isPublic: activity.isPublic, allowWaitlist: activity.allowWaitlist, enableNfc: activity.enableNfc, category: activity.category, requirements: activity.requirements, contactInfo: activity.contactInfo });
      const initialValues = {
        title: activity.title,
        description: activity.description,
        start_time: new Date(activity.activityStart),
        end_time: new Date(activity.activityEnd),
        location: activity.location,
        max_participants: activity.capacity,
        registration_start: activity.registrationStart ? new Date(activity.registrationStart) : new Date(),
        registration_end: activity.registrationEnd ? new Date(activity.registrationEnd) : new Date(),
        category: activity.category ? [activity.category] : ["other"],
        tags: activity.tags || [],
        requirements: activity.requirements || "",
        contact_info: activity.contactInfo || "",
        is_public: activity.isPublic !== false,
        allow_waitlist: activity.allowWaitlist === true,
        enable_nfc: activity.enableNfc === true,
        registration_form_schema: activity.registrationFormSchema || undefined,
        registration_types:
          activity.registrationTypes?.length
            ? activity.registrationTypes
            : createDefaultRegistrationTypes().map((type) => ({
                ...type,
                formSchema: activity.registrationFormSchema || type.formSchema,
              })),
      };
      form.setFieldsValue(initialValues);
      setFormValues(initialValues as any);

      if (activity.images && activity.images.length > 0) {
        handleImageListChange(
          activity.images.map((url, i) => ({ url, key: `img-${i}` })),
        );
      } else if (activity.coverImage) {
        handleImageListChange([{ url: activity.coverImage, key: "cover" }]);
      }
    }
  }, [isEdit, activity, form, handleImageListChange]);

  // 新建模式：设置默认值
  useEffect(() => {
    if (!isEdit) {
      const defaultValues: Partial<ActivityFormData> = {
        max_participants: 50,
        is_public: true,
        allow_waitlist: false,
        category: ["business"] as unknown as ActivityCategory,
        tags: [],
        registration_types: createDefaultRegistrationTypes(),
      };
      form.setFieldsValue(defaultValues);
      setFormValues(defaultValues);
    }
  }, [isEdit, form]);

  useEffect(() => {
    if (!isOnlineOnly) return;
    if (!form.getFieldValue("location")) return;

    form.setFieldsValue({ location: "" });
    setFormValues((prev) => ({ ...prev, location: "" }));
  }, [form, isOnlineOnly]);

  // 监听表单变化，更新预览
  const handleFormChange = useCallback(() => {
    const values = form.getFieldsValue();
    setFormValues(values);
  }, [form]);

  // 图片上传处理
  const handleImageUpload = async (file: File) => {
    pendingUploadsRef.current += 1;
    setUploading(true);
    try {
      const { finalUrlPromise } = activityImageUpload.uploadWithPreview(file);
      const url = await finalUrlPromise;
      return {
        url,
        key: Date.now().toString(),
      };
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    } finally {
      pendingUploadsRef.current = Math.max(0, pendingUploadsRef.current - 1);
      if (pendingUploadsRef.current === 0) {
        setUploading(false);
      }
    }
  };

  // 表单提交
  const handleSubmit = async (values: ActivityFormData) => {
    try {
      // 验证必填字段
      if (!values.title || !values.description) {
        Toast.show({
          icon: "fail",
          content: "请填写活动标题和描述",
        });
        return;
      }

      const uploadedImageUrls = getImageUrls(fileList);
      const valueImageUrls = Array.isArray(values.images)
        ? values.images.filter(Boolean)
        : [];
      const imageUrls =
        uploadedImageUrls.length > 0 ? uploadedImageUrls : valueImageUrls;

      // 验证图片
      if (imageUrls.length === 0) {
        Toast.show({
          icon: "fail",
          content: "请至少上传一张活动图片",
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

      // 添加封面图片和图片数组
      const submitData: any = {
        ...values,
      };
      const submitTags = Array.isArray(submitData.tags)
        ? submitData.tags.map((tag: any) => String(tag))
        : [];
      const submitIsOnlineOnly = isOnlineOnlyActivity(submitTags);
      const submitLocation = submitIsOnlineOnly
        ? ""
        : String(submitData.location || "").trim();
      if (!submitIsOnlineOnly && !submitLocation) {
        Toast.show({ icon: "fail", content: "请输入活动地点" });
        return;
      }
      submitData.tags = submitTags;
      submitData.location = submitLocation;

      const registrationTypes =
        submitData.registration_types?.length
          ? submitData.registration_types
          : createDefaultRegistrationTypes();
      const registrationTypeNames = registrationTypes.map((type: any) =>
        String(type.name || "").trim(),
      );
      if (registrationTypeNames.some((name: string) => !name)) {
        Toast.show({ icon: "fail", content: "请填写报名类型名称" });
        return;
      }
      if (new Set(registrationTypeNames).size !== registrationTypeNames.length) {
        Toast.show({ icon: "fail", content: "报名类型名称不能重复" });
        return;
      }
      const defaultRegistrationType =
        registrationTypes.find((type: any) => type.isDefault) || registrationTypes[0];
      submitData.registration_types = registrationTypes;
      submitData.registration_form_schema =
        defaultRegistrationType?.formSchema || submitData.registration_form_schema;

      submitData.cover_image = imageUrls[0];
      submitData.images = imageUrls;

      Toast.show({
        icon: "loading",
        content: "正在提交...",
        duration: 0,
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error("表单提交错误:", error);
      Toast.clear();

      if (error instanceof Error) {
        Toast.show({
          icon: "fail",
          content: error.message || "提交失败，请稍后重试",
          duration: 3000,
        });
      } else {
        Toast.show({
          icon: "fail",
          content: "提交失败，请稍后重试",
          duration: 3000,
        });
      }
    }
  };

  // 取消操作
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

  // 表单内容
  const formContent = (
    <Form
      form={form}
      onFinish={handleSubmit}
      onValuesChange={handleFormChange}
      onFinishFailed={(errorInfo) => {
        const firstError = errorInfo.errorFields?.[0];
        if (firstError && firstError.errors?.[0]) {
          Toast.show({
            icon: "fail",
            content: firstError.errors[0],
            duration: 3000,
          });
        }
      }}
      mode="card"
      style={{ "--border-radius": "12px" } as any}
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
          <CustomSelector
            options={CATEGORY_OPTIONS}
            maxCustomLength={15}
            placeholder="自定义分类（最多15字）"
          />
        </Form.Item>

        <Form.Item name="tags" label="活动标签">
          <CustomSelector
            options={TAG_OPTIONS}
            multiple
            placeholder="自定义标签（最多7字）"
          />
        </Form.Item>

        <Form.Item
          name="cover_image"
          label={
            <div className="flex items-center gap-2">
              <span>活动图片</span>
              <span className="text-xs text-gray-400 font-normal">
                (最多9张，第一张为封面)
              </span>
            </div>
          }
          rules={[]}
        >
          <div className="space-y-2">
            <ImageUploader
              value={fileList}
              onChange={handleImageListChange}
              upload={handleImageUpload}
              maxCount={9}
              columns={3}
            >
              <div className="flex flex-col items-center justify-center h-24 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <PictureOutline className="text-2xl text-gray-400 mb-1" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {uploading ? "上传中..." : "点击上传图片"}
                </span>
              </div>
            </ImageUploader>
            {fileList.length > 0 && (
              <p className="text-xs text-primary-500 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                第一张图片将作为活动封面展示
              </p>
            )}
          </div>
        </Form.Item>
      </Card>

      {/* 时间地点 */}
      <Card
        title="时间地点"
        className="mb-4"
        style={{ "--border-radius": "12px" } as any}
      >
        {!isOnlineOnly && (
          <Form.Item name="location" label="活动地点" rules={validateLocation}>
            <Input
              placeholder="请输入详细地址"
              style={{ "--border-radius": "8px" } as any}
            />
          </Form.Item>
        )}

        <Form.Item
          name="start_time"
          label="活动开始时间"
          rules={createTimeValidationRules(form, "start_time")}
        >
          <DatePickerField
            placeholder="请选择活动开始时间"
            onValidate={() => {
              form.validateFields(["end_time"]).catch(() => {});
              handleFormChange();
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
              form.validateFields(["start_time"]).catch(() => {});
              handleFormChange();
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
              form.validateFields(["registration_end"]).catch(() => {});
              handleFormChange();
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
              form.validateFields(["registration_start"]).catch(() => {});
              handleFormChange();
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
            onChange={handleFormChange}
          />
        </Form.Item>

        {/* 暂时隐藏：允许候补 & 公开活动 */}
        {/* <Form.Item name="allow_waitlist" label="允许候补">
          <Switch onChange={handleFormChange} />
        </Form.Item>

        <Form.Item name="is_public" label="公开活动">
          <Switch onChange={handleFormChange} />
        </Form.Item> */}
      </Card>

      {/* 报名类型与问卷 */}
      <Card
        title="报名类型与问卷"
        className="mb-4"
        style={{ "--border-radius": "12px" } as any}
      >
        <Form.Item name="registration_types">
          <RegistrationTypesBuilder
            onImportTemplate={openRegistrationTemplatePicker}
            onSaveTemplate={openRegistrationTemplateSave}
          />
        </Form.Item>
      </Card>

      {/* 互动功能设置 */}
      <Card
        title="互动功能"
        className="mb-4"
        style={{ "--border-radius": "12px" } as any}
      >
        <Form.Item
          name="enable_nfc"
          valuePropName="checked"
          label={
            <div className="flex items-center gap-2">
              <span>NFC 碰一碰</span>
              <span className="px-1.5 py-0.5 bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 text-xs rounded-full font-medium">
                推荐
              </span>
            </div>
          }
          extra={
            <div className="text-xs text-gray-400 mt-1 leading-relaxed">
              开启后，参与者可在活动现场通过 NFC
              碰一碰功能快速交换联系方式、查看彼此资料。
            </div>
          }
        >
          <Switch onChange={handleFormChange} />
        </Form.Item>
      </Card>

      {/* 其他信息 */}
      <Card
        title="其他信息"
        className="mb-4"
        style={{ "--border-radius": "12px" } as any}
      >
        <Form.Item
          name="requirements"
          label={
            <div className="flex items-center justify-between w-full">
              <span>参与要求</span>
              <span className="flex items-center gap-2 text-xs font-normal">
                <button
                  type="button"
                  onClick={() => setTplPickerType("requirements")}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                  title="从已保存的模板中导入"
                >
                  <FileText size={12} />
                  从模板导入
                </button>
                <button
                  type="button"
                  onClick={() => setTplSaveType("requirements")}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  title="把当前内容保存为可复用的模板"
                >
                  <Save size={12} />
                  保存为模板
                </button>
              </span>
            </div>
          }
        >
          <RequirementListEditor />
        </Form.Item>

        <Form.Item name="contact_info" label="联系方式">
          <Input
            placeholder="请输入联系电话或微信号"
            style={{ "--border-radius": "8px" } as any}
          />
        </Form.Item>
      </Card>

      {/* 提交按钮 */}
      <div className="mt-6 space-y-3 pb-20 lg:pb-6">
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
  );

  return (
    <div className="relative">
      {/* PC端布局：左右分栏 */}
      {isDesktopViewport && (
        <div className="flex gap-6">
        {/* 左侧表单区域 */}
        <div
          className={`transition-all duration-300 ${showPreview ? "w-1/2" : "w-full"}`}
        >
          <div className="px-4">{formContent}</div>
        </div>

        {/* 右侧预览区域 */}
        {showPreview && (
          <div className="w-1/2 sticky top-6 h-fit">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-6">
              {/* 预览头部工具栏 */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {previewMode === "mobile" ? (
                    <Smartphone size={16} />
                  ) : (
                    <Monitor size={16} />
                  )}
                  实时预览
                </h3>
                <div className="flex items-center gap-2">
                  {/* 模式切换按钮组 */}
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => setPreviewMode("mobile")}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                        previewMode === "mobile"
                          ? "bg-primary-500 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <Smartphone size={14} />
                      移动端
                    </button>
                    <button
                      onClick={() => setPreviewMode("desktop")}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                        previewMode === "desktop"
                          ? "bg-primary-500 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <Monitor size={14} />
                      桌面端
                    </button>
                  </div>
                  {/* 隐藏预览按钮 */}
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 px-2 py-1.5"
                  >
                    <EyeOff size={14} />
                    隐藏
                  </button>
                </div>
              </div>
              {/* 预览模式说明 */}
              <p className="text-xs text-gray-400 mb-4">
                {previewMode === "mobile"
                  ? "模拟手机端浏览效果"
                  : "模拟桌面端浏览效果（1024px 宽度）"}
              </p>
              {/* 预览组件 */}
              <ActivityPreview
                formData={formValues}
                coverImage={fileList[0]?.url}
                images={getImageUrls(fileList)}
                mode={previewMode}
                organizer={{
                  name: user?.name || "活动主办方",
                }}
              />
            </div>
          </div>
        )}
        </div>
      )}

      {/* PC端：隐藏预览时的展开按钮 */}
      {isDesktopViewport && !showPreview && (
        <button
          onClick={() => setShowPreview(true)}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-l-xl shadow-lg hover:bg-primary-600 transition-colors"
        >
          <Eye size={18} />
          <span className="text-sm font-medium">显示预览</span>
        </button>
      )}

      {/* 移动端/平板布局：全宽表单 */}
      {!isDesktopViewport && <div className="px-4">{formContent}</div>}

      {/* 移动端：底部预览按钮 */}
      {!isDesktopViewport && (
        <div className="fixed bottom-16 right-4 z-40">
          <button
            onClick={() => setShowMobilePreview(true)}
            className="w-12 h-12 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
          >
            <Eye size={20} />
          </button>
        </div>
      )}

      {/* 移动端：预览弹窗 */}
      <Popup
        visible={showMobilePreview}
        onMaskClick={() => setShowMobilePreview(false)}
        position="bottom"
        bodyStyle={{
          height: "90vh",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              活动预览
            </h3>
            <div className="flex items-center gap-3">
              {/* 模式切换 */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    previewMode === "mobile"
                      ? "bg-white dark:bg-gray-600 text-primary-500 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  <Smartphone size={12} />
                  移动端
                </button>
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    previewMode === "desktop"
                      ? "bg-white dark:bg-gray-600 text-primary-500 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  <Monitor size={12} />
                  桌面端
                </button>
              </div>
              <button
                onClick={() => setShowMobilePreview(false)}
                className="text-sm text-primary-500 font-medium"
              >
                关闭
              </button>
            </div>
          </div>

          {/* 预览内容 */}
          <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
            <ActivityPreview
              formData={formValues}
              coverImage={fileList[0]?.url}
              images={getImageUrls(fileList)}
              mode={previewMode}
              organizer={{
                name: user?.name || "活动主办方",
              }}
            />
          </div>
        </div>
      </Popup>

      {/* 模板：从模板导入 */}
      {tplPickerType && (
        <TemplatePicker
          visible
          type={tplPickerType}
          onClose={closeTemplatePicker}
          onPick={applyTemplate}
        />
      )}

      {/* 模板：保存为模板 */}
      {tplSaveType && (
        <TemplateSaveModal
          visible
          type={tplSaveType}
          schema={
            tplSaveType === "registration_form"
              ? getRegistrationTemplateSchema()
              : form.getFieldValue("requirements")
          }
          onClose={closeTemplateSaveModal}
        />
      )}
    </div>
  );
};

export default ActivityFormWithPreview;
