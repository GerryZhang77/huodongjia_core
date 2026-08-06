/**
 * PublishResultDialog - 发布匹配结果对话框
 * 支持发布结果并发送通知给参与者
 * 当前仅开放站内通知，短信和邮件渠道待真实发送能力接入后再展示
 * 参考 SendNotificationDialog 组件设计
 */

import React, { useEffect, useState, useMemo } from "react";
import {
  Send,
  Bell,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui";

export interface MatchGroupStats {
  id: string;
  name?: string;
  members: string[];
  isLocked: boolean;
  warnings?: string[];
}

/** 参与者信息用于预览 */
export interface ParticipantPreview {
  id: string;
  enrollmentId?: string;
  name: string;
  avatar?: string;
}

/** 通知渠道类型 */
export type NotificationChannel = "inApp" | "sms" | "email";

/** 通知配置 */
export interface NotificationConfig {
  channels: NotificationChannel[];
  content: string;
  recipientEnrollmentIds: string[];
}

export interface PublishResultDialogProps {
  visible: boolean;
  groups: MatchGroupStats[];
  participantCount: number;
  /** 参与者预览列表 */
  participants?: ParticipantPreview[];
  onConfirm: (
    sendNotification: boolean,
    notificationConfig?: NotificationConfig,
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// 默认通知内容
const DEFAULT_NOTIFICATION_CONTENT =
  "您好！活动匹配结果已出炉，快来查看您的分组信息吧。期待与您的小伙伴们相遇！";

/**
 * 发布匹配结果对话框
 */
export const PublishResultDialog: React.FC<PublishResultDialogProps> = ({
  visible,
  groups,
  participantCount,
  participants = [],
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [customContent, setCustomContent] = useState(
    DEFAULT_NOTIFICATION_CONTENT,
  );
  const [showContentEditor, setShowContentEditor] = useState(false);
  // 人员预览展开状态
  const [showParticipantPreview, setShowParticipantPreview] = useState(false);
  const selectableEnrollmentIds = useMemo(
    () => participants.flatMap((participant) =>
      participant.enrollmentId ? [participant.enrollmentId] : [],
    ),
    [participants],
  );
  const participantSelectionKey = selectableEnrollmentIds.join("|");
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (!visible) return;
    setSelectedEnrollmentIds(
      new Set(participantSelectionKey ? participantSelectionKey.split("|") : []),
    );
    setCustomContent(DEFAULT_NOTIFICATION_CONTENT);
    setShowContentEditor(false);
    setShowParticipantPreview(false);
  }, [visible, participantSelectionKey]);

  // 当前匹配模型是 per-user topN：每个参与者一条记录，
  // members 的首位是本人，其余为推荐对象。
  const stats = useMemo(() => {
    const warningCount = groups.filter(
      (g) => g.warnings && g.warnings.length > 0,
    ).length;
    const topK = groups.reduce(
      (maxCount, group) =>
        Math.max(maxCount, Math.max(group.members.length - 1, 0)),
      0,
    );

    return {
      warningCount,
      topK,
    };
  }, [groups]);

  const handleConfirm = () => {
    const recipientEnrollmentIds = Array.from(selectedEnrollmentIds);
    if (recipientEnrollmentIds.length > 0) {
      onConfirm(true, {
        channels: ["inApp"],
        content: customContent,
        recipientEnrollmentIds,
      });
    } else {
      onConfirm(false);
    }
  };

  const allSelected =
    selectableEnrollmentIds.length > 0 &&
    selectedEnrollmentIds.size === selectableEnrollmentIds.length;
  const toggleAllParticipants = () => {
    setSelectedEnrollmentIds(
      allSelected ? new Set() : new Set(selectableEnrollmentIds),
    );
  };
  const toggleParticipant = (enrollmentId: string) => {
    setSelectedEnrollmentIds((current) => {
      const next = new Set(current);
      if (next.has(enrollmentId)) next.delete(enrollmentId);
      else next.add(enrollmentId);
      return next;
    });
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <Send size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                发布匹配结果
              </h3>
              <p className="text-sm text-gray-500">
                发布后参与者可查看分组信息
              </p>
            </div>
          </div>
        </div>

        {/* 内容区 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 匹配概览 */}
          <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={18} className="text-primary-600" />
              <span className="text-sm font-semibold text-primary-800">
                匹配概览
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-2xl font-bold text-primary-600">
                  {participantCount}
                </p>
                <p className="text-xs text-gray-500">参与者人数</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  Top {stats.topK}
                </p>
                <p className="text-xs text-gray-500">最多推荐候选</p>
              </div>
            </div>
          </div>

          {/* 警告提示 */}
          {stats.warningCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
              <AlertTriangle
                size={16}
                className="text-orange-500 mt-0.5 flex-shrink-0"
              />
              <p className="text-sm text-orange-700">
                有 {stats.warningCount} 个分组存在警告，建议检查后再发布
              </p>
            </div>
          )}

          {/* 通知设置 */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-primary-500" />
                <span className="text-sm font-semibold text-gray-800">
                  通知人员
                </span>
                <span className="text-xs text-gray-500">
                  已选 {selectedEnrollmentIds.size}/{selectableEnrollmentIds.length}
                </span>
              </div>
              {selectableEnrollmentIds.length > 0 ? (
                <button
                  type="button"
                  onClick={toggleAllParticipants}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  {allSelected ? "取消全选" : "全选"}
                </button>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 p-3">
                <div>
                  <p className="text-sm font-medium text-primary-700">
                    站内通知
                  </p>
                  <p className="text-xs text-gray-500">
                    只通知下方勾选的参与者
                  </p>
                </div>
                <span className="text-xs font-medium text-primary-600">
                  {selectedEnrollmentIds.size} 人
                </span>
              </div>

              {selectedEnrollmentIds.size > 0 ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowContentEditor(!showContentEditor)}
                    className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <MessageSquare size={14} />
                    <span>{showContentEditor ? "收起" : "自定义通知内容"}</span>
                  </button>

                  {showContentEditor && (
                    <textarea
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      placeholder="输入通知内容..."
                      rows={3}
                      maxLength={200}
                      className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
                    />
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  未选择通知人员，本次将仅发布结果。
                </p>
              )}

              {participants.length > 0 ? (
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setShowParticipantPreview(!showParticipantPreview)
                    }
                    className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Users size={14} />
                    <span>
                      {showParticipantPreview ? "收起人员" : "查看并选择人员"}
                    </span>
                    {showParticipantPreview ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>

                  {showParticipantPreview ? (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                      {participants.map((participant, index) => {
                        const enrollmentId = participant.enrollmentId;
                        const selected = Boolean(
                          enrollmentId && selectedEnrollmentIds.has(enrollmentId),
                        );
                        return (
                          <button
                            key={participant.id}
                            type="button"
                            role="checkbox"
                            aria-checked={selected}
                            aria-label={`${selected ? "取消选择" : "选择"}${participant.name}`}
                            disabled={!enrollmentId}
                            onClick={() =>
                              enrollmentId && toggleParticipant(enrollmentId)
                            }
                            className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${
                              index !== participants.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            }`}
                          >
                            {participant.avatar ? (
                              <img
                                src={participant.avatar}
                                alt=""
                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600">
                                {participant.name.slice(0, 1)}
                              </span>
                            )}
                            <span className="min-w-0 flex-1 truncate font-medium text-gray-800">
                              {participant.name}
                            </span>
                            {selected ? (
                              <CheckCircle
                                size={18}
                                className="shrink-0 text-primary-500"
                              />
                            ) : (
                              <span className="h-[18px] w-[18px] shrink-0 rounded-full border border-gray-300" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* 发布说明 */}
          <div className="p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700 leading-relaxed">
              📌 发布后：
              <br />
              • 分组结果将对所有参与者可见
              <br />
              • 仅勾选的参与者会收到站内通知
              <br />• 发布后仍可调整分组，但需重新发布
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="large"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            size="large"
            onClick={handleConfirm}
            disabled={isLoading || participantCount === 0}
            className="flex-1"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Send size={18} className="animate-pulse" />
                发布中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send size={18} />
                {selectedEnrollmentIds.size > 0
                  ? `发布并通知 ${selectedEnrollmentIds.size} 人`
                  : "仅发布结果"}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 发布结果反馈弹窗
 * 显示发布成功或失败的结果
 */
export interface PublishResultFeedbackProps {
  visible: boolean;
  success: boolean;
  /** 成功时的统计 */
  stats?: {
    /** 参与者人数（= 收到推荐的独立用户数） */
    participantCount: number;
    /** 已发送通知的人数 */
    notifiedCount?: number;
    channels?: NotificationChannel[];
  };
  /** 失败时的错误信息 */
  errorMessage?: string;
  onClose: () => void;
}

export const PublishResultFeedback: React.FC<PublishResultFeedbackProps> = ({
  visible,
  success,
  stats,
  errorMessage,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 text-center">
          {success ? (
            <>
              {/* 成功图标 */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                发布成功！
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                匹配结果已成功发布，参与者现在可以查看分组信息
              </p>

              {/* 发布统计 */}
              {stats && (
                <div className="p-4 bg-gray-50 rounded-xl mb-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary-600">
                        {stats.participantCount}
                      </p>
                      <p className="text-xs text-gray-500">参与者人数</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.notifiedCount ?? stats.participantCount}
                      </p>
                      <p className="text-xs text-gray-500">已通知人数</p>
                    </div>
                  </div>

                  {stats.notifiedCount !== undefined &&
                    stats.notifiedCount > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                          <Bell size={14} />
                          <span>
                            已向 {stats.notifiedCount} 人发送通知
                            {stats.channels && stats.channels.length > 0 && (
                              <span className="text-gray-500 ml-1">
                                ({stats.channels.includes("inApp") && "站内"}
                                {stats.channels.includes("sms") &&
                                  (stats.channels.includes("inApp")
                                    ? "、短信"
                                    : "短信")}
                                {stats.channels.includes("email") &&
                                  (stats.channels.length > 1
                                    ? "、邮件"
                                    : "邮件")}
                                )
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              )}

              <Button size="large" onClick={onClose} className="w-full">
                完成
              </Button>
            </>
          ) : (
            <>
              {/* 失败图标 */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <XCircle size={32} className="text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">发布失败</h3>

              <p className="text-sm text-gray-500 mb-4">
                {errorMessage || "发布匹配结果时发生错误，请稍后重试"}
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="large"
                  onClick={onClose}
                  className="flex-1"
                >
                  关闭
                </Button>
                <Button size="large" onClick={onClose} className="flex-1">
                  重试
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishResultDialog;
