/**
 * 登录表单组件
 *
 * 使用通用 UI 组件重构，对齐 event-club-login-design.svg 设计稿
 *
 * 设计规范：
 * - 卡片: 540x660px, 圆角30px (响应式)
 * - 使用 Input 组件 (size="large")
 * - 使用 lucide-react 图标库
 * - 社交登录按钮: 圆角10px
 * - 完整响应式支持 (移动端/平板/桌面)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Modal, Checkbox } from "@/components/ui";
import { useLogin } from "@/features/auth/hooks";
import { TEST_ACCOUNTS } from "@/features/auth/utils";
import { UserAgreement, PrivacyPolicy } from "@/components/legal";
import { Mail, Eye, EyeOff, AlertCircle, Info, Sparkles } from "lucide-react";
// TODO: 暂时隐藏社交登录功能
// import { FaWeixin, FaQq, FaWeibo } from "react-icons/fa";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useLogin();
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [showTestAccounts, setShowTestAccounts] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 协议弹窗状态
  const [showUserAgreement, setShowUserAgreement] = useState<boolean>(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);

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

    if (!agreeTerms) {
      setError("请先阅读并同意用户协议和隐私政策");
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
    <div className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-[30px] shadow-2xl overflow-hidden">
      {/* 卡片内容 - 精确匹配设计稿内边距 */}
      <div className="px-[70px] py-20 max-md:px-8 max-md:py-10 max-sm:px-6 max-sm:py-8">
        {/* Logo 和标题区域 */}
        <div className="flex flex-col items-center mb-[60px] max-md:mb-10 max-sm:mb-8">
          {/* Logo 图标 - 半径35px = 直径70px */}
          <div
            className="w-[70px] h-[70px] max-sm:w-14 max-sm:h-14 rounded-full flex items-center justify-center mb-5"
            style={{
              background: "linear-gradient(to right, #4facfe, #00c6ff)",
            }}
          >
            {/* 笑脸图标 - 按设计稿 */}
            <svg
              viewBox="0 0 30 30"
              className="w-[30px] h-[30px] max-sm:w-6 max-sm:h-6"
            >
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
          <h1 className="text-[32px] max-md:text-3xl max-sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            活动俱乐部
          </h1>

          {/* 副标题 - 16px font-size */}
          <p className="text-base max-sm:text-sm text-gray-600 dark:text-gray-300">
            欢迎回来！让我们一起创造美好回忆
          </p>
        </div>

        {/* 登录表单 */}
        <form
          onSubmit={handleSubmit}
          className="space-y-[30px] max-sm:space-y-5"
        >
          {/* 邮箱输入框 - 使用通用 Input 组件 */}
          <Input
            label="邮箱地址"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="请输入邮箱地址"
            autoComplete="username"
            size="large"
            suffix={<Mail className="w-5 h-5 text-gray-400" />}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            required
          />

          {/* 密码输入框 - 使用通用 Input 组件 */}
          <Input
            label="密码"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            size="large"
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            required
          />

          {/* 记住我 & 忘记密码 */}
          <div className="flex items-center justify-between">
            <Checkbox
              checked={rememberMe}
              onChange={(checked) => setRememberMe(checked)}
              size="medium"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                记住我
              </span>
            </Checkbox>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm font-semibold text-primary-400 hover:text-primary-500 transition-colors"
            >
              忘记密码？
            </button>
          </div>

          {/* 用户协议勾选 */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={agreeTerms}
              onChange={(checked) => setAgreeTerms(checked)}
              size="medium"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              我已阅读并同意
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowUserAgreement(true);
                }}
                className="text-primary-400 hover:text-primary-500 mx-0.5"
              >
                《用户协议》
              </button>
              和
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPrivacyPolicy(true);
                }}
                className="text-primary-400 hover:text-primary-500 mx-0.5"
              >
                《隐私政策》
              </button>
            </span>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
              <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* 登录按钮 - 使用通用 Button 组件，自定义样式匹配设计稿 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[54px] flex items-center justify-center gap-2 text-base font-bold text-white rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(to right, #4facfe, #00c6ff)",
              }}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>登录中...</span>
                </>
              ) : (
                "登录"
              )}
            </button>
          </div>
        </form>

        {/* TODO: 暂时隐藏社交登录功能 */}
        {/* 分隔线 - 精确匹配设计稿位置 */}
        {/* <div className="flex items-center gap-[30px] my-[30px] max-sm:my-5">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-sm text-gray-400 dark:text-gray-500">或</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div> */}

        {/* 社交登录按钮 - 125x48px 每个 */}
        {/* <div className="grid grid-cols-3 gap-3 max-sm:gap-2">
          <button
            type="button"
            className="h-12 flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-[10px] transition-all duration-200 hover:border-[#07c160] hover:shadow-sm"
          >
            <FaWeixin size={20} color="#07c160" />
            <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 max-sm:hidden">
              微信
            </span>
          </button>

          <button
            type="button"
            className="h-12 flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-[10px] transition-all duration-200 hover:border-[#12b7f5] hover:shadow-sm"
          >
            <FaQq size={20} color="#12b7f5" />
            <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 max-sm:hidden">
              QQ
            </span>
          </button>

          <button
            type="button"
            className="h-12 flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-[10px] transition-all duration-200 hover:border-[#e6162d] hover:shadow-sm"
          >
            <FaWeibo size={20} color="#e6162d" />
            <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 max-sm:hidden">
              微博
            </span>
          </button>
        </div> */}

        {/* 注册链接 */}
        <p className="text-center mt-6 max-sm:mt-5 text-sm text-gray-600 dark:text-gray-400">
          还没有账号？
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="ml-1 font-semibold text-primary-400 hover:text-primary-500 transition-colors"
          >
            立即注册
          </button>
        </p>

        {/* 测试账号折叠区域 - 仅开发环境 */}
        {import.meta.env.VITE_PRODUCTION_MODE !== "true" &&
          import.meta.env.DEV && (
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowTestAccounts(!showTestAccounts)}
                className="flex items-center gap-2 mx-auto text-[13px] text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showTestAccounts ? "收起" : "查看"}测试账号</span>
              </button>

              {showTestAccounts && (
                <div className="mt-4 space-y-2.5 animate-fade-in">
                  {TEST_ACCOUNTS.map((account) => (
                    <div
                      key={account.value}
                      className="p-3 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-[10px] transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                          {account.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickFill(account)}
                          className="px-3 py-1 text-xs font-medium text-primary-400 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
                        >
                          快速填充
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        账号:{" "}
                        <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
                          {account.value}
                        </code>{" "}
                        | {account.description}
                      </p>
                    </div>
                  ))}
                  <p className="text-center pt-2 text-[11px] text-gray-400">
                    此区域仅在开发环境显示
                  </p>
                </div>
              )}
            </div>
          )}
      </div>

      {/* 用户协议弹窗 */}
      <Modal
        open={showUserAgreement}
        onClose={() => setShowUserAgreement(false)}
        title="用户服务协议"
        width="large"
        closable
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <UserAgreement />
        </div>
      </Modal>

      {/* 隐私政策弹窗 */}
      <Modal
        open={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        title="隐私政策"
        width="large"
        closable
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <PrivacyPolicy />
        </div>
      </Modal>
    </div>
  );
};
