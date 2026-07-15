/**
 * PushActivityModal - 推送活动弹窗
 *
 * 支持：
 * 1. 选择要推送的活动
 * 2. 自定义推送消息
 * 3. 选择推送渠道
 * 4. 预览推送信息
 */

import React, { useState, useMemo } from "react";
import {
  Popup,
} from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import {
  X,
  Send,
  Search,
  MessageCircle,
  Bell,
  Smartphone,
  Calendar,
  MapPin,
  Users,
  Check,
} from "lucide-react";
import type { PushChannel } from "@/features/merchant/user-pool/types";

// ========================================
// 类型定义
// ========================================

export interface PushActivityOption {
  id: string;
  title: string;
  startTime: string;
  location: string;
  participantCount: number;
  maxParticipants: number;
  status: string;
}

export interface PushActivityModalProps {
  /** 是否显示 */
  visible: boolean;
  /** 选中的用户数量 */
  selectedCount: number;
  /** 可推送的活动列表 */
  activities: PushActivityOption[];
  /** 确认回调 */
  onConfirm: (params: {
    activityId: string;
    message: string;
    channels: PushChannel[];
  }) => void;
  /** 关闭回调 */
  onClose: () => void;
}

// ========================================
// 渠道选项配置
// ========================================

interface ChannelOption {
  key: PushChannel;
  label: string;
  icon: React.ElementType;
  description: string;
}

const CHANNEL_OPTIONS: ChannelOption[] = [
  {
    key: "in_app",
    label: "站内通知",
    icon: Bell,
    description: "应用内消息推送",
  },
  {
    key: "sms",
    label: "短信通知",
    icon: Smartphone,
    description: "发送短信到手机",
  },
  {
    key: "wechat",
    label: "微信推送",
    icon: MessageCircle,
    description: "微信模板消息",
  },
];

// ========================================
// 辅助函数
// ========================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// ========================================
// 主组件
// ========================================

const PushActivityModal: React.FC<PushActivityModalProps> = ({
  visible,
  selectedCount,
  activities,
  onConfirm,
  onClose,
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<Set<PushChannel>>(
    new Set(["in_app"]),
  );
  const [searchKeyword, setSearchKeyword] = useState("");

  // 过滤可用活动（只显示进行中/报名中的活动）
  const availableActivities = useMemo(() => {
    let list = activities.filter(
      (a) =>
        a.status === "published" ||
        a.status === "registration" ||
        a.status === "ongoing" ||
        a.status === "recruiting",
    );
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(kw));
    }
    return list;
  }, [activities, searchKeyword]);

  // 选中的活动信息
  const selectedActivity = useMemo(
    () => activities.find((a) => a.id === selectedActivityId) || null,
    [activities, selectedActivityId],
  );

  // 切换渠道
  const toggleChannel = (channel: PushChannel) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(channel)) {
        // 至少保留一个渠道
        if (next.size > 1) {
          next.delete(channel);
        }
      } else {
        next.add(channel);
      }
      return next;
    });
  };

  // 确认推送
  const handleConfirm = () => {
    if (!selectedActivityId) {
      Toast.show({ content: "请选择要推送的活动", position: "bottom" });
      return;
    }
    onConfirm({
      activityId: selectedActivityId,
      message: message.trim() || `邀请您参加「${selectedActivity?.title}」`,
      channels: Array.from(selectedChannels),
    });
    handleClose();
  };

  // 关闭并重置
  const handleClose = () => {
    setSelectedActivityId(null);
    setMessage("");
    setSelectedChannels(new Set(["in_app"]));
    setSearchKeyword("");
    onClose();
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={handleClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        maxHeight: "85vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">推送活动</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            向 {selectedCount} 位用户推送活动邀请
          </p>
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={handleClose}
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* 选择活动 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            选择推送活动
          </h4>

          {/* 搜索 */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl mb-3">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="搜索活动..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          {/* 活动列表 */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableActivities.length > 0 ? (
              availableActivities.map((activity) => {
                const isSelected = selectedActivityId === activity.id;
                return (
                  <button
                    key={activity.id}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "border-primary-400 bg-primary-50 ring-1 ring-primary-200"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                    onClick={() => setSelectedActivityId(activity.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(activity.startTime)}
                          </span>
                          {activity.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {activity.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {activity.participantCount}/
                            {activity.maxParticipants}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary-400 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                {searchKeyword ? "没有匹配的活动" : "暂无可推送的活动"}
              </p>
            )}
          </div>
        </div>

        {/* 推送消息 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            推送消息 <span className="text-gray-400 font-normal">(可选)</span>
          </h4>
          <textarea
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 transition-all resize-none"
            rows={3}
            placeholder={
              selectedActivity
                ? `邀请您参加「${selectedActivity.title}」`
                : "输入自定义推送消息..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {message.length}/200
          </div>
        </div>

        {/* 推送渠道 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">推送渠道</h4>
          <div className="space-y-2">
            {CHANNEL_OPTIONS.map(({ key, label, icon: Icon, description }) => {
              const isSelected = selectedChannels.has(key);
              return (
                <button
                  key={key}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary-400 bg-primary-50"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                  onClick={() => toggleChannel(key)}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary-100" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={
                        isSelected ? "text-primary-500" : "text-gray-500"
                      }
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {label}
                    </div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-primary-400 border-primary-400"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
        <button
          className="flex-1 py-3 rounded-[22px] border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
          onClick={handleClose}
        >
          取消
        </button>
        <button
          className={`flex flex-1 flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-[22px] py-3 text-sm font-medium transition-all [&>svg]:shrink-0 ${
            selectedActivityId
              ? "bg-gradient-to-br from-primary-400 to-primary-500 text-white shadow-sm hover:shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          onClick={handleConfirm}
          disabled={!selectedActivityId}
        >
          <Send size={16} />
          确认推送
        </button>
      </div>
    </Popup>
  );
};

export default PushActivityModal;
