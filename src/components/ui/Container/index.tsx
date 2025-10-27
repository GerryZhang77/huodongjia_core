/**
 * Container - 容器组件
 *
 * 用途: 页面内容的响应式容器
 *
 * 特性:
 * - 支持多种最大宽度预设
 * - 自动水平居中
 * - 可配置内边距
 * - 响应式设计
 *
 * @example
 * ```tsx
 * <Container maxWidth="lg">
 *   <h1>页面标题</h1>
 *   <p>页面内容...</p>
 * </Container>
 * ```
 */

import { FC } from "react";
import classNames from "classnames";
import type { ContainerProps } from "./types";

export const Container: FC<ContainerProps> = ({
  children,
  maxWidth = "lg",
  center = true,
  padding = "md",
  paddingY = "md",
  className,
  ...rest
}) => {
  const maxWidthClasses = {
    sm: "max-w-screen-sm", // 640px
    md: "max-w-screen-md", // 768px
    lg: "max-w-screen-lg", // 1024px
    xl: "max-w-screen-xl", // 1280px
    "2xl": "max-w-screen-2xl", // 1536px
    full: "max-w-full",
  };

  const paddingClasses = {
    none: "",
    sm: "px-3",
    md: "px-4",
    lg: "px-6",
  };

  const paddingYClasses = {
    none: "",
    sm: "py-3",
    md: "py-6",
    lg: "py-8",
  };

  return (
    <div
      className={classNames(
        "w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        paddingYClasses[paddingY],
        {
          "mx-auto": center,
        },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

Container.displayName = "Container";
