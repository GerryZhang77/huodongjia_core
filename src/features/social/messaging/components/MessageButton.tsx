import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { MessageCircle } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { useAuthStore } from "@/features/auth/stores/authStore";

interface MessageButtonProps {
  /** 对方用户 id */
  userId: string;
  /** 紧凑样式（hover 卡片中使用） */
  compact?: boolean;
  className?: string;
}

/**
 * "私信"按钮：跳转到与该用户的聊天页
 * - 自己：不渲染
 * - 未登录：提示登录
 */
export const MessageButton: FC<MessageButtonProps> = ({
  userId,
  compact = false,
  className,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const isSelf = currentUser?.id === userId;

  if (isSelf) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      Toast.show({ icon: "fail", content: "请先登录" });
      return;
    }
    navigate(`/u/messages/${userId}`);
  };

  const baseStyle = compact ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        baseStyle,
        "inline-flex items-center justify-center gap-1 rounded-full font-medium transition-colors",
        "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200",
        "border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700",
        className,
      )}
    >
      <MessageCircle size={compact ? 12 : 14} />
      <span>私信</span>
    </button>
  );
};

export default MessageButton;
