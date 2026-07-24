/**
 * UserHoverCard - 用户悬浮卡片组件
 *
 * 悬停在用户头像时显示用户简要信息卡片
 * 支持 PC 端悬停和移动端点击触发
 *
 * @example
 * ```tsx
 * <UserHoverCard
 *   user={userData}
 *   matchScore={85}
 *   onViewProfile={(id) => navigate(`/u/profile/${id}`)}
 * >
 *   <Avatar src={userData.avatar} />
 * </UserHoverCard>
 * ```
 */

import { FC, useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { useNavigate } from "react-router-dom";
import { UserCardContent } from "./UserCardContent";
import type { UserHoverCardProps } from "./types";

// 悬停延迟时间 (ms)
const HOVER_DELAY = 300;
const HIDE_DELAY = 150;

/**
 * UserHoverCard 组件
 */
export const UserHoverCard: FC<UserHoverCardProps> = ({
  user,
  matchScore,
  children,
  placement = "bottom",
  disabled = false,
  onViewProfile,
  actionsSlot,
  className,
  focusable = false,
  triggerAriaLabel,
  showProfileAction = true,
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 计算卡片位置
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const cardWidth = 256; // w-64 = 16rem = 256px
    const cardHeight = 200; // 估算高度
    const offset = 8;

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = triggerRect.top - cardHeight - offset;
        left = triggerRect.left + triggerRect.width / 2 - cardWidth / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + offset;
        left = triggerRect.left + triggerRect.width / 2 - cardWidth / 2;
        break;
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - cardHeight / 2;
        left = triggerRect.left - cardWidth - offset;
        break;
      case "right":
        top = triggerRect.top + triggerRect.height / 2 - cardHeight / 2;
        left = triggerRect.right + offset;
        break;
    }

    // 边界检测
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 水平边界
    if (left < 8) left = 8;
    if (left + cardWidth > viewportWidth - 8) {
      left = viewportWidth - cardWidth - 8;
    }

    // 垂直边界 - 如果下方放不下，放到上方
    if (top + cardHeight > viewportHeight - 8 && placement === "bottom") {
      top = triggerRect.top - cardHeight - offset;
    }
    if (top < 8) top = 8;

    setPosition({ top, left });
  }, [placement]);

  // 显示卡片
  const showCard = useCallback(() => {
    if (disabled) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    showTimeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, HOVER_DELAY);
  }, [disabled, calculatePosition]);

  // 隐藏卡片
  const hideCard = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, HIDE_DELAY);
  }, []);

  // 鼠标进入卡片时保持显示
  const handleCardMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // 查看详情
  const handleViewProfile = useCallback(() => {
    setIsVisible(false);
    if (onViewProfile) {
      onViewProfile(user.id);
    } else {
      navigate(`/u/profile/${user.id}`);
    }
  }, [user.id, onViewProfile, navigate]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // 监听滚动和 resize，更新位置或隐藏
  useEffect(() => {
    if (!isVisible) return;

    const handleScrollOrResize = () => {
      setIsVisible(false);
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isVisible]);

  // 移动端点击外部关闭
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        cardRef.current &&
        !cardRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible]);

  return (
    <>
      {/* 触发器 */}
      <div
        ref={triggerRef}
        className={clsx("inline-block cursor-pointer", className)}
        tabIndex={focusable && !disabled ? 0 : undefined}
        role={focusable ? "button" : undefined}
        aria-label={
          focusable ? triggerAriaLabel || `查看${user.name}的资料` : undefined
        }
        aria-haspopup={focusable ? "dialog" : undefined}
        aria-expanded={focusable ? isVisible : undefined}
        onMouseEnter={showCard}
        onMouseLeave={hideCard}
        onFocus={focusable ? showCard : undefined}
        onBlur={focusable ? hideCard : undefined}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (showTimeoutRef.current) {
              clearTimeout(showTimeoutRef.current);
              showTimeoutRef.current = null;
            }
            setIsVisible(false);
            return;
          }

          if (focusable && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            if (showTimeoutRef.current) {
              clearTimeout(showTimeoutRef.current);
              showTimeoutRef.current = null;
            }
            if (isVisible) {
              setIsVisible(false);
            } else {
              calculatePosition();
              setIsVisible(true);
            }
          }
        }}
        onClick={() => {
          // 移动端点击触发
          if (window.innerWidth < 768) {
            if (isVisible) {
              setIsVisible(false);
            } else {
              calculatePosition();
              setIsVisible(true);
            }
          }
        }}
      >
        {children}
      </div>

      {/* 悬浮卡片 - Portal 渲染 */}
      {isVisible &&
        createPortal(
          <div
            ref={cardRef}
            role="dialog"
            aria-label={`${user.name}的用户资料`}
            className={clsx(
              "fixed z-[1070]",
              "animate-fade-in",
              "transition-opacity duration-150"
            )}
            style={{
              top: position.top,
              left: position.left,
            }}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={hideCard}
          >
            <UserCardContent
              user={user}
              matchScore={matchScore}
              onViewProfile={
                showProfileAction ? handleViewProfile : undefined
              }
              actionsSlot={actionsSlot}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export { UserCardContent } from "./UserCardContent";
export type {
  UserHoverCardProps,
  UserCardContentProps,
  UserBrief,
} from "./types";
export default UserHoverCard;
