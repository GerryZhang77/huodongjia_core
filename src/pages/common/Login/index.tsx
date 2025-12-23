/**
 * 登录页面 - 活动俱乐部
 *
 * 响应式设计：
 * - 移动端 (< 768px): 全屏登录卡片
 * - 平板 (768px - 1024px): 居中登录卡片 + 简化背景
 * - 桌面 (> 1024px): 左右分栏布局（插画 + 登录卡片）
 *
 * 设计参考: event-club-login-design.svg
 */

import { LoginForm, LoginIllustration } from "./components";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* 渐变背景 */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#4facfe] to-[#00f2fe]"
        aria-hidden="true"
      />

      {/* 装饰性圆形 - 仅桌面端显示 */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {/* 左上角大圆 */}
        <div className="hidden lg:block absolute -top-12 -left-12 w-72 h-72 rounded-full bg-white/10" />
        {/* 右下角大圆 */}
        <div className="hidden lg:block absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/[0.08]" />
        {/* 左下角中圆 */}
        <div className="hidden lg:block absolute bottom-48 left-24 w-40 h-40 rounded-full bg-[#00c6ff]/15" />
        {/* 右上角中圆 */}
        <div className="hidden lg:block absolute top-24 right-24 w-48 h-48 rounded-full bg-[#4facfe]/15" />

        {/* 装饰星星 - 仅桌面端 */}
        <svg
          className="hidden lg:block absolute top-60 left-36 w-8 h-8 text-yellow-400/60"
          viewBox="0 0 40 40"
          fill="currentColor"
        >
          <path d="M20 0 L24 14 L40 16 L28 26 L32 40 L20 32 L8 40 L12 26 L0 16 L16 14 Z" />
        </svg>
        <svg
          className="hidden lg:block absolute top-20 right-48 w-5 h-5 text-yellow-400/60"
          viewBox="0 0 40 40"
          fill="currentColor"
        >
          <path d="M20 0 L24 14 L40 16 L28 26 L32 40 L20 32 L8 40 L12 26 L0 16 L16 14 Z" />
        </svg>
        <svg
          className="hidden lg:block absolute bottom-48 left-72 w-4 h-4 text-yellow-400/60"
          viewBox="0 0 40 40"
          fill="currentColor"
        >
          <path d="M20 0 L24 14 L40 16 L28 26 L32 40 L20 32 L8 40 L12 26 L0 16 L16 14 Z" />
        </svg>

        {/* 浮动小圆点 */}
        <div className="hidden lg:block absolute top-48 left-1/2 w-3 h-3 rounded-full bg-yellow-400/40" />
        <div className="hidden lg:block absolute bottom-36 right-1/3 w-4 h-4 rounded-full bg-[#4facfe]/40" />
        <div className="hidden lg:block absolute top-1/3 right-20 w-3.5 h-3.5 rounded-full bg-[#00c6ff]/40" />
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 min-h-screen flex">
        {/* 左侧插画区域 - 仅桌面端显示 */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] items-center justify-center p-8 xl:p-12">
          <LoginIllustration />
        </div>

        {/* 右侧登录卡片区域 */}
        <div className="w-full lg:w-1/2 xl:w-[55%] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* 移动端/平板端额外的装饰背景 */}
          <div
            className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none"
            aria-hidden="true"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-white/[0.08]" />
          </div>

          {/* 登录卡片容器 */}
          <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
