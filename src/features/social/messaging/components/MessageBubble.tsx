import { FC } from "react";
import { clsx } from "clsx";
import dayjs from "dayjs";
import type { ChatMessage } from "../services/messageApi";

interface MessageBubbleProps {
  message: ChatMessage;
  /** 是否是当前用户发出的 */
  isMine: boolean;
  /** 对方头像（仅在对方消息且需要显示头像时） */
  peerAvatar?: string | null;
  /** 是否显示头像（同一发送者连续消息只在第一条显示） */
  showAvatar?: boolean;
}

const normalizeUtc = (s: string) =>
  s.includes("+") || s.endsWith("Z") ? s : s + "Z";

const formatTime = (t: string) => dayjs(normalizeUtc(t)).format("HH:mm");

export const MessageBubble: FC<MessageBubbleProps> = ({
  message,
  isMine,
  peerAvatar,
  showAvatar = true,
}) => {
  // 系统消息：居中
  if (message.message_type === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 dark:text-gray-500 px-3 py-1 bg-gray-100/60 dark:bg-gray-800/60 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  // 联系方式交换卡片：P4 中实现专门组件，这里先按特殊样式占位
  if (
    message.message_type === "contact_request" ||
    message.message_type === "contact_response"
  ) {
    return (
      <div
        className={clsx(
          "flex my-1.5 items-end gap-2",
          isMine ? "justify-end" : "justify-start",
        )}
      >
        {!isMine && (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex-shrink-0">
            {showAvatar && peerAvatar ? (
              <img src={peerAvatar} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
        )}
        <div
          className={clsx(
            "max-w-[75%] rounded-xl border px-3 py-2",
            "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50",
          )}
        >
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            联系方式交换
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
            {message.content}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            状态：{message.status === "pending" ? "等待对方处理" :
              message.status === "accepted" ? "已接受" :
              message.status === "rejected" ? "已拒绝" : message.status}
          </p>
        </div>
      </div>
    );
  }

  // 普通文本
  return (
    <div
      className={clsx(
        "flex my-1.5 items-end gap-2",
        isMine ? "justify-end" : "justify-start",
      )}
    >
      {!isMine && (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex-shrink-0">
          {showAvatar && peerAvatar ? (
            <img src={peerAvatar} alt="" className="w-full h-full object-cover" />
          ) : null}
        </div>
      )}
      <div className={clsx("flex flex-col max-w-[75%]", isMine ? "items-end" : "items-start")}>
        <div
          className={clsx(
            "px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words",
            isMine
              ? "bg-primary-500 text-white rounded-br-sm"
              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-600",
          )}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-gray-400 mt-0.5 px-1">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
