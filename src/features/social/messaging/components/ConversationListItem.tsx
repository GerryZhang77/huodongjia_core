import { FC } from "react";
import { clsx } from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import type { ConversationListItem as ConversationItem } from "../services/messageApi";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

const normalizeUtc = (s: string) =>
  s.includes("+") || s.endsWith("Z") ? s : s + "Z";

const formatLastTime = (t: string) => {
  const d = dayjs(normalizeUtc(t));
  const now = dayjs();
  if (now.diff(d, "day") === 0) return d.format("HH:mm");
  if (now.diff(d, "day") === 1) return "昨天";
  if (now.diff(d, "day") < 7) return d.format("dddd");
  return d.format("M月D日");
};

interface ConversationListItemProps {
  item: ConversationItem;
  onClick: (peerId: string) => void;
}

export const ConversationListItem: FC<ConversationListItemProps> = ({
  item,
  onClick,
}) => {
  const peer = item.peer;
  const name = peer?.name || "未知用户";
  const initial = (name && name.charAt(0)) || "?";
  const lastContent = item.lastMessage
    ? item.lastMessage.message_type === "contact_request"
      ? "[联系方式交换请求]"
      : item.lastMessage.message_type === "system"
        ? `[系统] ${item.lastMessage.content}`
        : item.lastMessage.content
    : "暂无消息";

  return (
    <button
      type="button"
      onClick={() => peer && onClick(peer.id)}
      className={clsx(
        "w-full flex items-center gap-3 px-4 py-3",
        "hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700/50",
        "transition-colors text-left",
      )}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex-shrink-0">
          {peer?.avatar ? (
            <img
              src={peer.avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-500 font-semibold">
              {initial}
            </div>
          )}
        </div>
        {item.unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center whitespace-nowrap rounded-full bg-red-500 px-1 text-[10px] font-medium tabular-nums text-white">
            {item.unreadCount > 99 ? "99+" : item.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {name}
          </p>
          {item.lastMessageAt && (
            <span className="text-[11px] text-gray-400 flex-shrink-0">
              {formatLastTime(item.lastMessageAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {lastContent}
        </p>
      </div>
    </button>
  );
};

export default ConversationListItem;
