import { FC } from "react";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { Loader2, AlertCircle } from "lucide-react";
import type { ChatMessage } from "../services/messageApi";
import { ContactRequestCard } from "../../contact-exchange/components/ContactRequestCard";

interface MessageBubbleProps {
  message: ChatMessage;
  /** 是否是当前用户发出的 */
  isMine: boolean;
  /** 对方头像 URL */
  peerAvatar?: string | null;
  /** 对方姓名（用于头像 fallback 首字母） */
  peerName?: string | null;
  /** 自己的头像 URL */
  myAvatar?: string | null;
  /** 自己的姓名（用于头像 fallback 首字母） */
  myName?: string | null;
  /**
   * 是否显示头像。
   * 同一发送者连续消息只在第一条显示头像图，其余消息保留头像位置占位以保持对齐
   */
  showAvatar?: boolean;
  /** 失败时点击重试 */
  onRetry?: (msg: ChatMessage) => void;
  /** 失败时点击删除 */
  onDropFailed?: (msg: ChatMessage) => void;
}

const normalizeUtc = (s: string) =>
  s.includes("+") || s.endsWith("Z") ? s : s + "Z";

const formatTime = (t: string) => dayjs(normalizeUtc(t)).format("HH:mm");

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  /** 是否显示图（false 时仅占位，保持垂直对齐） */
  visible?: boolean;
}

const Avatar: FC<AvatarProps> = ({ src, name, visible = true }) => {
  // 不可见时仅占位（保持垂直对齐），不画背景色，避免出现"空白圆"
  if (!visible) {
    return <div className="w-8 h-8 flex-shrink-0" aria-hidden />;
  }
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-300">
          {(name && name.charAt(0)) || "?"}
        </span>
      )}
    </div>
  );
};

export const MessageBubble: FC<MessageBubbleProps> = ({
  message,
  isMine,
  peerAvatar,
  peerName,
  myAvatar,
  myName,
  showAvatar = true,
  onRetry,
  onDropFailed,
}) => {
  const isPending = message._clientState === "pending";
  const isFailed = message._clientState === "failed";
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

  // 联系方式交换卡片
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
          <Avatar src={peerAvatar} name={peerName} visible={showAvatar} />
        )}
        <ContactRequestCard message={message} isMine={isMine} />
        {isMine && (
          <Avatar src={myAvatar} name={myName} visible={showAvatar} />
        )}
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
        <Avatar src={peerAvatar} name={peerName} visible={showAvatar} />
      )}
      <div
        className={clsx(
          "flex flex-col max-w-[75%]",
          isMine ? "items-end" : "items-start",
        )}
      >
        <div className={clsx("flex items-end gap-1", isMine && "flex-row-reverse")}>
          <div
            className={clsx(
              "px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words transition-opacity",
              isMine
                ? "bg-primary-500 text-white rounded-br-sm"
                : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-600",
              isPending && "opacity-70",
            )}
          >
            {message.content}
          </div>
          {isMine && isPending && (
            <Loader2 size={12} className="text-gray-400 animate-spin" aria-label="发送中" />
          )}
          {isMine && isFailed && (
            <AlertCircle size={14} className="text-red-500" aria-label="发送失败" />
          )}
        </div>
        {isMine && isFailed ? (
          <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-red-500">
            <span>发送失败</span>
            {onRetry && (
              <button
                onClick={() => onRetry(message)}
                className="text-primary-500 hover:underline"
              >
                重试
              </button>
            )}
            {onDropFailed && (
              <button
                onClick={() => onDropFailed(message)}
                className="text-gray-400 hover:underline"
              >
                删除
              </button>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-gray-400 mt-0.5 px-1">
            {isPending ? "发送中..." : formatTime(message.created_at)}
          </span>
        )}
      </div>
      {isMine && (
        <Avatar src={myAvatar} name={myName} visible={showAvatar} />
      )}
    </div>
  );
};

export default MessageBubble;
