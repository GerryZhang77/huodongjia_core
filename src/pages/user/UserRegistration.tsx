/**
 * 用户端活动报名页面
 * 根据活动的 registrationFormSchema 动态渲染报名表
 * 若活动无自定义 schema，则使用默认表单
 */

import { FC, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Calendar,
  MapPin,
  AlertCircle,
  Sparkles,
  ImagePlus,
  LoaderCircle,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { Dialog } from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui";
import { UserLayout } from "@/components/layout/UserLayout";
import { useActivityDetail, usePublicActivityDetail } from "@/features/user";
import { useSubmitEnrollment } from "@/features/user/enrollment/hooks/useSubmitEnrollment";
import RegistrationPhoneVerification from "@/features/user/enrollment/components/RegistrationPhoneVerification";
import {
  useProfilePrefill,
  useUpsertFieldLibrary,
  matchPrefillField,
  toFormValue,
  mapFieldTypeToStorage,
  type UpsertFieldLibraryItem,
} from "@/features/user/field-library";
import type { RegistrationFormField } from "@/features/activities/types";
import { ensureRequiredPhoneField } from "@/features/activities/components/ActivityForm/registrationTypeDefaults";
import { useAuthStore } from "@/features/auth/stores";
import { getRegistrationAvailability } from "@/features/user/activity/utils/registrationAvailability";
import { useImageUpload, type UploadHandle } from "@/features/uploads";
import {
  deletePendingEnrollmentImage,
  uploadEnrollmentImage,
} from "@/services/enrollmentApi";
import dayjs from "dayjs";

// ============================================
// 默认报名表 schema（无自定义时使用）
// ============================================
const DEFAULT_FORM_SCHEMA: RegistrationFormField[] = [
  {
    key: "name",
    label: "姓名",
    type: "text",
    required: false,
    preset: true,
    placeholder: "请输入您的姓名",
  },
  {
    key: "phone",
    label: "手机号",
    type: "text",
    required: true,
    preset: true,
    deletable: false,
    placeholder: "请输入手机号",
  },
  {
    key: "gender",
    label: "性别",
    type: "radio",
    required: false,
    preset: true,
    options: ["男", "女"],
  },
];
const PHONE_PATTERN = /^1[3-9]\d{9}$/;

function getSubmitErrorMessage(error: unknown, fallback = "报名失败，请稍后重试"): string {
  if (typeof error === "object" && error !== null) {
    const maybeAxiosError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return (
      maybeAxiosError.response?.data?.message ||
      maybeAxiosError.message ||
      fallback
    );
  }
  return fallback;
}

// ============================================
// 多选标签组件
// ============================================
const MultiSelectTags: FC<{
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}> = ({ options, selected, onChange }) => {
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selected.includes(opt)
              ? "bg-primary-400 text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

// ============================================
// 单选标签组件
// ============================================
const RadioTags: FC<{
  options: string[];
  value: string;
  onChange: (value: string) => void;
}> = ({ options, value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
            value === opt
              ? "border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400"
              : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

type EnrollmentImageItem = {
  localId: string;
  assetId?: string;
  previewUrl: string;
  name: string;
  status: "uploading" | "ready";
  uploadHandle: UploadHandle;
};

const EnrollmentImageField: FC<{
  activityId: string;
  registrationTypeId?: string;
  field: RegistrationFormField;
  onChange: (fieldKey: string, ids: string[]) => void;
  onUploadingChange: (fieldKey: string, uploading: boolean) => void;
}> = ({ activityId, registrationTypeId, field, onChange, onUploadingChange }) => {
  const [items, setItems] = useState<EnrollmentImageItem[]>([]);
  const itemsRef = useRef<EnrollmentImageItem[]>([]);
  const mountedRef = useRef(true);
  const maxImages = Math.max(1, Math.min(6, field.maxImages || 1));
  const uploadFile = useCallback(
    async (file: File) => {
      const asset = await uploadEnrollmentImage(
        activityId,
        file,
        field.key,
        registrationTypeId,
      );
      return asset.id;
    },
    [activityId, field.key, registrationTypeId],
  );
  const { uploadWithPreview } = useImageUpload({
    kind: "enrollment",
    upload: uploadFile,
    maxBytes: 25 * 1024 * 1024,
    uploadMaxBytes: 2 * 1024 * 1024,
    maxDimension: 1800,
    revokePreviewOnSettled: false,
  });

  useEffect(() => {
    itemsRef.current = items;
    onChange(
      field.key,
      items
        .filter((item) => item.status === "ready" && item.assetId)
        .map((item) => item.assetId!),
    );
    onUploadingChange(field.key, items.some((item) => item.status === "uploading"));
  }, [field.key, items, onChange, onUploadingChange]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      itemsRef.current.forEach((item) => {
        item.uploadHandle.releasePreview();
        if (item.assetId) {
          void deletePendingEnrollmentImage(item.assetId).catch(() => undefined);
        }
      });
    };
  }, []);

  const handleFiles = (files: FileList | null) => {
    const available = Math.max(0, maxImages - itemsRef.current.length);
    const selected = Array.from(files || []).slice(0, available);
    if (selected.length === 0) {
      if (available === 0) {
        Toast.show({ icon: "fail", content: `最多上传 ${maxImages} 张图片` });
      }
      return;
    }

    selected.forEach((file) => {
      const uploadHandle = uploadWithPreview(file);
      if (!uploadHandle.tempUrl) return;
      const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setItems((current) => [
        ...current,
        {
          localId,
          previewUrl: uploadHandle.tempUrl,
          name: file.name,
          status: "uploading",
          uploadHandle,
        },
      ]);
      uploadHandle.finalUrlPromise
        .then((assetId) => {
          if (!mountedRef.current) {
            uploadHandle.releasePreview();
            void deletePendingEnrollmentImage(assetId).catch(() => undefined);
            return;
          }
          setItems((current) =>
            current.map((item) =>
              item.localId === localId
                ? { ...item, assetId, status: "ready" }
                : item,
            ),
          );
        })
        .catch(() => {
          if (mountedRef.current) {
            setItems((current) => current.filter((item) => item.localId !== localId));
          }
        });
    });
  };

  const removeItem = async (item: EnrollmentImageItem) => {
    if (item.status === "uploading" || !item.assetId) return;
    try {
      await deletePendingEnrollmentImage(item.assetId);
      item.uploadHandle.releasePreview();
      setItems((current) => current.filter((candidate) => candidate.localId !== item.localId));
    } catch (error: unknown) {
      Toast.show({
        icon: "fail",
        content: getSubmitErrorMessage(error, "删除图片失败"),
      });
    }
  };

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <div key={item.localId} className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
              <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
              {item.status === "uploading" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/45 text-xs text-white">
                  <LoaderCircle size={20} className="animate-spin" />
                  上传中
                </div>
              ) : (
                <button
                  type="button"
                  aria-label={`删除 ${item.name}`}
                  onClick={() => void removeItem(item)}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {items.length < maxImages && (
        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:bg-gray-800">
          <ImagePlus size={24} />
          <span className="text-sm">选择图片（{items.length}/{maxImages}）</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            multiple={maxImages > 1}
            className="hidden"
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      )}

      <div className="flex items-start gap-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-green-600" />
        <span>仅本活动商家可查看，不会公开展示，也不会保存到你的个人信息或信息库。</span>
      </div>
    </div>
  );
};

// ============================================
// 动态字段渲染组件
// ============================================
const DynamicField: FC<{
  field: RegistrationFormField;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  readOnly?: boolean;
}> = ({ field, value, onChange, readOnly = false }) => {
  const stringValue = typeof value === "string" ? value : "";
  const arrayValue = Array.isArray(value) ? value : [];

  switch (field.type) {
    case "text":
      return (
        <input
          type={field.key === "phone" ? "tel" : "text"}
          inputMode={field.key === "phone" ? "numeric" : undefined}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          aria-readonly={readOnly}
          placeholder={field.placeholder || `请输入${field.label}`}
          className={`w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all ${readOnly ? "cursor-not-allowed opacity-80" : ""}`}
        />
      );

    case "textarea":
      return (
        <textarea
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `请输入${field.label}`}
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all resize-none"
        />
      );

    case "radio":
      return (
        <RadioTags
          options={field.options || []}
          value={stringValue}
          onChange={(v) => onChange(v)}
        />
      );

    case "select":
      return (
        <select
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundPosition: "right 12px center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <option value="">请选择{field.label}</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "multi-select":
      return (
        <MultiSelectTags
          options={field.options || []}
          selected={arrayValue}
          onChange={(v) => onChange(v)}
        />
      );

    default:
      return (
        <input
          type="text"
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `请输入${field.label}`}
          className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all"
        />
      );
  }
};

// ============================================
// 主页面
// ============================================

const UserRegistration: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, authStatus } = useAuthStore();
  const isParticipantUser = isAuthenticated && user?.user_type === "user";
  const verifiedPhone = String(user?.phone || "").replace(/\D/g, "");
  const registrationTypeId = searchParams.get("rt") || "";
  const registrationTypeQuery = registrationTypeId
    ? `?rt=${encodeURIComponent(registrationTypeId)}`
    : "";
  const detailPath = id ? `/u/activities/${id}${registrationTypeQuery}` : "/u/home";

  const { data: publicActivityData, isLoading: isPublicActivityLoading } =
    usePublicActivityDetail(id, registrationTypeId);
  const { data: userActivityData, isLoading: isUserActivityLoading } =
    useActivityDetail(isParticipantUser ? id : undefined, registrationTypeId);
  const { mutateAsync: submitEnrollment, isPending: isSubmitting } =
    useSubmitEnrollment(id || "", registrationTypeId);
  const { data: prefillData } = useProfilePrefill(isParticipantUser);
  const { mutateAsync: upsertFieldsAsync } = useUpsertFieldLibrary();

  const activity = useMemo(
    () =>
      isParticipantUser ? userActivityData?.data : publicActivityData?.data,
    [isParticipantUser, publicActivityData, userActivityData],
  );
  const isLoading =
    authStatus === "checking" ||
    (isParticipantUser ? isUserActivityLoading : isPublicActivityLoading);
  const registrationAvailability = useMemo(
    () => getRegistrationAvailability(activity),
    [activity],
  );

  // 获取报名表 schema
  const formSchema = useMemo<RegistrationFormField[]>(() => {
    const schema =
      activity?.registrationFormSchema &&
      activity.registrationFormSchema.length > 0
        ? activity.registrationFormSchema
        : DEFAULT_FORM_SCHEMA;
    return ensureRequiredPhoneField(schema);
  }, [activity]);

  // 表单数据状态：key -> value
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [imageAnswers, setImageAnswers] = useState<Record<string, string[]>>({});
  const [uploadingImageFields, setUploadingImageFields] = useState<Set<string>>(new Set());
  // 哪些字段被自动预填了（用于视觉提示）
  const [prefilledKeys, setPrefilledKeys] = useState<Set<string>>(new Set());
  // 防止 prefill 多次覆盖用户已修改值
  const hasAppliedPrefill = useRef(false);

  useEffect(() => {
    hasAppliedPrefill.current = false;
  }, [user?.id]);

  // 自动预填：当 prefill 数据和 schema 都准备好后，把命中的字段填入 formData
  useEffect(() => {
    if (hasAppliedPrefill.current) return;
    if (!isParticipantUser || !formSchema.length) return;

    const next: Record<string, string | string[]> = {};
    const matched = new Set<string>();
    if (prefillData) {
      for (const field of formSchema) {
        const hit = matchPrefillField(
          field,
          prefillData.fields,
          prefillData.aliases,
        );
        if (!hit) continue;
        next[field.key] = toFormValue(field, hit);
        matched.add(field.key);
      }
    }
    if (PHONE_PATTERN.test(verifiedPhone)) {
      next.phone = verifiedPhone;
      matched.add("phone");
    }
    if (matched.size > 0) {
      setFormData((prev) => ({ ...next, ...prev }));
      setPrefilledKeys(matched);
    }
    hasAppliedPrefill.current = true;
  }, [formSchema, isParticipantUser, prefillData, verifiedPhone]);

  const setField = useCallback((key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setImageField = useCallback((key: string, ids: string[]) => {
    setImageAnswers((previous) => ({ ...previous, [key]: ids }));
  }, []);

  const setImageFieldUploading = useCallback((key: string, uploading: boolean) => {
    setUploadingImageFields((previous) => {
      const next = new Set(previous);
      if (uploading) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  // 校验必填字段
  const isFormValid = useMemo(() => {
    return formSchema.every((field) => {
      if (field.key === "phone") {
        const phone = formData[field.key];
        return typeof phone === "string" && PHONE_PATTERN.test(phone);
      }
      if (!field.required) return true;
      if (field.type === "image") return (imageAnswers[field.key]?.length || 0) > 0;
      const val = formData[field.key];
      if (Array.isArray(val)) return val.length > 0;
      return typeof val === "string" && val.trim().length > 0;
    });
  }, [formSchema, formData, imageAnswers]);

  const handleSubmit = async () => {
    if (!isParticipantUser || !PHONE_PATTERN.test(verifiedPhone)) {
      Toast.show({
        icon: "fail",
        content: "请先完成手机号验证",
      });
      return;
    }
    if (formData.phone !== verifiedPhone) {
      Toast.show({
        icon: "fail",
        content: "报名手机号必须与已验证手机号一致",
      });
      return;
    }

    if (!registrationAvailability.canRegister) {
      Toast.show({
        icon: "fail",
        content: registrationAvailability.reason || "当前暂不可报名",
      });
      return;
    }

    if (!isFormValid) {
      // 找到第一个未填的必填字段
      const missing = formSchema.find((f) => {
        if (!f.required) return false;
        if (f.type === "image") return (imageAnswers[f.key]?.length || 0) === 0;
        const val = formData[f.key];
        if (Array.isArray(val)) return val.length === 0;
        return !val || (typeof val === "string" && !val.trim());
      });
      Toast.show({
        icon: "fail",
        content: missing ? `请填写「${missing.label}」` : "请填写所有必填项",
      });
      return;
    }

    if (uploadingImageFields.size > 0) {
      Toast.show({ icon: "fail", content: "图片仍在上传，请稍候" });
      return;
    }

    // 构建提交数据：将 key-value 映射为 label-value（后端按 label 存储）
    const submitData: Record<string, string> = {};
    for (const field of formSchema) {
      if (field.type === "image") continue;
      const val = formData[field.key];
      if (val !== undefined && val !== "") {
        submitData[field.label] = Array.isArray(val) ? val.join(",") : val;
      }
    }

    try {
      await submitEnrollment({ enrollment: submitData, imageAnswers });
      Toast.show({ icon: "success", content: "报名成功！", duration: 1500 });

      // 收集这次填写中可保存到信息库的字段（非空）
      const toSave: UpsertFieldLibraryItem[] = [];
      for (const field of formSchema) {
        if (field.type === "image") continue;
        const val = formData[field.key];
        if (val === undefined) continue;
        if (Array.isArray(val) ? val.length === 0 : !String(val).trim()) continue;
        toSave.push({
          field_key: field.key,
          field_label: field.label,
          field_value: Array.isArray(val) ? val.join(",") : String(val),
          field_type: mapFieldTypeToStorage(field.type),
        });
      }

      // 提交成功后询问是否保存到信息库（保存按用户选择决定，不阻塞跳转）
      const navigateToDetail = () =>
        navigate(detailPath, { replace: true });

      if (toSave.length > 0) {
        const ok = await Dialog.confirm({
          title: "保存到我的信息库？",
          content:
            "把这次填写的内容保存到「我的信息库」，下次报名其他活动时自动预填，免重复输入。仅自己可见，可在个人中心随时管理。",
          confirmText: "保存",
          cancelText: "不用了",
        });
        if (ok) {
          try {
            const res = await upsertFieldsAsync(toSave);
            if (!res.success) {
              Toast.show({
                icon: "fail",
                content: res.message || "保存失败，可稍后在个人中心重试",
              });
              navigateToDetail();
              return;
            }
            Toast.show({ icon: "success", content: "已保存到信息库" });
          } catch (err: unknown) {
            // 保存失败不阻塞流程
            Toast.show({
              icon: "fail",
              content:
                getSubmitErrorMessage(err, "保存失败，可稍后在个人中心重试"),
            });
          }
        }
      }
      navigateToDetail();
    } catch (error: unknown) {
      Toast.show({
        icon: "fail",
        content: getSubmitErrorMessage(error),
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <UserLayout showTabBar={true} showTopBar={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            正在加载活动信息...
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!activity) {
    return (
      <UserLayout showTabBar={true} showTopBar={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
          <AlertCircle
            size={40}
            className="text-gray-300 dark:text-gray-600 mb-3"
          />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            活动不存在
          </p>
          <button
            onClick={() => navigate("/u/home")}
            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg"
          >
            返回首页
          </button>
        </div>
      </UserLayout>
    );
  }

  if (!registrationAvailability.canRegister) {
    return (
      <UserLayout showTabBar={true} showTopBar={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle
            size={40}
            className="text-gray-300 dark:text-gray-600 mb-3"
          />
          <p className="text-gray-700 dark:text-gray-200 text-base font-medium mb-2">
            暂不可报名
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {registrationAvailability.reason || "当前活动暂不可报名"}
          </p>
          <button
            onClick={() => navigate(detailPath, { replace: true })}
            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg"
          >
            返回活动详情
          </button>
        </div>
      </UserLayout>
    );
  }

  if (activity.registrationType?.accessAllowed === false) {
    return (
      <UserLayout showTabBar={true} showTopBar={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle
            size={40}
            className="text-gray-300 dark:text-gray-600 mb-3"
          />
          <p className="text-gray-700 dark:text-gray-200 text-base font-medium mb-2">
            暂不可报名
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {activity.registrationType.accessDeniedReason || "你不在该报名表单的可报名名单中"}
          </p>
          <button
            onClick={() => navigate(detailPath, { replace: true })}
            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg"
          >
            返回活动详情
          </button>
        </div>
      </UserLayout>
    );
  }

  if (isAuthenticated && !isParticipantUser) {
    return (
      <UserLayout showTabBar={false} showTopBar={true}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <AlertCircle size={40} className="mb-3 text-gray-300" />
          <p className="text-base font-medium text-gray-700 dark:text-gray-200">
            主办方账号不可报名
          </p>
          <button
            type="button"
            onClick={() => navigate(detailPath, { replace: true })}
            className="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm text-white"
          >
            返回活动详情
          </button>
        </div>
      </UserLayout>
    );
  }

  const hasVerifiedPhone =
    isParticipantUser && PHONE_PATTERN.test(verifiedPhone);

  return (
    <UserLayout
      showTabBar={false}
      showTopBar={true}
      showBreadcrumb={true}
      breadcrumbItems={[
        { label: "首页", path: "/u/home" },
        { label: activity.title, path: detailPath },
        { label: "报名" },
      ]}
      bgColor="bg-gray-50 dark:bg-gray-900"
    >
      <div className="min-h-screen pb-[140px] md:pb-28">
        {/* 活动预览卡片 */}
        <div className="px-4 pt-4 md:px-6">
          <div className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="w-[60px] h-[60px] rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center flex-shrink-0">
              <Calendar size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                {activity.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Calendar size={12} />
                {dayjs(activity.eventStartTime).format("M月D日")}
                <span className="mx-1">·</span>
                <MapPin size={12} />
                {activity.location.split(" ")[0]}
              </p>
            </div>
            <span className="h-fit shrink-0 whitespace-nowrap rounded-full bg-success-50 px-2 py-1 text-[10px] font-medium text-success-600 dark:bg-success-900/30 dark:text-success-400">
              {activity.registrationType?.name || "报名中"}
            </span>
          </div>
        </div>

        {hasVerifiedPhone ? (
          <>
            {/* 动态表单 */}
            <div className="space-y-5 px-4 py-5 md:px-6">
              {prefilledKeys.size > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2.5 text-xs text-primary-700 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                  <Sparkles size={14} className="mt-0.5 flex-shrink-0" />
                  <span>
                    部分字段已根据你的「我的信息库」自动预填，可直接修改。
                  </span>
                </div>
              )}
              {formSchema.map((field) => {
                const isPrefilled = prefilledKeys.has(field.key);
                return (
                  <div key={field.key}>
                    <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <span>{field.label}</span>
                      {field.required && (
                        <span className="text-error-500">*</span>
                      )}
                      {isPrefilled && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                          <Sparkles size={10} />
                          已预填
                        </span>
                      )}
                    </label>
                    {field.type === "image" ? (
                      <EnrollmentImageField
                        activityId={id || ""}
                        registrationTypeId={
                          registrationTypeId || undefined
                        }
                        field={field}
                        onChange={setImageField}
                        onUploadingChange={setImageFieldUploading}
                      />
                    ) : (
                      <DynamicField
                        field={field}
                        value={
                          formData[field.key] ??
                          (field.type === "multi-select" ? [] : "")
                        }
                        onChange={(val) => setField(field.key, val)}
                        readOnly={field.key === "phone"}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 底部操作栏 - 报名页隐藏 TabBar，专注表单 */}
            <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
              <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pt-3 pb-3 md:px-6 md:pb-4 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)]">
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid || uploadingImageFields.size > 0}
                  loading={isSubmitting || uploadingImageFields.size > 0}
                  className="w-full h-12 text-base"
                >
                  {uploadingImageFields.size > 0 ? "图片上传中" : "确认报名"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <RegistrationPhoneVerification activityTitle={activity.title} />
        )}
      </div>
    </UserLayout>
  );
};

export default UserRegistration;
