/**
 * 忘记密码页面 - 活动家平台
 *
 * 响应式设计，与登录页面风格一致
 * 采用手机号 + 验证码重置密码方式
 */

import { ForgotPasswordForm } from "./components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* 渐变背景 */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#4facfe] to-[#00f2fe]"
        aria-hidden="true"
      />

      {/* 装饰性圆形 */}
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

        {/* 移动端装饰 */}
        <div className="lg:hidden absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10" />
        <div className="lg:hidden absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-white/[0.08]" />
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* 卡片容器 */}
        <div className="w-full max-w-md lg:max-w-lg">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
