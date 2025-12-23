/**
 * 登录表单组件
 *
 * 精确按照 event-club-login-design.svg 设计稿实现
 * 设计稿参数：
 * - 卡片: 540x660px, 圆角30px
 * - 输入框: 400x52px, 圆角12px
 * - 按钮: 400x54px, 圆角12px
 * - 社交按钮: 125x48px, 圆角10px
 */

import React, { useState } from "react";
import { useLogin } from "@/features/auth/hooks";
import { TEST_ACCOUNTS } from "@/features/auth/utils";

export const LoginForm: React.FC = () => {
  const { login, loading } = useLogin();
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showTestAccounts, setShowTestAccounts] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!identifier) {
      setError("请输入邮箱地址");
      return;
    }

    if (!password) {
      setError("请输入密码");
      return;
    }

    login({ identifier, password });
  };

  const handleQuickFill = (account: (typeof TEST_ACCOUNTS)[0]) => {
    setIdentifier(account.value);
    setPassword("123456");
    setError("");
  };

  return (
    <div
      className="w-full bg-white/[0.95] backdrop-blur-sm shadow-2xl overflow-hidden"
      style={{ borderRadius: "30px" }}
    >
      {/* 卡片内容 - 精确匹配设计稿内边距 */}
      <div className="px-[70px] py-[80px] max-sm:px-6 max-sm:py-10">
        {/* Logo 和标题区域 */}
        <div className="flex flex-col items-center mb-[60px] max-sm:mb-10">
          {/* Logo 图标 - 半径35px = 直径70px */}
          <div
            className="w-[70px] h-[70px] rounded-full flex items-center justify-center mb-5"
            style={{
              background: "linear-gradient(to right, #4facfe, #00c6ff)",
            }}
          >
            {/* 笑脸图标 - 按设计稿 */}
            <svg viewBox="0 0 30 30" className="w-[30px] h-[30px]">
              <path
                d="M7.5 17.5 L15 10 L22.5 17.5"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="10" cy="10" r="3" fill="#ffffff" />
              <circle cx="20" cy="10" r="3" fill="#ffffff" />
            </svg>
          </div>

          {/* 标题 - 32px font-size */}
          <h1
            className="font-bold mb-[15px] max-sm:text-2xl"
            style={{ fontSize: "32px", color: "#2d3748" }}
          >
            活动俱乐部
          </h1>

          {/* 副标题 - 16px font-size */}
          <p style={{ fontSize: "16px", color: "#718096" }}>
            欢迎回来！让我们一起创造美好回忆
          </p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit}>
          {/* 邮箱输入框 */}
          <div className="mb-[30px] max-sm:mb-5">
            {/* 标签 - 14px font-weight 600 */}
            <label
              className="block mb-3 max-sm:mb-2"
              style={{ fontSize: "14px", fontWeight: 600, color: "#4a5568" }}
            >
              邮箱地址
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="请输入邮箱地址"
                autoComplete="username"
                className="w-full outline-none transition-all duration-200"
                style={{
                  height: "52px",
                  paddingLeft: "20px",
                  paddingRight: "50px",
                  backgroundColor: "#f7fafc",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "15px",
                  color: "#2d3748",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4facfe";
                  e.target.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.backgroundColor = "#f7fafc";
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              {/* 邮件图标 */}
              <div className="absolute right-[15px] top-1/2 -translate-y-1/2">
                <svg
                  width="20"
                  height="14"
                  viewBox="0 0 20 14"
                  fill="none"
                  stroke="#cbd5e0"
                  strokeWidth="1.5"
                >
                  <rect x="0" y="0" width="20" height="14" rx="2" />
                  <path d="M0 0 L10 8 L20 0" />
                </svg>
              </div>
            </div>
          </div>

          {/* 密码输入框 */}
          <div className="mb-[25px] max-sm:mb-5">
            <label
              className="block mb-3 max-sm:mb-2"
              style={{ fontSize: "14px", fontWeight: 600, color: "#4a5568" }}
            >
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full outline-none transition-all duration-200"
                style={{
                  height: "52px",
                  paddingLeft: "20px",
                  paddingRight: "50px",
                  backgroundColor: "#f7fafc",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "15px",
                  color: "#2d3748",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4facfe";
                  e.target.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.backgroundColor = "#f7fafc";
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              {/* 锁图标 */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[15px] top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
              >
                <svg
                  width="14"
                  height="16"
                  viewBox="0 0 14 16"
                  fill="none"
                  stroke="#cbd5e0"
                  strokeWidth="1.5"
                >
                  <rect x="0" y="6" width="14" height="10" rx="2" />
                  <path d="M3 6 L3 4 C3 1.8 4.8 0 7 0 C9.2 0 11 1.8 11 4 L11 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* 记住我 & 忘记密码 */}
          <div className="flex items-center justify-between mb-[25px] max-sm:mb-5">
            <label className="flex items-center gap-[10px] cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: rememberMe ? "#4facfe" : "#f7fafc",
                    border: `2px solid ${rememberMe ? "#4facfe" : "#e2e8f0"}`,
                    borderRadius: "5px",
                  }}
                >
                  {rememberMe && (
                    <svg
                      width="12"
                      height="10"
                      viewBox="0 0 12 10"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M1 5 L4 8 L11 1" />
                    </svg>
                  )}
                </div>
              </div>
              <span style={{ fontSize: "14px", color: "#4a5568" }}>记住我</span>
            </label>

            <button
              type="button"
              className="hover:opacity-80 transition-opacity"
              style={{ fontSize: "14px", fontWeight: 600, color: "#4facfe" }}
            >
              忘记密码？
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div
              className="mb-5 p-3 animate-shake"
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "12px",
              }}
            >
              <p
                className="flex items-center gap-2"
                style={{ fontSize: "14px", color: "#dc2626" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 4 L8 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="8" cy="12" r="1" />
                </svg>
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* 登录按钮 - 54px 高度 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              height: "54px",
              background: "linear-gradient(to right, #4facfe, #00c6ff)",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>登录中...</span>
              </span>
            ) : (
              "登录"
            )}
          </button>
        </form>

        {/* 分隔线 - 精确匹配设计稿位置 */}
        <div className="flex items-center gap-[30px] my-[30px] max-sm:my-5">
          <div className="flex-1 h-px" style={{ backgroundColor: "#e2e8f0" }} />
          <span style={{ fontSize: "14px", color: "#a0aec0" }}>或</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#e2e8f0" }} />
        </div>

        {/* 社交登录按钮 - 125x48px 每个 */}
        <div className="flex gap-[12.5px] max-sm:gap-2">
          {/* 微信 */}
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:border-[#07c160]"
            style={{
              height: "48px",
              backgroundColor: "#ffffff",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
            }}
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#07c160" }}
            />
            <span
              className="max-sm:hidden"
              style={{ fontSize: "13px", fontWeight: 600, color: "#4a5568" }}
            >
              微信
            </span>
          </button>

          {/* QQ */}
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:border-[#12b7f5]"
            style={{
              height: "48px",
              backgroundColor: "#ffffff",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
            }}
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#12b7f5" }}
            />
            <span
              className="max-sm:hidden"
              style={{ fontSize: "13px", fontWeight: 600, color: "#4a5568" }}
            >
              QQ
            </span>
          </button>

          {/* 微博 */}
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:border-[#e6162d]"
            style={{
              height: "48px",
              backgroundColor: "#ffffff",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
            }}
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#e6162d" }}
            />
            <span
              className="max-sm:hidden"
              style={{ fontSize: "13px", fontWeight: 600, color: "#4a5568" }}
            >
              微博
            </span>
          </button>
        </div>

        {/* 注册链接 */}
        <p
          className="text-center mt-[25px] max-sm:mt-5"
          style={{ fontSize: "14px", color: "#718096" }}
        >
          还没有账号？
          <button
            type="button"
            className="ml-1 hover:opacity-80 transition-opacity"
            style={{ fontWeight: 600, color: "#4facfe" }}
          >
            立即注册
          </button>
        </p>

        {/* 测试账号折叠区域 - 仅开发环境 */}
        {import.meta.env.VITE_PRODUCTION_MODE !== "true" &&
          import.meta.env.DEV && (
            <div
              className="mt-6 pt-5"
              style={{ borderTop: "1px solid #e2e8f0" }}
            >
              <button
                type="button"
                onClick={() => setShowTestAccounts(!showTestAccounts)}
                className="flex items-center gap-2 mx-auto hover:opacity-80 transition-opacity"
                style={{ fontSize: "13px", color: "#718096" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 4 L8 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="8" cy="12" r="1" />
                </svg>
                <span>{showTestAccounts ? "收起" : "查看"}测试账号</span>
              </button>

              {showTestAccounts && (
                <div className="mt-4 space-y-2.5 animate-fade-in">
                  {TEST_ACCOUNTS.map((account) => (
                    <div
                      key={account.value}
                      className="p-3 transition-all duration-200 hover:shadow-md"
                      style={{
                        background:
                          "linear-gradient(to bottom right, #f7fafc, #ffffff)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#2d3748",
                          }}
                        >
                          {account.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickFill(account)}
                          className="px-3 py-1 transition-colors hover:opacity-80"
                          style={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#4facfe",
                            backgroundColor: "rgba(79, 172, 254, 0.1)",
                            borderRadius: "6px",
                          }}
                        >
                          快速填充
                        </button>
                      </div>
                      <p style={{ fontSize: "12px", color: "#718096" }}>
                        账号:{" "}
                        <code
                          className="px-1.5 py-0.5"
                          style={{
                            backgroundColor: "#f7fafc",
                            borderRadius: "4px",
                            color: "#4a5568",
                          }}
                        >
                          {account.value}
                        </code>{" "}
                        | {account.description}
                      </p>
                    </div>
                  ))}
                  <p
                    className="text-center pt-2"
                    style={{ fontSize: "11px", color: "#a0aec0" }}
                  >
                    ⚠️ 此区域仅在开发环境显示
                  </p>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};
