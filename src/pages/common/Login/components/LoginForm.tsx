/**
 * 登录表单组件
 *
 * 支持两种登录方式（Tab 切换，默认密码登录）：
 * 1. 密码登录：账号（用户名或手机号）+ 密码
 * 2. 验证码登录：手机号 + 短信验证码
 *
 * 设计规范：
 * - 卡片: 540x660px, 圆角30px (响应式)
 * - 使用 Input 组件 (size="large")
 * - 使用 lucide-react 图标库
 * - 完整响应式支持 (移动端/平板/桌面)
 */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Modal, Checkbox } from "@/components/ui";
import { useLogin } from "@/features/auth/hooks";
import { sendSmsCode } from "@/features/auth/services";
import { TEST_ACCOUNTS } from "@/features/auth/utils";
import { UserAgreement, PrivacyPolicy } from "@/components/legal";
import {
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  Phone,
  KeyRound,
} from "lucide-react";

type LoginMode = "password" | "sms";

const SMS_CODE_LENGTH = 4;
const SMS_COUNTDOWN_SECONDS = 60;

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginBySms, loading } = useLogin();

  const [mode, setMode] = useState<LoginMode>("password");

  // 密码登录字段
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const passwordRef = useRef<HTMLInputElement>(null);

  // 验证码登录字段
  const [smsPhone, setSmsPhone] = useState<string>("");
  const [smsCode, setSmsCode] = useState<string>("");
  const [smsCountdown, setSmsCountdown] = useState<number>(0);
  const [sendingSms, setSendingSms] = useState<boolean>(false);
  const smsCodeRef = useRef<HTMLInputElement>(null);

  const [showTestAccounts, setShowTestAccounts] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 协议弹窗状态
  const [showUserAgreement, setShowUserAgreement] = useState<boolean>(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);

  // 验证码倒计时
  useEffect(() => {
    if (smsCountdown <= 0) return;
    const timer = setTimeout(() => setSmsCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [smsCountdown]);

  const switchMode = (next: LoginMode) => {
    if (next === mode) return;
    setMode(next);
    setError("");
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!identifier) {
      setError("请输入用户名或手机号");
      return;
    }
    if (!password) {
      setError("请输入密码");
      return;
    }

    login({ identifier, password });
  };

  const handleSendSmsCode = async () => {
    setError("");

    if (!smsPhone) {
      setError("请输入手机号");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(smsPhone)) {
      setError("请输入正确的手机号");
      return;
    }

    setSendingSms(true);
    try {
      const res = await sendSmsCode(smsPhone, "login");
      if (res.success) {
        setSmsCountdown(SMS_COUNTDOWN_SECONDS);
        // 聚焦到验证码输入框，减少用户操作
        setTimeout(() => smsCodeRef.current?.focus(), 0);
      } else {
        setError(res.message || "发送验证码失败");
      }
    } catch (err) {
      console.error("❌ [LoginForm] 发送验证码失败:", err);
      setError("发送验证码失败，请稍后重试");
    } finally {
      setSendingSms(false);
    }
  };

  const handleSmsSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!smsPhone) {
      setError("请输入手机号");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(smsPhone)) {
      setError("请输入正确的手机号");
      return;
    }
    if (!smsCode) {
      setError("请输入验证码");
      return;
    }
    if (smsCode.length !== SMS_CODE_LENGTH) {
      setError(`请输入${SMS_CODE_LENGTH}位验证码`);
      return;
    }

    loginBySms(smsPhone, smsCode);
  };

  const handleQuickFill = (account: (typeof TEST_ACCOUNTS)[0]) => {
    setIdentifier(account.value);
    setPassword("123456");
    setError("");
  };

  return (
    <div className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-[30px] shadow-2xl overflow-hidden">
      <div className="px-[70px] py-20 max-md:px-8 max-md:py-10 max-sm:px-6 max-sm:py-8">
        {/* Logo 和标题 */}
        <div className="flex flex-col items-center mb-[60px] max-md:mb-10 max-sm:mb-8">
          <div
            className="w-[70px] h-[70px] max-sm:w-14 max-sm:h-14 rounded-full flex items-center justify-center mb-5"
            style={{
              background: "linear-gradient(to right, #4facfe, #00c6ff)",
            }}
          >
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
          <h1 className="text-[32px] max-md:text-3xl max-sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            活动+
          </h1>
          <p className="text-base max-sm:text-sm text-gray-600 dark:text-gray-300">
            欢迎回来！让我们一起创造美好回忆
          </p>
        </div>

        {/* 登录方式 Tab 切换 */}
        <div className="flex items-center mb-6 border-b border-gray-200 dark:border-gray-700">
          {(
            [
              { key: "password", label: "密码登录" },
              { key: "sms", label: "验证码登录" },
            ] as const
          ).map((tab) => {
            const active = mode === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchMode(tab.key)}
                className={`flex-1 pb-3 text-base font-semibold transition-colors ${
                  active
                    ? "text-primary-400 border-b-2 border-primary-400"
                    : "text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 密码登录表单 */}
        {mode === "password" && (
          <form
            onSubmit={handleSubmit}
            className="space-y-[30px] max-sm:space-y-5"
          >
            <Input
              label="用户名 / 手机号"
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (error) setError("");
              }}
              placeholder="请输入用户名或手机号"
              autoComplete="username"
              size="large"
              suffix={<Mail className="w-5 h-5 text-gray-400" />}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  passwordRef.current?.focus();
                }
              }}
              required
            />

            <Input
              ref={passwordRef}
              label="密码"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
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
              required
            />

            {/* 记住我 + 忘记密码 */}
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
                className="text-sm font-medium text-primary-400 hover:text-primary-500 transition-colors"
              >
                忘记密码？
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
                <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </p>
              </div>
            )}

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
        )}

        {/* 验证码登录表单 */}
        {mode === "sms" && (
          <form
            onSubmit={handleSmsSubmit}
            className="space-y-[30px] max-sm:space-y-5"
          >
            <Input
              label="手机号"
              type="tel"
              value={smsPhone}
              onChange={(e) => {
                setSmsPhone(e.target.value.replace(/\D/g, "").slice(0, 11));
                if (error) setError("");
              }}
              placeholder="请输入手机号"
              autoComplete="tel"
              size="large"
              maxLength={11}
              suffix={<Phone className="w-5 h-5 text-gray-400" />}
              required
            />

            {/* 验证码 + 发送按钮 */}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  ref={smsCodeRef}
                  label="验证码"
                  type="text"
                  inputMode="numeric"
                  value={smsCode}
                  onChange={(e) => {
                    setSmsCode(
                      e.target.value.replace(/\D/g, "").slice(0, SMS_CODE_LENGTH),
                    );
                    if (error) setError("");
                  }}
                  placeholder={`请输入${SMS_CODE_LENGTH}位验证码`}
                  autoComplete="one-time-code"
                  size="large"
                  maxLength={SMS_CODE_LENGTH}
                  suffix={<KeyRound className="w-5 h-5 text-gray-400" />}
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleSendSmsCode}
                disabled={smsCountdown > 0 || sendingSms}
                className="h-[54px] px-4 text-sm font-semibold text-primary-400 border border-primary-200 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {sendingSms
                  ? "发送中..."
                  : smsCountdown > 0
                    ? `${smsCountdown}s`
                    : "获取验证码"}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
                <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </p>
              </div>
            )}

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
        )}

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

        {/* 测试账号折叠区域 - 仅开发环境，只对密码登录展示 */}
        {mode === "password" &&
          import.meta.env.VITE_PRODUCTION_MODE !== "true" &&
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
