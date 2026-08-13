/**
 * EnrollmentDetailDrawer - 报名人员详情抽屉
 *
 * 从底部弹出的详情面板，PC端从右侧弹出
 * 展示报名人员的完整信息
 *
 * 与用户池的 UserDetailDrawer 保持视觉风格一致
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  UserCircle,
  Tag as TagIcon,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  LockKeyhole,
} from "lucide-react";
import { useActivityDetail } from "@/features/activities/hooks/useActivityDetail";
import type { RegistrationFormField } from "@/features/activities/types";
import type { Enrollment } from "@/types/enrollment";
import { STATUS_LABELS } from "@/types/enrollment";
import PrivateEnrollmentImageGallery from "./PrivateEnrollmentImageGallery";

// ========================================
// 类型定义
// ========================================

export interface EnrollmentDetailDrawerProps {
  /** 是否显示 */
  visible: boolean;
  /** 当前活动 ID */
  activityId?: string;
  /** 当前查看的报名信息 */
  enrollment: Enrollment | null;
  /** 关闭回调 */
  onClose: () => void;
  /** 通过回调 */
  onApprove?: (id: string) => void;
  /** 静默结束审核回调 */
  onReject?: (id: string) => void;
  /** 取消已通过报名并释放名额 */
  onCancel?: (id: string) => void;
  /** 发送通知回调 */
  onNotify?: (id: string) => void;
  /** 指定需要参与者补充或确认的字段。 */
  onRequestUpdate?: (
    id: string,
    fieldKeys: string[],
    note?: string,
  ) => Promise<void>;
  /** 将参与者最新一次修改标记为已查看。 */
  onReviewChanges?: (id: string) => Promise<void>;
}

// ========================================
// 状态配色
// ========================================

const statusStyles: Record<string, string> = {
  approved: "bg-green-100 text-green-600",
  pending: "bg-yellow-100 text-yellow-600",
  rejected: "bg-red-100 text-red-600",
  cancelled: "bg-gray-100 text-gray-500",
  waitlist: "bg-blue-100 text-blue-600",
};

// ========================================
// 辅助组件
// ========================================

const formatFieldValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) {
    return value.join("、");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const FormDataRow: React.FC<{
  label: string;
  value: unknown;
}> = ({ label, value }) => {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-gray-500 w-20 flex-shrink-0 truncate">
        {label}
      </span>
      <span className="text-sm text-gray-900 flex-1 break-words">
        {formatFieldValue(value)}
      </span>
    </div>
  );
};

// ========================================
// 主组件
// ========================================

const EnrollmentDetailDrawer: React.FC<EnrollmentDetailDrawerProps> = ({
  visible,
  activityId,
  enrollment,
  onClose,
  onApprove,
  onReject,
  onCancel,
  onNotify,
  onRequestUpdate,
  onReviewChanges,
}) => {
  const { activity } = useActivityDetail(activityId);
  const [requestMode, setRequestMode] = useState(false);
  const [requestFieldKeys, setRequestFieldKeys] = useState<Set<string>>(new Set());
  const [requestNote, setRequestNote] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    setRequestMode(false);
    setRequestFieldKeys(new Set());
    setRequestNote("");
  }, [enrollment?.id, visible]);

  const currentSchema = useMemo(() => {
    const registrationTypeSchema = activity?.registrationTypes?.find(
      (type) => type.id === enrollment?.registrationTypeId,
    )?.formSchema;
    if (registrationTypeSchema?.length) return registrationTypeSchema;
    if (activity?.registrationFormSchema?.length) {
      return activity.registrationFormSchema;
    }
    return (enrollment?.formSchemaSnapshot || []) as RegistrationFormField[];
  }, [activity, enrollment]);

  const fieldLabelMap = useMemo(() => {
    return new Map(
      currentSchema
        .filter((field) => field?.key)
        .map((field) => [field.key, field.label || field.key]),
    );
  }, [currentSchema]);

  if (!visible || !enrollment) return null;

  const canonicalEntries = currentSchema
    .map((field) => [field.key, enrollment.formAnswers?.[field.key]] as const)
    .filter(([, value]) => value !== null && value !== undefined && value !== "");
  const canonicalKeys = new Set(canonicalEntries.map(([key]) => key));
  const canonicalLabels = new Set(canonicalEntries.map(([key]) => fieldLabelMap.get(key) || key));
  const legacyEntries = Object.entries(enrollment.formData || {}).filter(
    ([key, value]) =>
      !canonicalKeys.has(key) &&
      !canonicalLabels.has(key) &&
      value !== null &&
      value !== undefined &&
      value !== "",
  );
  const formDataEntries = [...canonicalEntries, ...legacyEntries].filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
  const formDataKeys = new Set(formDataEntries.map(([key]) => key));
  const formDataLabels = new Set(
    formDataEntries.map(([key]) => fieldLabelMap.get(key) || key),
  );
  const customFieldEntries = Object.entries(
    enrollment.customFields || {},
  ).filter(
    ([key, value]) =>
      key !== "报名类型" &&
      !formDataKeys.has(key) &&
      !formDataLabels.has(key) &&
      value !== null &&
      value !== undefined &&
      value !== "",
  );

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const derivedLabels: Record<string, string> = {
    __merchant_derived_household_province: "户籍（省级）",
    __merchant_derived_age: "年龄",
    __merchant_derived_zodiac: "星座",
    __merchant_derived_birth_year: "出生年份",
  };
  const derivedEntries = Object.entries(enrollment.merchantDerivedFields || {});

  const submitUpdateRequest = async () => {
    if (!onRequestUpdate || requestFieldKeys.size === 0) return;
    setRequesting(true);
    try {
      await onRequestUpdate(
        enrollment.id,
        Array.from(requestFieldKeys),
        requestNote.trim() || undefined,
      );
      setRequestMode(false);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-stretch md:justify-end">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* 面板 - 移动端底部弹出 / PC端右侧滑出 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="报名详情"
        className="relative flex h-[85dvh] max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white animate-slide-up md:h-full md:max-h-full md:w-[420px] md:rounded-none md:animate-none"
      >
        {/* 移动端拖拽指示条 */}
        <div className="flex justify-center pt-2 pb-1 md:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">报名详情</h3>
          <button
            type="button"
            aria-label="关闭报名详情"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          {/* 用户头像 + 名字 + 状态 */}
          <div className="flex items-center gap-4 py-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold text-lg">
                {enrollment.name.slice(0, 1)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  {enrollment.name}
                </h2>
                <span
              className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[enrollment.status] || "bg-gray-100 text-gray-500"}`}
                >
                  {STATUS_LABELS[enrollment.status] || enrollment.status}
                </span>
                {enrollment.registrationTypeName && (
              <span className="whitespace-nowrap rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                    {enrollment.registrationTypeName}
                  </span>
                )}
                {enrollment.hasUnreviewedChanges && (
                  <span className="whitespace-nowrap rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                    资料有更新
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                {enrollment.gender && (
                  <span>
                    {enrollment.gender === "male"
                      ? "男"
                      : enrollment.gender === "female"
                        ? "女"
                        : "其他"}
                  </span>
                )}
                {enrollment.age && <span>{enrollment.age}岁</span>}
                {enrollment.occupation && <span>{enrollment.occupation}</span>}
              </div>
            </div>
          </div>

          {/* 报名时间 */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 rounded-lg px-3 py-2">
            <Clock size={14} className="text-gray-400" />
            <span>报名时间：{formatDate(enrollment.enrolledAt)}</span>
          </div>

          {/* 外部用户提示 */}
          {enrollment.isExternal && (
            <div className="flex items-center gap-2 text-sm text-orange-600 mb-4 bg-orange-50 rounded-lg px-3 py-2">
              <span>该用户通过导入添加，暂无平台账号</span>
            </div>
          )}

          {enrollment.updateRequired && (
            <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs text-orange-700">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">已要求参与者更新资料</p>
                  <p className="mt-1 leading-5">
                    {(enrollment.updateRequest?.fieldKeys || [])
                      .map((key) => fieldLabelMap.get(key) || key)
                      .join("、")}
                  </p>
                  {enrollment.updateRequest?.note && (
                    <p className="mt-1 leading-5">说明：{enrollment.updateRequest.note}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {enrollment.latestChanges && enrollment.latestChanges.length > 0 && (
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-gray-900">最近修改</h4>
                {enrollment.hasUnreviewedChanges && onReviewChanges && (
                  <button
                    type="button"
                    onClick={() => onReviewChanges(enrollment.id)}
                    className="text-xs font-medium text-primary-500 hover:text-primary-600"
                  >
                    标记已查看
                  </button>
                )}
              </div>
              <div className="divide-y divide-orange-100 rounded-xl border border-orange-100 bg-orange-50/60 px-3">
                {enrollment.latestChanges.map((change) => (
                  <div key={change.fieldKey} className="py-2.5 text-xs">
                    <p className="font-medium text-gray-800">{change.label}</p>
                    {change.confirmedOnly ? (
                      <p className="mt-1 text-orange-700">参与者确认原内容无误</p>
                    ) : (
                      <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-start gap-2 text-gray-500">
                        <span className="break-words line-through">{formatFieldValue(change.before) || "未填写"}</span>
                        <span>→</span>
                        <span className="break-words font-medium text-gray-800">{formatFieldValue(change.after) || "未填写"}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 基本信息 */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <UserCircle size={16} className="text-gray-500" />
              基本信息
            </h4>
            <div className="bg-gray-50 rounded-xl px-4 py-1 divide-y divide-gray-100">
              {formDataEntries.length > 0 ? (
                formDataEntries.map(([key, value]) => (
                  <FormDataRow
                    key={key}
                    label={fieldLabelMap.get(key) || key}
                    value={value}
                  />
                ))
              ) : (
                <div className="py-3 text-sm text-gray-400">暂无基本信息</div>
              )}
            </div>
          </div>

          {activityId && enrollment.imageCount !== 0 && (
            <PrivateEnrollmentImageGallery
              activityId={activityId}
              participantId={enrollment.id}
            />
          )}

          {derivedEntries.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                <LockKeyhole size={15} className="text-slate-500" />
                商家派生信息
              </h4>
              <div className="rounded-xl bg-slate-50 px-4 py-1">
                {derivedEntries.map(([key, value]) => (
                  <FormDataRow
                    key={key}
                    label={derivedLabels[key] || key}
                    value={value}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-[11px] leading-4 text-gray-400">
                根据报名身份证号在服务端推算，仅主办方可见；户籍为身份证签发地区省级推断。
              </p>
            </div>
          )}

          {requestMode && (
            <div className="absolute bottom-20 left-4 right-4 z-20 max-h-[60vh] overflow-y-auto rounded-xl border border-primary-100 bg-white p-3 shadow-xl">
              <p className="text-sm font-medium text-gray-900">选择需补充或确认的字段</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {currentSchema.filter((field) => field.type !== "image").map((field) => (
                  <label key={field.key} className="flex items-start gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={requestFieldKeys.has(field.key)}
                      onChange={(event) => setRequestFieldKeys((previous) => {
                        const next = new Set(previous);
                        if (event.target.checked) next.add(field.key);
                        else next.delete(field.key);
                        return next;
                      })}
                      className="mt-0.5"
                    />
                    <span>{field.label}</span>
                  </label>
                ))}
              </div>
              <textarea
                value={requestNote}
                onChange={(event) => setRequestNote(event.target.value)}
                placeholder="补充说明（选填）"
                rows={2}
                className="mt-3 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary-400"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setRequestMode(false)} className="px-3 py-1.5 text-xs text-gray-500">
                  取消
                </button>
                <button
                  type="button"
                  disabled={requestFieldKeys.size === 0 || requesting}
                  onClick={submitUpdateRequest}
                  className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                >
                  {requesting ? "发送中…" : "发送更新要求"}
                </button>
              </div>
            </div>
          )}

          {/* 个人简介 / 匹配需求 */}
          {(enrollment.bio || enrollment.matchingNeeds) && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                {enrollment.matchingNeeds ? "匹配需求" : "个人简介"}
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">
                {enrollment.matchingNeeds || enrollment.bio}
              </p>
            </div>
          )}

          {/* 标签 */}
          {enrollment.tags && enrollment.tags.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <TagIcon size={16} className="text-gray-500" />
                标签
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {enrollment.tags.map((tag) => (
                  <span
                    key={tag}
                  className="max-w-full truncate whitespace-nowrap rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 自定义字段 */}
          {customFieldEntries.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                其他信息
              </h4>
              <div className="bg-gray-50 rounded-xl px-4 py-2 space-y-2">
                {customFieldEntries.map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3 py-1">
                    <span className="text-sm text-gray-500 w-20 flex-shrink-0">
                      {key}
                    </span>
                    <span className="text-sm text-gray-900 flex-1">
                      {formatFieldValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <footer className="safe-area-pb flex shrink-0 flex-col gap-3 border-t border-gray-100 bg-white px-5 pt-4">
          {onRequestUpdate && !requestMode && !enrollment.isExternal && (
            <button
              type="button"
              className="flex w-full items-center justify-center whitespace-nowrap rounded-[22px] border border-primary-200 py-3 text-sm font-medium text-primary-600 hover:bg-primary-50"
              onClick={() => setRequestMode(true)}
            >
              要求补充资料
            </button>
          )}
          <div className="flex w-full gap-3">
            {enrollment.status === "pending" ? (
              <>
              <button
                type="button"
                className="flex flex-1 flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-[22px] border border-red-300 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 [&>svg]:shrink-0"
                onClick={() => onReject?.(enrollment.id)}
              >
                <XCircle size={16} />
                结束审核
              </button>
              <button
                type="button"
                className="flex flex-1 flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-[22px] bg-gradient-to-br from-green-500 to-green-600 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md [&>svg]:shrink-0"
                onClick={() => onApprove?.(enrollment.id)}
              >
                <CheckCircle size={16} />
                通过
              </button>
              </>
            ) : enrollment.status === "approved" ? (
              <>
                <button
                  type="button"
                  className="flex flex-1 flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-[22px] border border-red-300 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 [&>svg]:shrink-0"
                  onClick={() => onCancel?.(enrollment.id)}
                >
                  <XCircle size={16} />
                  取消并释放名额
                </button>
                <button
                  type="button"
                  className="flex flex-1 flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-[22px] bg-gradient-to-br from-primary-400 to-primary-500 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md [&>svg]:shrink-0"
                  onClick={() => onNotify?.(enrollment.id)}
                >
                  <Send size={16} />
                  发送通知
                </button>
              </>
            ) : (
              <button
                type="button"
                className="flex flex-1 flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-[22px] bg-gradient-to-br from-primary-400 to-primary-500 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md [&>svg]:shrink-0"
                onClick={() => onNotify?.(enrollment.id)}
              >
                <Send size={16} />
                发送通知
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EnrollmentDetailDrawer;
