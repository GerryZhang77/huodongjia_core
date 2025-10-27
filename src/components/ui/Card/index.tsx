/**
 * Card - 卡片组件
 *
 * 用途: 内容分组展示的容器
 *
 * 特性:
 * - 支持标题和额外内容
 * - 可配置内边距、边框、阴影
 * - 支持悬停效果
 * - 可配置圆角大小
 *
 * @example
 * ```tsx
 * <Card title="活动信息" extra={<Button>编辑</Button>}>
 *   <p>活动内容...</p>
 * </Card>
 * ```
 */

import { FC } from "react";
import classNames from "classnames";
import type { CardProps, CardHeaderProps, CardBodyProps } from "./types";

/**
 * 卡片头部组件
 */
const CardHeader: FC<CardHeaderProps> = ({ title, extra, className }) => {
  if (!title && !extra) return null;

  return (
    <div
      className={classNames(
        "flex items-center justify-between",
        "px-4 py-3",
        "border-b border-gray-200",
        className
      )}
    >
      {title && (
        <div className="text-lg font-semibold text-gray-900">{title}</div>
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
    small: "p-2",
    medium: "p-4",
    large: "p-6",
  };

  return (
    <div className={classNames(paddingClasses[padding], className)}>
      {children}
    </div>
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
  shadow = "sm",
  hoverable = false,
  radius = "lg",
  className,
  onClick,
  ...rest
}) => {
  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const radiusClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
  };

  const hasHeader = title || extra;

  return (
    <div
      className={classNames(
        "bg-white",
        radiusClasses[radius],
        shadowClasses[shadow],
        {
          "border border-gray-200": bordered,
          "hover:shadow-md transition-shadow duration-150 cursor-pointer":
            hoverable,
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
