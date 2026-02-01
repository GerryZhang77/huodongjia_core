/**
 * PublishResultDialog - 发布匹配结果对话框
 * 支持发布结果并发送通知给参与者
 * 支持站内通知、短信、邮件多种通知渠道
 * 参考 SendNotificationDialog 组件设计
 */

import React, { useState, useMemo } from "react";
import {
  Send,
  Bell,
  BellOff,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Mail,
  Smartphone,
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
  score: number;
  isLocked: boolean;
  warnings?: string[];
}

/** 参与者信息用于预览 */
export interface ParticipantPreview {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  groupName?: string;
}

/** 通知渠道类型 */
export type NotificationChannel = "inApp" | "sms" | "email";

/** 通知配置 */
export interface NotificationConfig {
  channels: NotificationChannel[];
  content: string;
}

export interface PublishResultDialogProps {
  visible: boolean;
  groups: MatchGroupStats[];
  participantCount: number;
  /** 参与者预览列表 */
  participants?: ParticipantPreview[];
  matchingStats?: {
    avgScore: number;
    minScore: number;
    maxScore: number;
  };
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  participantCount,
  participants = [],
  matchingStats,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [sendNotification, setSendNotification] = useState(true);
  const [customContent, setCustomContent] = useState(
    DEFAULT_NOTIFICATION_CONTENT,
  );
  const [showContentEditor, setShowContentEditor] = useState(false);
  // 通知渠道选择
  const [selectedChannels, setSelectedChannels] = useState<
    NotificationChannel[]
  >(["inApp"]);
  // 人员预览展开状态
  const [showParticipantPreview, setShowParticipantPreview] = useState(false);

  // 计算统计数据
  const stats = useMemo(() => {
    const totalGroups = groups.length;
    const totalMembers = groups.reduce((sum, g) => sum + g.members.length, 0);
    const lockedCount = groups.filter((g) => g.isLocked).length;
    const warningCount = groups.filter(
      (g) => g.warnings && g.warnings.length > 0,
    ).length;

    // 计算组大小范围
    const groupSizes = groups.map((g) => g.members.length);
    const minGroupSize = groupSizes.length > 0 ? Math.min(...groupSizes) : 0;
    const maxGroupSize = groupSizes.length > 0 ? Math.max(...groupSizes) : 0;

    return {
      totalGroups,
      totalMembers,
      lockedCount,
      warningCount,
      minGroupSize,
      maxGroupSize,
      avgScore: matchingStats?.avgScore || 0,
      minScore: matchingStats?.minScore || 0,
      maxScore: matchingStats?.maxScore || 0,
    };
  }, [groups, matchingStats]);

  // 计算各渠道可通知人数
  const channelStats = useMemo(() => {
    const withPhone = participants.filter((p) => p.phone).length;
    const withEmail = participants.filter((p) => p.email).length;
    return {
      inApp: stats.totalMembers,
      sms: withPhone,
      email: withEmail,
    };
  }, [participants, stats.totalMembers]);

  // 切换通知渠道
  const toggleChannel = (channel: NotificationChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  };

  const handleConfirm = () => {
    if (sendNotification && selectedChannels.length > 0) {
      onConfirm(true, {
        channels: selectedChannels,
        content: customContent,
      });
    } else {
      onConfirm(false);
    }
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
                  {stats.totalGroups}
                </p>
                <p className="text-xs text-gray-500">分组数</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalMembers}
                </p>
                <p className="text-xs text-gray-500">已分组人数</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.avgScore.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">平均分数</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-lg font-bold text-gray-600">
                  {stats.minGroupSize}-{stats.maxGroupSize}
                </p>
                <p className="text-xs text-gray-500">组人数范围</p>
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
                {sendNotification ? (
                  <Bell size={18} className="text-primary-500" />
                ) : (
                  <BellOff size={18} className="text-gray-400" />
                )}
                <span className="text-sm font-semibold text-gray-800">
                  通知设置
                </span>
              </div>
              <button
                onClick={() => setSendNotification(!sendNotification)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  sendNotification ? "bg-primary-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    sendNotification ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            {sendNotification ? (
              <div className="space-y-3">
                {/* 通知渠道选择 */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-2">选择通知渠道：</p>

                  {/* 站内通知 */}
                  <button
                    onClick={() => toggleChannel("inApp")}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      selectedChannels.includes("inApp")
                        ? "bg-primary-50 border-primary-300"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Bell
                        size={16}
                        className={
                          selectedChannels.includes("inApp")
                            ? "text-primary-500"
                            : "text-gray-400"
                        }
                      />
                      <span
                        className={`text-sm ${selectedChannels.includes("inApp") ? "text-primary-700" : "text-gray-600"}`}
                      >
                        站内通知
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {channelStats.inApp} 人
                      </span>
                      {selectedChannels.includes("inApp") && (
                        <CheckCircle size={16} className="text-primary-500" />
                      )}
                    </div>
                  </button>

                  {/* 短信通知 */}
                  <button
                    onClick={() => toggleChannel("sms")}
                    disabled={channelStats.sms === 0}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      selectedChannels.includes("sms")
                        ? "bg-green-50 border-green-300"
                        : channelStats.sms === 0
                          ? "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
                          : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone
                        size={16}
                        className={
                          selectedChannels.includes("sms")
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      />
                      <span
                        className={`text-sm ${selectedChannels.includes("sms") ? "text-green-700" : "text-gray-600"}`}
                      >
                        短信通知
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {channelStats.sms} 人有手机号
                      </span>
                      {selectedChannels.includes("sms") && (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                    </div>
                  </button>

                  {/* 邮件通知 */}
                  <button
                    onClick={() => toggleChannel("email")}
                    disabled={channelStats.email === 0}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      selectedChannels.includes("email")
                        ? "bg-purple-50 border-purple-300"
                        : channelStats.email === 0
                          ? "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
                          : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Mail
                        size={16}
                        className={
                          selectedChannels.includes("email")
                            ? "text-purple-500"
                            : "text-gray-400"
                        }
                      />
                      <span
                        className={`text-sm ${selectedChannels.includes("email") ? "text-purple-700" : "text-gray-600"}`}
                      >
                        邮件通知
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {channelStats.email} 人有邮箱
                      </span>
                      {selectedChannels.includes("email") && (
                        <CheckCircle size={16} className="text-purple-500" />
                      )}
                    </div>
                  </button>
                </div>

                {/* 已选择渠道提示 */}
                {selectedChannels.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle size={14} />
                    <span>
                      将通过 {selectedChannels.length} 种渠道通知参与者
                    </span>
                  </div>
                )}

                {selectedChannels.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <AlertTriangle size={14} />
                    <span>请至少选择一种通知渠道</span>
                  </div>
                )}

                {/* 通知内容编辑 */}
                <div>
                  <button
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

                {/* 人员预览 */}
                {participants.length > 0 && (
                  <div>
                    <button
                      onClick={() =>
                        setShowParticipantPreview(!showParticipantPreview)
                      }
                      className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Users size={14} />
                      <span>
                        {showParticipantPreview ? "收起" : "查看通知人员"}
                      </span>
                      {showParticipantPreview ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>

                    {showParticipantPreview && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                        <div className="p-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50 sticky top-0">
                          共 {participants.length} 人将收到通知
                        </div>
                        {participants.map((p, idx) => (
                          <div
                            key={p.id}
                            className={`flex items-center justify-between px-3 py-2 text-sm ${
                              idx !== participants.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800">
                                {p.name}
                              </span>
                              {p.groupName && (
                                <span className="ml-2 text-xs text-gray-400">
                                  {p.groupName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              {p.phone && (
                                <span title={p.phone}>
                                  <Smartphone
                                    size={12}
                                    className="text-green-400"
                                  />
                                </span>
                              )}
                              {p.email && (
                                <span title={p.email}>
                                  <Mail size={12} className="text-purple-400" />
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                不发送通知，成员需主动查看分组结果
              </p>
            )}
          </div>

          {/* 发布说明 */}
          <div className="p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700 leading-relaxed">
              📌 发布后：
              <br />
              • 分组结果将对所有参与者可见
              <br />
              • 参与者可在活动详情中查看自己的分组
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
            disabled={
              isLoading ||
              stats.totalGroups === 0 ||
              (sendNotification && selectedChannels.length === 0)
            }
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
                确认发布
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
    groupCount: number;
    memberCount: number;
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
                        {stats.groupCount}
                      </p>
                      <p className="text-xs text-gray-500">分组数</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.memberCount}
                      </p>
                      <p className="text-xs text-gray-500">已分组人数</p>
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
