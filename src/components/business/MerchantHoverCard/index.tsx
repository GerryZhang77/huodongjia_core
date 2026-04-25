/**
 * MerchantHoverCard - 商家悬浮卡片
 *
 * 用于活动详情页商家头像/名称区域：
 * - hover 显示商家信息卡（含 关注 按钮）
 * - 点击跳转到商家公开主页
 *
 * 内部基于 UserHoverCard 组合，自动按 userId 拉取公开资料。
 */

import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UserHoverCard } from "@/components/business/UserHoverCard";
import { FollowButton } from "@/features/social";
import { getPublicProfile } from "@/services/userApi";
import type { UserBrief } from "@/components/business/UserHoverCard";

interface MerchantHoverCardProps {
  /** 商家用户 id */
  merchantId: string;
  /** 兜底名称（资料尚未加载时显示） */
  fallbackName?: string;
  /** 兜底头像 */
  fallbackAvatar?: string | null;
  /** 是否禁用 hover */
  disabled?: boolean;
  /** 卡片位置 */
  placement?: "top" | "bottom" | "left" | "right";
  /** 触发器（通常是头像/名称区域） */
  children: React.ReactNode;
  /** 额外类名 */
  className?: string;
}

export const MerchantHoverCard: FC<MerchantHoverCardProps> = ({
  merchantId,
  fallbackName,
  fallbackAvatar,
  disabled,
  placement = "bottom",
  children,
  className,
}) => {
  const navigate = useNavigate();

  // 资料按 merchantId 缓存；多个相同 id 的实例会共享一次请求
  const { data } = useQuery({
    queryKey: ["publicProfile", merchantId],
    queryFn: () => getPublicProfile(merchantId),
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000,
  });

  const profile = data?.profile;
  const userBrief: UserBrief = {
    id: merchantId,
    name: profile?.name || fallbackName || "主办方",
    avatar: profile?.avatar || fallbackAvatar || undefined,
    bio: profile?.bio || undefined,
    occupation: profile?.occupation || undefined,
    company: profile?.company || undefined,
    industry: profile?.industry || undefined,
    city: profile?.city || undefined,
    tags: profile?.tags || [],
    role: "主办方",
  };

  return (
    <UserHoverCard
      user={userBrief}
      placement={placement}
      disabled={disabled}
      className={className}
      onViewProfile={(id) => navigate(`/u/profile/${id}`)}
      actionsSlot={
        <FollowButton userId={merchantId} compact className="flex-1" />
      }
    >
      {children}
    </UserHoverCard>
  );
};

export default MerchantHoverCard;
