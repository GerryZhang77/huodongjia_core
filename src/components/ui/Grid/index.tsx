/**
 * Grid - 网格布局组件
 *
 * 用途: 响应式网格布局
 *
 * 特性:
 * - 支持响应式列数
 * - 可配置间距
 * - 简化的 API
 *
 * @example
 * ```tsx
 * <Grid columns={3} gap={4}>
 *   <Card>项目 1</Card>
 *   <Card>项目 2</Card>
 *   <Card>项目 3</Card>
 * </Grid>
 *
 * // 响应式
 * <Grid cols={{ default: 1, md: 2, lg: 3 }} gap={4}>
 *   <Card>项目 1</Card>
 *   <Card>项目 2</Card>
 * </Grid>
 * ```
 */

import { FC } from "react";
import classNames from "classnames";
import type { GridProps } from "./types";

export const Grid: FC<GridProps> = ({
  children,
  cols,
  columns,
  gap = 4,
  className,
  ...rest
}) => {
  const gapClasses = {
    0: "gap-0",
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
    12: "gap-12",
  };

  const colClasses = (num: number) => {
    const mapping = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    };
    return mapping[num as keyof typeof mapping] || "grid-cols-1";
  };

  // 简化版：所有断点使用相同列数
  if (columns) {
    return (
      <div
        className={classNames(
          "grid",
          colClasses(columns),
          gapClasses[gap],
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
  }

  // 响应式版：不同断点使用不同列数
  const responsiveClasses = [];
  if (cols?.default) {
    responsiveClasses.push(colClasses(cols.default));
  }
  if (cols?.sm) {
    responsiveClasses.push(`sm:${colClasses(cols.sm)}`);
  }
  if (cols?.md) {
    responsiveClasses.push(`md:${colClasses(cols.md)}`);
  }
  if (cols?.lg) {
    responsiveClasses.push(`lg:${colClasses(cols.lg)}`);
  }
  if (cols?.xl) {
    responsiveClasses.push(`xl:${colClasses(cols.xl)}`);
  }

  return (
    <div
      className={classNames(
        "grid",
        ...responsiveClasses,
        gapClasses[gap],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

Grid.displayName = "Grid";
