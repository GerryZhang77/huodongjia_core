import { FC } from "react";
import { clsx } from "clsx";
import { UserPlus, UserCheck } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { useFollowRelation } from "../hooks/useFollowRelation";
import { useToggleFollow } from "../hooks/useToggleFollow";
import { useAuthStore } from "@/features/auth/stores/authStore";

interface FollowButtonProps {
  userId: string;
  /** 紧凑样式（hover 卡片中使用） */
  compact?: boolean;
  /** 自定义 className */
  className?: string;
}

/**
 * 关注/已关注/互相关注 按钮
 * - 未登录：点击提示登录
 * - 自己：不渲染
 * - 互关：显示"互相关注"
 * - 已关注：显示"已关注"，hover 提示"取消关注"
 * - 未关注：显示"+ 关注"
 */
export const FollowButton: FC<FollowButtonProps> = ({
  userId,
  compact = false,
  className,
}) => {
  const { user: currentUser } = useAuthStore();
  const isSelf = currentUser?.id === userId;

  const { data: relation, isLoading: relationLoading } = useFollowRelation(
    isSelf ? undefined : userId,
  );
  const toggle = useToggleFollow();

  if (isSelf) return null;

  const isFollowing = !!relation?.isFollowing;
  const isFriend = !!relation?.isFriend;
  const loading = relationLoading || toggle.isPending;

  const label = isFriend ? "互相关注" : isFollowing ? "已关注" : "+ 关注";

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      Toast.show({ icon: "fail", content: "请先登录" });
      return;
    }

    try {
      await toggle.mutateAsync({ userId, currentlyFollowing: isFollowing });
      Toast.show({
        icon: "success",
        content: isFollowing ? "已取消关注" : "关注成功",
      });
    } catch (err) {
      Toast.show({
        icon: "fail",
        content: err instanceof Error ? err.message : "操作失败",
      });
    }
  };

  // 样式：未关注 = 主色填充；已关注/互关 = 描边
  const baseStyle = compact
    ? "px-3 py-1 text-xs"
    : "px-4 py-1.5 text-sm";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={clsx(
        baseStyle,
        "inline-flex items-center justify-center gap-1 rounded-full font-medium transition-colors",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        isFollowing
          ? "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          : "bg-primary-500 text-white hover:bg-primary-600",
        className,
      )}
    >
      {isFollowing ? <UserCheck size={compact ? 12 : 14} /> : <UserPlus size={compact ? 12 : 14} />}
      <span>{label}</span>
    </button>
  );
};

export default FollowButton;
