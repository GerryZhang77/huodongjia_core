import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Send,
  Smartphone,
  Users,
  X,
} from "lucide-react";
import { Dialog } from "@/components/ui";
import {
  previewEnrollmentNotification,
  sendEnrollmentNotification,
  type EnrollmentNotificationChannel,
  type EnrollmentNotificationPreview,
  type EnrollmentNotificationSendResult,
  type NotificationRecipientPreview,
} from "@/features/enrollment/services/enrollmentNotificationApi";
import type { Enrollment, EnrollmentStatus } from "@/types/enrollment";
import { STATUS_LABELS } from "@/types/enrollment";

interface SendNotificationModalProps {
  visible: boolean;
  activityId: string;
  activityTitle?: string;
  enrollments: Enrollment[];
  filteredEnrollments?: Enrollment[];
  selectedIds?: string[];
  onClose: () => void;
  onSuccess?: (result: EnrollmentNotificationSendResult) => void;
}

interface NotificationTemplate {
  id: string;
  name: string;
  content: string;
}

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  { id: "activity_reminder", name: "活动提醒", content: "您报名的活动即将开始，请准时参加！" },
  { id: "matching_result", name: "匹配结果通知", content: "您的匹配结果已生成，快来查看您的小组成员吧！" },
  { id: "activity_update", name: "活动更新", content: "活动信息有更新，请查看最新详情。" },
  { id: "custom", name: "自定义消息", content: "" },
];

const CHANNEL_LABELS: Record<EnrollmentNotificationChannel, string> = {
  in_app: "站内通知",
  sms: "短信通知",
};

const createIdempotencyKey = () => {
  const browserCrypto = globalThis.crypto;
  if (typeof browserCrypto?.randomUUID === "function") {
    return browserCrypto.randomUUID();
  }
  const randomByte = () =>
    browserCrypto?.getRandomValues?.(new Uint8Array(1))[0] ?? Math.floor(Math.random() * 256);
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (character) =>
    (Number(character) ^ (randomByte() & (15 >> (Number(character) / 4)))).toString(16),
  );
};

const maskFallbackPhone = (phone?: string) => {
  const normalized = String(phone || "").trim();
  return /^1[3-9]\d{9}$/.test(normalized)
    ? `${normalized.slice(0, 3)}****${normalized.slice(-4)}`
    : null;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } })
    ?.response?.data?.message;
  if (responseMessage) return responseMessage;
  return error instanceof Error && error.message ? error.message : fallback;
};

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  visible,
  activityId,
  activityTitle = "活动",
  enrollments,
  filteredEnrollments,
  selectedIds = [],
  onClose,
  onSuccess,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState("activity_reminder");
  const [customContent, setCustomContent] = useState("");
  const [channels, setChannels] = useState<Set<EnrollmentNotificationChannel>>(
    () => new Set(["in_app"]),
  );
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<Set<string>>(
    () => new Set(selectedIds),
  );
  const [recipientsExpanded, setRecipientsExpanded] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");
  const deferredSearch = useDeferredValue(recipientSearch);
  const [recipientPreview, setRecipientPreview] = useState<EnrollmentNotificationPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isPreparingConfirmation, setIsPreparingConfirmation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<EnrollmentNotificationSendResult | null>(null);
  const [confirmPreview, setConfirmPreview] = useState<EnrollmentNotificationPreview | null>(null);
  const [confirmEnrollmentIds, setConfirmEnrollmentIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);

  const availableEnrollmentIds = useMemo(
    () => new Set(enrollments.map((enrollment) => enrollment.id)),
    [enrollments],
  );

  useEffect(() => {
    if (!visible) return;
    setSelectedEnrollmentIds(new Set(selectedIds.filter((id) => availableEnrollmentIds.has(id))));
    setChannels(new Set(["in_app"]));
    setSelectedTemplate("activity_reminder");
    setCustomContent("");
    setRecipientSearch("");
    setRecipientsExpanded(false);
    setSendResult(null);
    setConfirmPreview(null);
    setConfirmEnrollmentIds([]);
    setConfirmOpen(false);
    setError(null);
    setIdempotencyKey(createIdempotencyKey());
  }, [availableEnrollmentIds, selectedIds, visible]);

  useEffect(() => {
    if (!visible || !activityId || enrollments.length === 0) {
      setRecipientPreview(null);
      return;
    }
    let cancelled = false;
    setIsLoadingPreview(true);
    previewEnrollmentNotification({
      eventId: activityId,
      enrollmentIds: enrollments.map((enrollment) => enrollment.id),
      channels: ["in_app", "sms"],
    })
      .then((preview) => {
        if (!cancelled) setRecipientPreview(preview);
      })
      .catch((previewError) => {
        if (!cancelled) {
          setRecipientPreview(null);
          setError(getErrorMessage(previewError, "无法获取通知接收人数，请稍后重试"));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPreview(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activityId, enrollments, visible]);

  const currentContent = useMemo(() => {
    if (selectedTemplate === "custom") return customContent;
    return NOTIFICATION_TEMPLATES.find((template) => template.id === selectedTemplate)?.content || "";
  }, [customContent, selectedTemplate]);

  const previewById = useMemo(
    () => new Map((recipientPreview?.recipients || []).map((recipient) => [recipient.enrollment_id, recipient])),
    [recipientPreview?.recipients],
  );

  const recipientRows = useMemo<NotificationRecipientPreview[]>(() =>
    enrollments.map((enrollment) => previewById.get(enrollment.id) || {
      enrollment_id: enrollment.id,
      name: enrollment.name,
      masked_phone: maskFallbackPhone(enrollment.phone),
      status: enrollment.status,
      registration_type: enrollment.registrationTypeName || "未命名报名类型",
      eligibility: {
        in_app: { eligible: false, reason: "PREVIEW_LOADING" },
        sms: { eligible: false, reason: "PREVIEW_LOADING" },
      },
    }), [enrollments, previewById]);

  const filteredRecipientRows = useMemo(() => {
    const sourceIds = filteredEnrollments
      ? new Set(filteredEnrollments.map((enrollment) => enrollment.id))
      : null;
    const query = deferredSearch.trim().toLocaleLowerCase();
    return recipientRows.filter((recipient) => {
      if (sourceIds && !sourceIds.has(recipient.enrollment_id)) return false;
      if (!query) return true;
      const statusLabel = STATUS_LABELS[recipient.status as EnrollmentStatus] || recipient.status;
      return [recipient.name, recipient.masked_phone || "", statusLabel, recipient.registration_type]
        .some((value) => value.toLocaleLowerCase().includes(query));
    });
  }, [deferredSearch, filteredEnrollments, recipientRows]);

  const selectedRows = useMemo(
    () => recipientRows.filter((recipient) => selectedEnrollmentIds.has(recipient.enrollment_id)),
    [recipientRows, selectedEnrollmentIds],
  );

  const selectedSummary = useMemo(() => {
    const inAppSelected = channels.has("in_app");
    const smsSelected = channels.has("sms");
    const inAppCount = inAppSelected
      ? selectedRows.filter((recipient) => recipient.eligibility.in_app.eligible).length
      : 0;
    const smsCount = smsSelected
      ? selectedRows.filter((recipient) => recipient.eligibility.sms.eligible).length
      : 0;
    const skippedIds = new Set<string>();
    for (const recipient of selectedRows) {
      if (inAppSelected && !recipient.eligibility.in_app.eligible) skippedIds.add(recipient.enrollment_id);
      if (smsSelected && !recipient.eligibility.sms.eligible) skippedIds.add(recipient.enrollment_id);
    }
    return {
      inAppCount,
      smsCount,
      skippedCount: skippedIds.size,
      invalidPhoneCount: smsSelected
        ? selectedRows.filter((recipient) => recipient.eligibility.sms.reason === "PHONE_UNVERIFIED_OR_INVALID").length
        : 0,
      smsDisabledCount: smsSelected
        ? selectedRows.filter((recipient) => recipient.eligibility.sms.reason === "USER_SMS_DISABLED").length
        : 0,
    };
  }, [channels, selectedRows]);

  const allFilteredSelected = filteredRecipientRows.length > 0
    && filteredRecipientRows.every((recipient) => selectedEnrollmentIds.has(recipient.enrollment_id));
  const smsCapability = recipientPreview?.channels.sms;
  const isSmsCapabilityPending = isLoadingPreview || !recipientPreview;

  const toggleRecipient = useCallback((enrollmentId: string) => {
    setSelectedEnrollmentIds((current) => {
      const next = new Set(current);
      if (next.has(enrollmentId)) next.delete(enrollmentId);
      else next.add(enrollmentId);
      return next;
    });
  }, []);

  const toggleAllFiltered = useCallback(() => {
    setSelectedEnrollmentIds((current) => {
      const next = new Set(current);
      const shouldRemove = filteredRecipientRows.length > 0
        && filteredRecipientRows.every((recipient) => next.has(recipient.enrollment_id));
      for (const recipient of filteredRecipientRows) {
        if (shouldRemove) next.delete(recipient.enrollment_id);
        else next.add(recipient.enrollment_id);
      }
      return next;
    });
  }, [filteredRecipientRows]);

  const toggleChannel = useCallback((channel: EnrollmentNotificationChannel) => {
    if (channel === "sms" && (isSmsCapabilityPending || smsCapability?.available === false)) return;
    setChannels((current) => {
      const next = new Set(current);
      if (next.has(channel)) {
        if (next.size === 1) return current;
        next.delete(channel);
      } else {
        next.add(channel);
      }
      return next;
    });
  }, [isSmsCapabilityPending, smsCapability?.available]);

  const prepareConfirmation = useCallback(async () => {
    if (selectedEnrollmentIds.size === 0) {
      setError("请至少选择一位接收对象");
      return;
    }
    if (channels.has("in_app") && !currentContent.trim()) {
      setError("请输入站内通知内容");
      return;
    }
    setIsPreparingConfirmation(true);
    setError(null);
    try {
      const enrollmentIds = Array.from(selectedEnrollmentIds);
      const selectedChannels = Array.from(channels);
      const preview = await previewEnrollmentNotification({
        eventId: activityId,
        enrollmentIds,
        channels: selectedChannels,
      });
      if (selectedChannels.includes("sms") && !preview.channels.sms.available) {
        setError(preview.channels.sms.reason || "短信渠道当前不可用");
        return;
      }
      setConfirmEnrollmentIds(enrollmentIds);
      setConfirmPreview(preview);
      setConfirmOpen(true);
    } catch (previewError) {
      setError(getErrorMessage(previewError, "无法确认接收人数，请稍后重试"));
    } finally {
      setIsPreparingConfirmation(false);
    }
  }, [activityId, channels, currentContent, selectedEnrollmentIds]);

  const handleConfirmedSend = useCallback(async () => {
    if (!confirmPreview || confirmEnrollmentIds.length === 0) return;
    setIsSending(true);
    setError(null);
    try {
      const result = await sendEnrollmentNotification({
        eventId: activityId,
        enrollmentIds: confirmEnrollmentIds,
        channels: Array.from(channels),
        idempotencyKey,
        inApp: channels.has("in_app")
          ? {
              title: activityTitle ? `活动通知 - ${activityTitle}` : "活动通知",
              message: currentContent.trim(),
            }
          : undefined,
      });
      setSendResult(result);
      onSuccess?.(result);
    } catch (sendError) {
      setError(getErrorMessage(sendError, "发送失败，请稍后重试"));
    } finally {
      setIsSending(false);
    }
  }, [activityId, activityTitle, channels, confirmEnrollmentIds, confirmPreview, currentContent, idempotencyKey, onSuccess]);

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4">
        <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">发送通知</h2>
              <p className="mt-0.5 text-xs text-gray-500">已选择 {selectedEnrollmentIds.size} 人</p>
            </div>
            <button
              type="button"
              aria-label="关闭发送通知弹窗"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
              onClick={onClose}
              disabled={isSending}
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {sendResult ? (
              <div className="space-y-5 py-4">
                <div className="flex flex-col items-center">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">通知处理完成</h3>
                  {sendResult.idempotent_replay ? (
                    <p className="mt-1 text-sm text-gray-500">已返回同一请求的原发送结果，未重复发送。</p>
                  ) : null}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-center">
                    <p className="text-xl font-semibold text-blue-600">{sendResult.in_app_success_count}</p>
                    <p className="text-xs text-gray-600">站内成功</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 text-center">
                    <p className="text-xl font-semibold text-emerald-600">{sendResult.sms_queued_count}</p>
                    <p className="text-xs text-gray-600">短信入队</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3 text-center">
                    <p className="text-xl font-semibold text-amber-600">{sendResult.skipped_count}</p>
                    <p className="text-xs text-gray-600">跳过人数</p>
                  </div>
                </div>
                {sendResult.skip_reasons.length > 0 ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                    <p className="mb-2 text-sm font-medium text-amber-800">跳过原因</p>
                    <ul className="space-y-1 text-sm text-amber-700">
                      {sendResult.skip_reasons.map((item) => (
                        <li key={`${item.channel}:${item.code}`}>
                          {CHANNEL_LABELS[item.channel]}：{item.label}（{item.count} 人）
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                {error ? (
                  <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                    <span className="text-sm text-red-600">{error}</span>
                  </div>
                ) : null}

                <section>
                  <label className="mb-2 block text-sm font-medium text-gray-700">通知方式</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      aria-pressed={channels.has("in_app")}
                      onClick={() => toggleChannel("in_app")}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                        channels.has("in_app") ? "border-primary-400 bg-primary-50" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Bell size={18} className="text-primary-500" />
                      <span className="flex-1 text-sm font-medium text-gray-900">站内通知</span>
                      {channels.has("in_app") ? <Check size={17} className="text-primary-500" /> : null}
                    </button>
                    <button
                      type="button"
                      aria-pressed={channels.has("sms")}
                      aria-disabled={isSmsCapabilityPending || smsCapability?.available === false}
                      onClick={() => toggleChannel("sms")}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                        channels.has("sms")
                          ? "border-primary-400 bg-primary-50"
                          : isSmsCapabilityPending || smsCapability?.available === false
                            ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-70"
                            : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Smartphone size={18} className="text-emerald-600" />
                      <span className="flex-1 text-sm font-medium text-gray-900">短信通知</span>
                      {channels.has("sms") ? <Check size={17} className="text-primary-500" /> : null}
                    </button>
                  </div>
                  {isLoadingPreview ? (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                      <Loader2 size={13} className="animate-spin" /> 正在核对渠道可用性和接收人数
                    </p>
                  ) : smsCapability?.available === false ? (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      短信暂不可用：{smsCapability.reason || "短信渠道未配置"}。站内通知仍可正常发送。
                    </p>
                  ) : null}
                </section>

                <section className="rounded-xl border border-gray-200">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-3 text-left"
                    onClick={() => setRecipientsExpanded((expanded) => !expanded)}
                    aria-expanded={recipientsExpanded}
                  >
                    <Users size={17} className="text-gray-500" />
                    <span className="flex-1 text-sm font-medium text-gray-800">接收对象</span>
                    <span className="text-sm font-medium text-primary-600">已选择 {selectedEnrollmentIds.size} 人</span>
                    {recipientsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {recipientsExpanded ? (
                    <div className="border-t border-gray-100 p-3">
                      <div className="relative mb-3">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="search"
                          value={recipientSearch}
                          onChange={(event) => setRecipientSearch(event.target.value)}
                          placeholder="搜索姓名、手机号、状态或报名类型"
                          className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-primary-400"
                        />
                      </div>
                      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                        <span>当前筛选 {filteredRecipientRows.length} 人</span>
                        <button type="button" className="font-medium text-primary-600 hover:underline" onClick={toggleAllFiltered}>
                          {allFilteredSelected ? "取消选择当前筛选结果" : "全选当前筛选结果"}
                        </button>
                      </div>
                      <div className="max-h-72 space-y-2 overflow-y-auto pr-1 [content-visibility:auto]">
                        {filteredRecipientRows.map((recipient) => {
                          const selected = selectedEnrollmentIds.has(recipient.enrollment_id);
                          return (
                            <label
                              key={recipient.enrollment_id}
                              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                                selected ? "border-primary-300 bg-primary-50/60" : "border-gray-100 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleRecipient(recipient.enrollment_id)}
                                className="mt-1 h-4 w-4 accent-primary-500"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="font-medium text-gray-900">{recipient.name}</span>
                                  <span className="text-xs text-gray-500">{recipient.masked_phone || "无有效手机号"}</span>
                                </span>
                                <span className="mt-1 flex flex-wrap gap-1.5 text-xs text-gray-500">
                                  <span className="rounded bg-gray-100 px-1.5 py-0.5">
                                    {STATUS_LABELS[recipient.status as EnrollmentStatus] || recipient.status}
                                  </span>
                                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-600">{recipient.registration_type}</span>
                                </span>
                              </span>
                            </label>
                          );
                        })}
                        {filteredRecipientRows.length === 0 ? (
                          <p className="py-6 text-center text-sm text-gray-500">没有匹配的接收对象</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </section>

                <section className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                    <p className="text-xs text-gray-500">站内通知预计接收</p>
                    <p className="mt-1 text-xl font-semibold text-blue-600">{selectedSummary.inAppCount} 人</p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                    <p className="text-xs text-gray-500">短信预计接收</p>
                    <p className="mt-1 text-xl font-semibold text-emerald-600">{selectedSummary.smsCount} 人</p>
                    {channels.has("sms") ? (
                      <p className="mt-1 text-xs text-gray-500">
                        无有效手机号 {selectedSummary.invalidPhoneCount} 人 · 已关闭短信 {selectedSummary.smsDisabledCount} 人
                      </p>
                    ) : null}
                  </div>
                </section>

                {channels.has("in_app") ? (
                  <section className="space-y-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">站内消息模板</label>
                      <select
                        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary-400"
                        value={selectedTemplate}
                        onChange={(event) => setSelectedTemplate(event.target.value)}
                      >
                        {NOTIFICATION_TEMPLATES.map((template) => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">站内通知内容</label>
                      <textarea
                        className="h-24 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                        placeholder="请输入通知内容"
                        maxLength={500}
                        value={selectedTemplate === "custom" ? customContent : currentContent}
                        onChange={(event) => {
                          if (selectedTemplate !== "custom") setSelectedTemplate("custom");
                          setCustomContent(event.target.value);
                        }}
                      />
                      <p className="mt-1 text-right text-xs text-gray-400">{currentContent.length}/500</p>
                    </div>
                  </section>
                ) : null}

                {channels.has("sms") ? (
                  <section className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                    <div className="flex items-start gap-2">
                      <Smartphone size={17} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800">固定报名状态短信</p>
                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                          短信内容由后端按每位报名者当前真实状态生成，不会使用上方自定义站内文案，也不能由前端修改模板参数。
                        </p>
                      </div>
                    </div>
                  </section>
                ) : null}
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3">
            {sendResult ? (
              <button type="button" className="rounded-lg bg-green-500 px-6 py-2 text-sm font-medium text-white hover:bg-green-600" onClick={onClose}>
                完成
              </button>
            ) : (
              <>
                <button type="button" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100" onClick={onClose} disabled={isSending}>
                  取消
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={prepareConfirmation}
                  disabled={isLoadingPreview || isPreparingConfirmation || isSending || selectedEnrollmentIds.size === 0}
                >
                  {isPreparingConfirmation ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {isPreparingConfirmation ? "正在核对..." : "核对并发送"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        type="confirm"
        title="确认发送通知"
        content={confirmPreview ? (
          <div className="space-y-2 text-left">
            <p>
              将向 <strong>{confirmPreview.channels.in_app.eligible_count}</strong> 人发送站内通知，
              向 <strong>{confirmPreview.channels.sms.eligible_count}</strong> 人发送短信，预计跳过
              <strong> {confirmPreview.skipped_count}</strong> 人。
            </p>
            {confirmPreview.skip_reasons.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-xs">
                {confirmPreview.skip_reasons.map((item) => (
                  <li key={`${item.channel}:${item.code}`}>
                    {CHANNEL_LABELS[item.channel]}：{item.label}（{item.count} 人）
                  </li>
                ))}
              </ul>
            ) : null}
            {channels.has("sms") ? <p className="text-xs text-emerald-700">短信将进入异步 Outbox，入队不等于运营商已送达。</p> : null}
          </div>
        ) : null}
        okText="确认发送"
        cancelText="返回修改"
        okLoading={isSending}
        onOk={handleConfirmedSend}
      />
    </>
  );
};

export default SendNotificationModal;
