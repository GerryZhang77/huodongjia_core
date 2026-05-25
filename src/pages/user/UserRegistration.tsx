/**
 * 用户端活动报名页面
 * 根据活动的 registrationFormSchema 动态渲染报名表
 * 若活动无自定义 schema，则使用默认表单
 */

import { FC, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, AlertCircle, Sparkles } from "lucide-react";
import { Dialog } from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui";
import { UserLayout } from "@/components/layout/UserLayout";
import { useActivityDetail } from "@/features/user";
import { useSubmitEnrollment } from "@/features/user/enrollment/hooks/useSubmitEnrollment";
import {
  useProfilePrefill,
  useUpsertFieldLibrary,
  matchPrefillField,
  toFormValue,
  mapFieldTypeToStorage,
  type UpsertFieldLibraryItem,
} from "@/features/user/field-library";
import type { RegistrationFormField } from "@/features/activities/types";
import { getRegistrationAvailability } from "@/features/user/activity/utils/registrationAvailability";
import dayjs from "dayjs";

// ============================================
// 默认报名表 schema（无自定义时使用）
// ============================================
const DEFAULT_FORM_SCHEMA: RegistrationFormField[] = [
  { key: "name", label: "姓名", type: "text", required: false, preset: true, placeholder: "请输入您的姓名" },
  { key: "phone", label: "手机号", type: "text", required: false, preset: true, placeholder: "请输入手机号" },
  { key: "gender", label: "性别", type: "radio", required: false, preset: true, options: ["男", "女"] },
];

function getSubmitErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const maybeAxiosError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return (
      maybeAxiosError.response?.data?.message ||
      maybeAxiosError.message ||
      "报名失败，请稍后重试"
    );
  }
  return "报名失败，请稍后重试";
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

// ============================================
// 动态字段渲染组件
// ============================================
const DynamicField: FC<{
  field: RegistrationFormField;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}> = ({ field, value, onChange }) => {
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
          placeholder={field.placeholder || `请输入${field.label}`}
          className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all"
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

  const { data: activityData, isLoading } = useActivityDetail(id);
  const { mutateAsync: submitEnrollment, isPending: isSubmitting } =
    useSubmitEnrollment(id || "");
  const { data: prefillData } = useProfilePrefill();
  const { mutateAsync: upsertFieldsAsync } = useUpsertFieldLibrary();

  const activity = useMemo(() => activityData?.data, [activityData]);
  const registrationAvailability = useMemo(
    () => getRegistrationAvailability(activity),
    [activity],
  );

  // 获取报名表 schema
  const formSchema = useMemo<RegistrationFormField[]>(() => {
    if (activity?.registrationFormSchema && activity.registrationFormSchema.length > 0) {
      return activity.registrationFormSchema;
    }
    return DEFAULT_FORM_SCHEMA;
  }, [activity]);

  // 表单数据状态：key -> value
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  // 哪些字段被自动预填了（用于视觉提示）
  const [prefilledKeys, setPrefilledKeys] = useState<Set<string>>(new Set());
  // 防止 prefill 多次覆盖用户已修改值
  const hasAppliedPrefill = useRef(false);

  // 自动预填：当 prefill 数据和 schema 都准备好后，把命中的字段填入 formData
  useEffect(() => {
    if (hasAppliedPrefill.current) return;
    if (!prefillData || !formSchema.length) return;

    const next: Record<string, string | string[]> = {};
    const matched = new Set<string>();
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
    if (matched.size > 0) {
      setFormData((prev) => ({ ...next, ...prev }));
      setPrefilledKeys(matched);
    }
    hasAppliedPrefill.current = true;
  }, [prefillData, formSchema]);

  const setField = useCallback((key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // 校验必填字段
  const isFormValid = useMemo(() => {
    return formSchema.every((field) => {
      if (!field.required) return true;
      const val = formData[field.key];
      if (Array.isArray(val)) return val.length > 0;
      return typeof val === "string" && val.trim().length > 0;
    });
  }, [formSchema, formData]);

  const handleSubmit = async () => {
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

    // 构建提交数据：将 key-value 映射为 label-value（后端按 label 存储）
    const submitData: Record<string, string> = {};
    for (const field of formSchema) {
      const val = formData[field.key];
      if (val !== undefined && val !== "") {
        submitData[field.label] = Array.isArray(val) ? val.join(",") : val;
      }
    }

    try {
      await submitEnrollment(submitData as any);
      Toast.show({ icon: "success", content: "报名成功！", duration: 1500 });

      // 收集这次填写中可保存到信息库的字段（非空）
      const toSave: UpsertFieldLibraryItem[] = [];
      for (const field of formSchema) {
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
        navigate(`/u/activities/${id}`, { replace: true });

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
          } catch (err: any) {
            // 保存失败不阻塞流程
            Toast.show({
              icon: "fail",
              content:
                err?.response?.data?.message ||
                err?.message ||
                "保存失败，可稍后在个人中心重试",
            });
          }
        }
      }
      navigateToDetail();
    } catch (error: any) {
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
            onClick={() => navigate(`/u/activities/${id}`, { replace: true })}
            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg"
          >
            返回活动详情
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout
      showTabBar={false}
      showTopBar={true}
      showBreadcrumb={true}
      breadcrumbItems={[
        { label: "首页", path: "/u/home" },
        { label: activity.title, path: `/u/activities/${id}` },
        { label: "报名" },
      ]}
      bgColor="bg-gray-50 dark:bg-gray-900"
    >
      <div className="min-h-screen pb-[140px] md:pb-28">
        {/* 活动预览卡片 */}
        <div className="px-4 pt-4 md:px-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 flex gap-3 shadow-sm">
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
            <span className="px-2 py-1 h-fit bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400 text-[10px] font-medium rounded-full">
              {activity.registrationType?.name || "报名中"}
            </span>
          </div>
        </div>

        {/* 动态表单 */}
        <div className="px-4 py-5 md:px-6 space-y-5">
          {prefilledKeys.size > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-lg text-xs text-primary-700 dark:text-primary-300">
              <Sparkles size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                部分字段已根据你的「我的信息库」自动预填，可直接修改。
              </span>
            </div>
          )}
          {formSchema.map((field) => {
            const isPrefilled = prefilledKeys.has(field.key);
            return (
              <div key={field.key}>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span>{field.label}</span>
                  {field.required && (
                    <span className="text-error-500">*</span>
                  )}
                  {isPrefilled && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      <Sparkles size={10} />
                      已预填
                    </span>
                  )}
                </label>
                <DynamicField
                  field={field}
                  value={formData[field.key] ?? (field.type === "multi-select" ? [] : "")}
                  onChange={(val) => setField(field.key, val)}
                />
              </div>
            );
          })}
        </div>

        {/* 底部操作栏 - 报名页隐藏 TabBar，专注表单 */}
        <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
          <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pt-3 pb-3 md:px-6 md:pb-4 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)]">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              loading={isSubmitting}
              className="w-full h-12 text-base"
            >
              确认报名
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserRegistration;
