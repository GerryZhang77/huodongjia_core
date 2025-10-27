/**
 * Stack - 堆叠布局组件
 *
 * 用途: 简化 Flexbox 布局的组件
 *
 * 特性:
 * - 支持水平/垂直方向
 * - 可配置间距
 * - 支持对齐方式
 * - 可选分隔线
 *
 * @example
 * ```tsx
 * <Stack direction="horizontal" spacing={4} align="center">
 *   <div>项目 1</div>
 *   <div>项目 2</div>
 *   <div>项目 3</div>
 * </Stack>
 * ```
 */

import { FC, Children, Fragment } from "react";
import classNames from "classnames";
import type { StackProps } from "./types";

export const Stack: FC<StackProps> = ({
  children,
  direction = "vertical",
  spacing = 4,
  align = "stretch",
  justify = "start",
  wrap = false,
  divider = false,
  className,
  ...rest
}) => {
  const isHorizontal = direction === "horizontal";

  const spacingClasses = {
    0: isHorizontal ? "gap-0" : "space-y-0",
    1: isHorizontal ? "gap-1" : "space-y-1",
    2: isHorizontal ? "gap-2" : "space-y-2",
    3: isHorizontal ? "gap-3" : "space-y-3",
    4: isHorizontal ? "gap-4" : "space-y-4",
    6: isHorizontal ? "gap-6" : "space-y-6",
    8: isHorizontal ? "gap-8" : "space-y-8",
    12: isHorizontal ? "gap-12" : "space-y-12",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  const childArray = Children.toArray(children);

  return (
    <div
      className={classNames(
        "flex",
        {
          "flex-row": isHorizontal,
          "flex-col": !isHorizontal,
          "flex-wrap": wrap,
        },
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
      {...rest}
    >
      {divider
        ? childArray.map((child, index) => (
            <Fragment key={index}>
              {child}
              {index < childArray.length - 1 && (
                <div
                  className={classNames(
                    "bg-gray-200",
                    isHorizontal ? "w-px h-auto" : "w-auto h-px"
                  )}
                />
              )}
            </Fragment>
          ))
        : children}
    </div>
  );
};

Stack.displayName = "Stack";
