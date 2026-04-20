/**
 * ParticipantAvatar - 参与者头像组件
 * 支持悬停显示用户简介卡片
 * 可复用于商家端和用户端
 */

import { FC, useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { User, Briefcase, MapPin, Tag } from "lucide-react";

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
  confirmed: {
    label: "已确认",
    color: "bg-success-50 text-success-600",
  },
  waitlist: {
    label: "候补",
    color: "bg-warning-50 text-warning-600",
  },
  cancelled: {
    label: "已取消",
    color: "bg-gray-100 text-gray-500",
  },
  pending: {
    label: "待审核",
    color: "bg-primary-50 text-primary-600",
  },
};

// 尺寸配置
const sizeConfig = {
  small: {
    avatar: "w-8 h-8",
    text: "text-xs",
    initial: "text-sm",
  },
  medium: {
    avatar: "w-10 h-10",
    text: "text-sm",
    initial: "text-base",
  },
  large: {
    avatar: "w-12 h-12",
    text: "text-base",
    initial: "text-lg",
  },
};

export const ParticipantAvatar: FC<ParticipantAvatarProps> = ({
  participant,
  size = "medium",
  showName = false,
  showStatus = false,
  className = "",
}) => {
  const [showCard, setShowCard] = useState(false);
  const [cardPos, setCardPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sizeStyle = sizeConfig[size];
  const statusStyle = participant.status
    ? statusConfig[participant.status]
    : null;

  // 计算卡片 Portal 位置
  const calculatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cardWidth = 256;
    const cardHeight = 240;
    const offset = 8;

    let top = rect.bottom + offset;
    let left = rect.left + rect.width / 2 - cardWidth / 2;

    // 下方空间不足则显示在上方
    if (window.innerHeight - rect.bottom < cardHeight + offset && rect.top > cardHeight + offset) {
      top = rect.top - cardHeight - offset;
    }
    // 水平边界
    if (left < 8) left = 8;
    if (left + cardWidth > window.innerWidth - 8) left = window.innerWidth - cardWidth - 8;
    if (top < 8) top = 8;

    setCardPos({ top, left });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    showTimeoutRef.current = setTimeout(() => {
      calculatePosition();
      setShowCard(true);
    }, 200);
  }, [calculatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowCard(false);
    }, 150);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // 滚动时隐藏
  useEffect(() => {
    if (!showCard) return;
    const handleScroll = () => setShowCard(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [showCard]);

  // 获取名字首字母
  const getInitial = (name: string) => {
    return name?.charAt(0) || "?";
  };

  // 获取性别背景色
  const getGenderBgColor = () => {
    switch (participant.gender) {
      case "male":
        return "bg-primary-400";
      case "female":
        return "bg-pink-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center gap-2 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 头像 */}
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
            className={`w-full h-full ${getGenderBgColor()} flex items-center justify-center text-white font-semibold ${sizeStyle.initial}`}
          >
            {getInitial(participant.name)}
          </div>
        )}
      </div>

      {/* 名字和状态 */}
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

      {/* 悬停卡片 - Portal 渲染到 body，避免被 overflow 裁剪 */}
      {showCard &&
        createPortal(
          <div
            ref={cardRef}
            className="fixed z-[1070] w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in"
            style={{ top: cardPos.top, left: cardPos.left }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* 卡片头部 */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                  {participant.avatar ? (
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full ${getGenderBgColor()} flex items-center justify-center text-white font-bold text-xl`}
                    >
                      {getInitial(participant.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {participant.name}
                    </h4>
                    {statusStyle && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusStyle.color}`}
                      >
                        {statusStyle.label}
                      </span>
                    )}
                  </div>
                  {participant.occupation && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {participant.occupation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 卡片内容 */}
            <div className="p-3 space-y-2.5">
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                {participant.company && (
                  <div className="flex items-center gap-1">
                    <Briefcase size={12} className="text-gray-400" />
                    <span className="truncate max-w-[100px]">
                      {participant.company}
                    </span>
                  </div>
                )}
                {participant.city && (
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" />
                    <span>{participant.city}</span>
                  </div>
                )}
                {participant.age && (
                  <div className="flex items-center gap-1">
                    <User size={12} className="text-gray-400" />
                    <span>{participant.age}岁</span>
                  </div>
                )}
              </div>

              {participant.bio && (
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {participant.bio}
                </p>
              )}

              {participant.interests && participant.interests.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <Tag size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {participant.interests.slice(0, 4).map((interest, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded"
                      >
                        {interest}
                      </span>
                    ))}
                    {participant.interests.length > 4 && (
                      <span className="text-[10px] text-gray-400">
                        +{participant.interests.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ParticipantAvatar;
