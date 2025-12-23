/**
 * 登录页面 - 左侧插画组件
 *
 * 精确按照 event-club-login-design.svg 设计稿实现
 * 包含人物图标、背景光晕和装饰元素
 */

import React from "react";

export const LoginIllustration: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* 插画容器 */}
      <div className="relative w-[400px] h-[400px]">
        {/* 背景光晕圆 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full animate-pulse-slow"
            style={{
              width: "360px",
              height: "360px",
              backgroundColor: "rgba(79, 172, 254, 0.2)",
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full"
            style={{
              width: "280px",
              height: "280px",
              backgroundColor: "rgba(0, 198, 255, 0.3)",
            }}
          />
        </div>

        {/* 人物插画 SVG - 精确匹配设计稿 */}
        <svg
          viewBox="0 0 400 400"
          className="relative z-10 w-full h-full"
          aria-hidden="true"
        >
          {/* 人物组 - 居中显示 */}
          <g transform="translate(80, 100)">
            {/* 人物 1 - 左侧 */}
            <g>
              <circle cx="40" cy="40" r="25" fill="#4facfe" />
              <rect
                x="20"
                y="70"
                width="40"
                height="60"
                rx="20"
                fill="#4facfe"
              />
            </g>

            {/* 人物 2 - 中间 */}
            <g transform="translate(60, 10)">
              <circle cx="40" cy="40" r="25" fill="#00c6ff" />
              <rect
                x="20"
                y="70"
                width="40"
                height="60"
                rx="20"
                fill="#00c6ff"
              />
            </g>

            {/* 人物 3 - 右侧 */}
            <g transform="translate(120, 0)">
              <circle cx="40" cy="40" r="25" fill="#0099ff" />
              <rect
                x="20"
                y="70"
                width="40"
                height="60"
                rx="20"
                fill="#0099ff"
              />
            </g>
          </g>

          {/* 装饰元素 - 彩色方块和圆点 */}
          <g opacity="0.8">
            {/* 金色方块 - 左上 */}
            <rect
              x="60"
              y="100"
              width="8"
              height="8"
              fill="#ffd700"
              transform="rotate(15 64 104)"
            />
            {/* 青色圆点 - 右上 */}
            <circle cx="320" cy="120" r="5" fill="#00c6ff" />
            {/* 蓝色方块 - 左下 */}
            <rect
              x="100"
              y="320"
              width="8"
              height="8"
              fill="#4facfe"
              transform="rotate(45 104 324)"
            />
            {/* 深蓝圆点 - 右下 */}
            <circle cx="280" cy="300" r="5" fill="#0099ff" />
          </g>
        </svg>
      </div>

      {/* 文案区域 */}
      <div className="mt-8 text-center">
        <h2
          className="font-bold mb-3"
          style={{ fontSize: "36px", color: "#ffffff" }}
        >
          加入我们！
        </h2>
        <p
          style={{
            fontSize: "18px",
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          发现精彩活动，结识有趣的人
        </p>
      </div>
    </div>
  );
};
