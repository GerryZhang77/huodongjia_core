/**
 * Card - 卡片组件 (2024 新版设计系统)
 *
 * 用途: 内容分组展示的容器
 *
 * 设计规范:
 * - 圆角: 16px (统一)
 * - 阴影: 柔和阴影，悬停时增强 + 蓝色光晕
 * - 边框: 1px #E2E8F0 (Slate-200)
 * - 背景: 白色
 *
 * @example
 * ```tsx
 * <Card title="活动信息" extra={<Button>编辑</Button>}>
 *   <p>活动内容...</p>
 * </Card>
 * ```
 */

import { FC } from "react";
import { clsx } from "clsx";
import type { CardProps, CardHeaderProps, CardBodyProps } from "./types";

/**
 * 卡片头部组件
 */
const CardHeader: FC<CardHeaderProps> = ({ title, extra, className }) => {
  if (!title && !extra) return null;

  return (
    <div
      className={clsx(
        "flex items-center justify-between",
        "px-4 py-3",
        "border-b border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {title && (
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </div>
      )}
      {extra && <div className="flex items-center gap-2">{extra}</div>}
    </div>
  );
};

/**
 * 卡片内容组件
 */
const CardBody: FC<CardBodyProps> = ({
  children,
  padding = "medium",
  className,
}) => {
  const paddingClasses = {
    none: "",
    small: "p-3",
    medium: "p-4",
    large: "p-6",
  };

  return (
    <div className={clsx(paddingClasses[padding], className)}>{children}</div>
  );
};

/**
 * 卡片主组件
 */
export const Card: FC<CardProps> = ({
  children,
  title,
  extra,
  padding = "medium",
  bordered = true,
  shadow = "default",
  hoverable = false,
  radius = "xl",
  className,
  onClick,
  ...rest
}) => {
  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    default: "shadow-card", // 新的卡片阴影
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const radiusClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl", // 16px - 默认
    "2xl": "rounded-2xl",
  };

  const hasHeader = title || extra;

  return (
    <div
      className={clsx(
        "bg-white dark:bg-gray-800",
        radiusClasses[radius],
        shadowClasses[shadow],
        {
          "border border-gray-200 dark:border-gray-700": bordered,
          // 悬停效果: 阴影增强 + 蓝色光晕 + 轻微上移
          "transition-all duration-200 ease-out cursor-pointer": hoverable,
          "hover:shadow-card-hover hover:-translate-y-0.5": hoverable,
        },
        className
      )}
      onClick={onClick}
      {...rest}
    >
      {hasHeader && <CardHeader title={title} extra={extra} />}
      <CardBody padding={hasHeader ? "medium" : padding}>{children}</CardBody>
    </div>
  );
};

Card.displayName = "Card";
