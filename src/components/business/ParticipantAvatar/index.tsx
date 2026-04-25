/**
 * ParticipantAvatar - 参与者头像组件
 *
 * 触发器：头像 + 可选名字 + 可选状态标签（保持原视觉）
 * 悬浮卡片：复用 UserHoverCard，hover 时自动拉取 publicProfile 补齐资料，
 *           展示完整信息 + 关注 / 私信 / 查看主页 操作
 */

import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserHoverCard } from "../UserHoverCard";
import type { UserBrief } from "../UserHoverCard";
import { FollowButton, MessageButton } from "@/features/social";
import { getPublicProfile } from "@/services/userApi";

// 参与者信息接口
export interface ParticipantInfo {
  user_id: string;
  name: string;
  avatar?: string | null;
  gender?: "male" | "female" | "other";
  age?: number;
  occupation?: string;
  company?: string;
  city?: string;
  bio?: string;
  interests?: string[];
  status?: "confirmed" | "waitlist" | "cancelled" | "pending";
  registration_time?: string;
}

interface ParticipantAvatarProps {
  participant: ParticipantInfo;
  size?: "small" | "medium" | "large";
  showName?: boolean;
  showStatus?: boolean;
  className?: string;
}

// 状态配置
const statusConfig = {
  confirmed: { label: "已确认", color: "bg-success-50 text-success-600" },
  waitlist: { label: "候补", color: "bg-warning-50 text-warning-600" },
  cancelled: { label: "已取消", color: "bg-gray-100 text-gray-500" },
  pending: { label: "待审核", color: "bg-primary-50 text-primary-600" },
};

const sizeConfig = {
  small: { avatar: "w-8 h-8", text: "text-xs", initial: "text-sm" },
  medium: { avatar: "w-10 h-10", text: "text-sm", initial: "text-base" },
  large: { avatar: "w-12 h-12", text: "text-base", initial: "text-lg" },
};

const getGenderBgColor = (gender?: string) => {
  switch (gender) {
    case "male":
      return "bg-primary-400";
    case "female":
      return "bg-pink-400";
    default:
      return "bg-gray-400";
  }
};

const getInitial = (name: string) => name?.charAt(0) || "?";

export const ParticipantAvatar: FC<ParticipantAvatarProps> = ({
  participant,
  size = "medium",
  showName = false,
  showStatus = false,
  className = "",
}) => {
  const sizeStyle = sizeConfig[size];
  const statusStyle = participant.status
    ? statusConfig[participant.status]
    : null;

  // 拉取远端 publicProfile 用于补齐资料卡片字段
  // staleTime 5min；按 user_id 全局共享一次请求
  const { data } = useQuery({
    queryKey: ["publicProfile", participant.user_id],
    queryFn: () => getPublicProfile(participant.user_id),
    enabled: !!participant.user_id,
    staleTime: 5 * 60 * 1000,
  });
  const remote = data?.profile;

  // 合并：本地报名数据优先（即时显示），远端用作兜底/补齐
  const enrichedUser: UserBrief = {
    id: participant.user_id,
    name: participant.name || remote?.name || "未命名用户",
    avatar: participant.avatar || remote?.avatar || undefined,
    gender:
      (participant.gender ||
        (remote?.gender as UserBrief["gender"])) ?? undefined,
    age: participant.age ?? (remote?.age ?? undefined),
    occupation: participant.occupation || remote?.occupation || undefined,
    company: participant.company || remote?.company || undefined,
    industry: remote?.industry || undefined,
    city: participant.city || remote?.city || undefined,
    bio: participant.bio || remote?.bio || undefined,
    tags:
      participant.interests && participant.interests.length > 0
        ? participant.interests
        : remote?.tags || [],
    role: statusStyle?.label,
  };

  // 触发器：头像 + 可选名字/状态（保持原视觉）
  const trigger = (
    <div
      className={`relative inline-flex items-center gap-2 ${className}`}
    >
      <div
        className={`${sizeStyle.avatar} rounded-full overflow-hidden flex-shrink-0 cursor-pointer transition-transform hover:scale-105`}
      >
        {participant.avatar ? (
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full ${getGenderBgColor(participant.gender)} flex items-center justify-center text-white font-semibold ${sizeStyle.initial}`}
          >
            {getInitial(participant.name)}
          </div>
        )}
      </div>

      {(showName || showStatus) && (
        <div className="flex flex-col">
          {showName && (
            <span
              className={`font-medium text-gray-900 ${sizeStyle.text} line-clamp-1`}
            >
              {participant.name}
            </span>
          )}
          {showStatus && statusStyle && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium w-fit ${statusStyle.color}`}
            >
              {statusStyle.label}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <UserHoverCard
      user={enrichedUser}
      actionsSlot={
        <>
          <FollowButton
            userId={participant.user_id}
            compact
            className="flex-1"
          />
          <MessageButton
            userId={participant.user_id}
            compact
            className="flex-1"
          />
        </>
      }
    >
      {trigger}
    </UserHoverCard>
  );
};

export default ParticipantAvatar;
