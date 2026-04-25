import { FC, useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { clsx } from "clsx";

interface MessageInputProps {
  /** 是否禁用（如发送中） */
  disabled?: boolean;
  /** 发送回调 */
  onSend: (content: string) => void | Promise<void>;
  /** 左侧扩展槽（如"+"按钮触发交换联系方式） */
  leadingSlot?: React.ReactNode;
  className?: string;
}

export const MessageInput: FC<MessageInputProps> = ({
  disabled,
  onSend,
  leadingSlot,
  className,
}) => {
  const [value, setValue] = useState("");

  const canSend = !disabled && value.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) return;
    const text = value.trim();
    setValue("");
    try {
      await onSend(text);
    } catch {
      // 发送失败时把内容恢复回输入框，方便用户重发
      setValue(text);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={clsx(
        "flex items-end gap-2 px-3 py-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700",
        className,
      )}
    >
      {leadingSlot}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="输入消息..."
        className="flex-1 resize-none rounded-2xl bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 px-3 py-2 max-h-32 focus:outline-none focus:ring-1 focus:ring-primary-400"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className={clsx(
          "w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
          canSend
            ? "bg-primary-500 hover:bg-primary-600 text-white"
            : "bg-gray-200 dark:bg-gray-600 text-gray-400",
        )}
      >
        <Send size={16} />
      </button>
    </div>
  );
};

export default MessageInput;
