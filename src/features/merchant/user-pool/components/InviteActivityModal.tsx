/**
 * InviteActivityModal - 邀请参加活动弹窗
 *
 * 从"发现用户"模块邀请平台用户参加商家的活动：
 * 1. 显示目标用户简要信息
 * 2. 选择要邀请的活动
 * 3. 自定义邀请消息
 * 4. 确认发送邀请
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
  Calendar,
  MapPin,
  Users,
  Check,
  Sparkles,
} from "lucide-react";
import type { PlatformUser } from "@/features/merchant/user-pool/types";

// ========================================
// 类型定义
// ========================================

export interface InviteActivityOption {
  id: string;
  title: string;
  startTime: string;
  location: string;
  participantCount: number;
  maxParticipants: number;
  status: string;
}

export interface InviteActivityModalProps {
  visible: boolean;
  user: PlatformUser | null;
  activities: InviteActivityOption[];
  onConfirm: (params: {
    userId: string;
    activityId: string;
    message: string;
  }) => void;
  onClose: () => void;
}

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

const InviteActivityModal: React.FC<InviteActivityModalProps> = ({
  visible,
  user,
  activities,
  onConfirm,
  onClose,
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // 过滤可用活动
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

  // 选中的活动
  const selectedActivity = useMemo(
    () => activities.find((a) => a.id === selectedActivityId) || null,
    [activities, selectedActivityId],
  );

  // 确认邀请
  const handleConfirm = () => {
    if (!user) return;
    if (!selectedActivityId) {
      Toast.show({ content: "请选择要邀请参加的活动", position: "bottom" });
      return;
    }

    onConfirm({
      userId: user.id,
      activityId: selectedActivityId,
      message:
        message.trim() ||
        `${user.nickname}，诚邀您参加「${selectedActivity?.title}」活动`,
    });
    handleClose();
  };

  // 关闭并重置
  const handleClose = () => {
    setSelectedActivityId(null);
    setMessage("");
    setSearchKeyword("");
    onClose();
  };

  if (!user) return null;

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
          <h3 className="text-lg font-semibold text-gray-900">邀请参加活动</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            向发现的用户发送活动邀请
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
        {/* 目标用户信息 */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                {user.nickname.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user.nickname}
            </div>
            <div className="text-xs text-gray-500">
              {[user.city, user.industry, user.occupation]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
            <div className="flex flex-shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap rounded-full bg-primary-50 px-2 py-1 text-xs font-medium tabular-nums text-primary-600">
            <Sparkles size={10} />
            {user.matchScore}分
          </div>
        </div>

        {/* 选择活动 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            选择邀请活动
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
                const isFull =
                  activity.participantCount >= activity.maxParticipants;

                return (
                  <button
                    key={activity.id}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isFull
                        ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                        : isSelected
                          ? "border-primary-400 bg-primary-50 ring-1 ring-primary-200"
                          : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                    onClick={() =>
                      !isFull && setSelectedActivityId(activity.id)
                    }
                    disabled={isFull}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </span>
                          {isFull && (
                  <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-red-50 px-1.5 py-0.5 text-xs tabular-nums text-red-500">
                              已满
                            </span>
                          )}
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
                        <div className="w-5 h-5 rounded-full bg-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                {searchKeyword ? "没有匹配的活动" : "暂无可邀请的活动"}
              </p>
            )}
          </div>
        </div>

        {/* 邀请消息 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            邀请消息 <span className="text-gray-400 font-normal">(可选)</span>
          </h4>
          <textarea
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 transition-all resize-none"
            rows={3}
            placeholder={
              selectedActivity
                ? `${user.nickname}，诚邀您参加「${selectedActivity.title}」活动`
                : "输入邀请消息..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {message.length}/200
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
          发送邀请
        </button>
      </div>
    </Popup>
  );
};

export default InviteActivityModal;
