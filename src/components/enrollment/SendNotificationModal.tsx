/**
 * 发送通知模态框组件
 * 支持选择通知类型、接收人、编辑内容
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  X,
  Send,
  MessageSquare,
  Bell,
  Mail,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { Enrollment } from "@/types/enrollment";
import { useStore } from "@/store";

// ========================================
// 类型定义
// ========================================

interface SendNotificationModalProps {
  visible: boolean;
  activityId: string;
  activityTitle?: string;
  enrollments: Enrollment[];
  selectedIds?: string[];
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

type NotificationType = "sms" | "email" | "inapp";

interface NotificationTemplate {
  id: string;
  name: string;
  content: string;
}

// 通知模板
const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "activity_reminder",
    name: "活动提醒",
    content: "您报名的活动即将开始，请准时参加！",
  },
  {
    id: "matching_result",
    name: "匹配结果通知",
    content: "您的匹配结果已生成，快来查看您的小组成员吧！",
  },
  {
    id: "activity_update",
    name: "活动更新",
    content: "活动信息有更新，请查看最新详情。",
  },
  {
    id: "custom",
    name: "自定义消息",
    content: "",
  },
];

// ========================================
// 组件实现
// ========================================

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  visible,
  activityId,
  activityTitle = "活动",
  enrollments,
  selectedIds = [],
  onClose,
  onSuccess,
}) => {
  // 调试日志
  console.log(
    "[SendNotificationModal] enrollments:",
    enrollments?.length,
    enrollments,
  );
  console.log("[SendNotificationModal] selectedIds:", selectedIds);

  // 从 store 获取 token
  const { token } = useStore();

  // 通知类型
  const [notificationType, setNotificationType] =
    useState<NotificationType>("inapp");
  // 选择的模板
  const [selectedTemplate, setSelectedTemplate] =
    useState<string>("activity_reminder");
  // 自定义内容
  const [customContent, setCustomContent] = useState("");
  // 接收人范围
  const [recipientScope, setRecipientScope] = useState<
    "all" | "selected" | "approved"
  >(selectedIds.length > 0 ? "selected" : "all");
  // 发送状态
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 发送成功状态
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    count: number;
  } | null>(null);

  // 计算接收人列表
  const recipients = useMemo(() => {
    switch (recipientScope) {
      case "selected":
        return enrollments.filter((e) => selectedIds.includes(e.id));
      case "approved":
        return enrollments.filter((e) => e.status === "approved");
      case "all":
      default:
        return enrollments;
    }
  }, [enrollments, selectedIds, recipientScope]);

  // 获取当前内容
  const currentContent = useMemo(() => {
    if (selectedTemplate === "custom") {
      return customContent;
    }
    const template = NOTIFICATION_TEMPLATES.find(
      (t) => t.id === selectedTemplate,
    );
    return template?.content || "";
  }, [selectedTemplate, customContent]);

  // 发送通知
  const handleSend = useCallback(async () => {
    if (!currentContent.trim()) {
      setError("请输入通知内容");
      return;
    }

    if (recipients.length === 0) {
      setError("没有可发送的接收人");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/events/${activityId}/enrollments/notify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: notificationType,
            message: currentContent,
            recipients: recipients.map((r) => r.id),
            activityTitle,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        const sentCount = result.data?.sent_count || recipients.length;
        setSendResult({ success: true, count: sentCount });
        onSuccess?.(sentCount);
      } else {
        setError(result.message || "发送失败，请重试");
      }
    } catch (err) {
      console.error("发送通知失败:", err);
      setError("网络错误，请检查网络连接后重试");
    } finally {
      setIsSending(false);
    }
  }, [
    activityId,
    activityTitle,
    currentContent,
    notificationType,
    recipients,
    token,
    onSuccess,
  ]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">发送通知</h2>
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            onClick={onClose}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 发送成功状态 */}
          {sendResult?.success && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                发送成功
              </h3>
              <p className="text-gray-500 text-center">
                已成功发送{" "}
                <span className="text-green-600 font-medium">
                  {sendResult.count}
                </span>{" "}
                条通知
              </p>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
              <AlertCircle
                size={16}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* 发送前的表单内容 */}
          {!sendResult?.success && (
            <>
              {/* 通知类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  通知方式
                </label>
                <div className="flex gap-2">
                  {[
                    { type: "inapp" as const, label: "站内通知", icon: Bell },
                    {
                      type: "sms" as const,
                      label: "短信",
                      icon: MessageSquare,
                    },
                    { type: "email" as const, label: "邮件", icon: Mail },
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        notificationType === type
                          ? "bg-primary-50 border-primary-400 text-primary-600"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setNotificationType(type)}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 接收人范围 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  接收人
                </label>
                <div className="space-y-2">
                  {[
                    {
                      scope: "all" as const,
                      label: "全部报名者",
                      count: enrollments.length,
                    },
                    {
                      scope: "approved" as const,
                      label: "已通过审核",
                      count: enrollments.filter((e) => e.status === "approved")
                        .length,
                    },
                    ...(selectedIds.length > 0
                      ? [
                          {
                            scope: "selected" as const,
                            label: "已选择",
                            count: selectedIds.length,
                          },
                        ]
                      : []),
                  ].map(({ scope, label, count }) => (
                    <label
                      key={scope}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        recipientScope === scope
                          ? "bg-primary-50 border-primary-400"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="recipientScope"
                        value={scope}
                        checked={recipientScope === scope}
                        onChange={() => setRecipientScope(scope)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          recipientScope === scope
                            ? "border-primary-400 bg-primary-400"
                            : "border-gray-300"
                        }`}
                      >
                        {recipientScope === scope && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      <Users size={16} className="text-gray-400" />
                      <span className="flex-1 text-sm text-gray-900">
                        {label}
                      </span>
                      <span className="text-sm text-gray-500">{count} 人</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 通知模板 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  消息模板
                </label>
                <select
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  {NOTIFICATION_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 通知内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  通知内容
                </label>
                <textarea
                  className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-primary-400"
                  placeholder="请输入通知内容..."
                  value={
                    selectedTemplate === "custom"
                      ? customContent
                      : currentContent
                  }
                  onChange={(e) => {
                    if (selectedTemplate === "custom") {
                      setCustomContent(e.target.value);
                    } else {
                      // 切换到自定义模板并保留内容
                      setSelectedTemplate("custom");
                      setCustomContent(e.target.value);
                    }
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  将发送给 {recipients.length} 位报名者
                </p>
              </div>

              {/* 接收人预览 */}
              {recipients.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    接收人预览
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {recipients.slice(0, 8).map((r) => (
                      <span
                        key={r.id}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {r.name}
                      </span>
                    ))}
                    {recipients.length > 8 && (
                      <span className="px-2 py-1 text-gray-500 text-xs">
                        +{recipients.length - 8} 人
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
          {sendResult?.success ? (
            // 发送成功后显示完成按钮
            <button
              className="px-6 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors inline-flex items-center gap-2"
              onClick={onClose}
            >
              <CheckCircle2 size={16} />
              完成
            </button>
          ) : (
            // 发送前显示取消和发送按钮
            <>
              <button
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg"
                onClick={onClose}
                disabled={isSending}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-primary-400 text-white text-sm font-medium rounded-lg hover:bg-primary-500 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                onClick={handleSend}
                disabled={isSending || recipients.length === 0}
              >
                {isSending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    发送中...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    发送通知
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendNotificationModal;
