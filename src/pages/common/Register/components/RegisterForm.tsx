/**
 * 注册表单组件
 *
 * 采用手机号 + 验证码注册方式
 * 包含：手机号输入、验证码、密码设置、协议勾选
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Modal, Checkbox, Button } from "@/components/ui";
import { UserAgreement, PrivacyPolicy } from "@/components/legal";
import { useRegister } from "@/features/auth/hooks";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  ArrowLeft,
} from "lucide-react";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, sendSmsCode, loading, sendingCode } = useRegister();

  // 表单状态
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");

  // 验证码倒计时
  const [countdown, setCountdown] = useState(0);

  // 协议弹窗状态
  const [showUserAgreement, setShowUserAgreement] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 验证手机号格式
  const isValidPhone = (phone: string) => /^1[3-9]\d{9}$/.test(phone);

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone) {
      setError("请输入手机号");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("请输入正确的手机号");
      return;
    }

    setError("");
    const success = await sendSmsCode(phone);
    if (success) {
      setCountdown(60);
    }
  };

  // 提交注册
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    // 表单验证
    if (!phone) {
      setError("请输入手机号");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("请输入正确的手机号");
      return;
    }
    if (!smsCode) {
      setError("请输入验证码");
      return;
    }
    if (smsCode.length !== 6) {
      setError("请输入6位验证码");
      return;
    }
    if (!password) {
      setError("请设置密码");
      return;
    }
    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      return;
    }
    if (!agreeTerms) {
      setError("请先阅读并同意用户协议和隐私政策");
      return;
    }

    const success = await register(phone, smsCode, password);

    if (success) {
      // 注册成功后 hook 会自动登录并跳转
      // 如果需要跳转到登录页，可以在 hook 中调整
    }
  };

  return (
    <div className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-[30px] shadow-2xl overflow-hidden">
      <div className="px-[50px] py-12 max-md:px-8 max-md:py-10 max-sm:px-6 max-sm:py-8">
        {/* 返回按钮 */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回登录</span>
        </button>

        {/* 标题区域 */}
        <div className="text-center mb-10 max-sm:mb-8">
          <div
            className="w-16 h-16 max-sm:w-14 max-sm:h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              background: "linear-gradient(to right, #4facfe, #00c6ff)",
            }}
          >
            <Shield className="w-8 h-8 max-sm:w-6 max-sm:h-6 text-white" />
          </div>
          <h1 className="text-2xl max-sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            创建账号
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            使用手机号快速注册，开启精彩活动之旅
          </p>
        </div>

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 手机号输入 */}
          <Input
            label="手机号"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="请输入手机号"
            size="large"
            prefix={<Phone className="w-5 h-5 text-gray-400" />}
            maxLength={11}
            required
          />

          {/* 验证码输入 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="验证码"
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                placeholder="请输入6位验证码"
                size="large"
                maxLength={6}
                required
              />
            </div>
            <div className="pt-[26px]">
              <Button
                type="button"
                variant={countdown > 0 ? "outline" : "primary"}
                disabled={countdown > 0 || sendingCode}
                onClick={handleSendCode}
                loading={sendingCode}
                className="h-[50px] px-4 whitespace-nowrap"
              >
                {countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
              </Button>
            </div>
          </div>

          {/* 密码输入 */}
          <Input
            label="设置密码"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请设置6位以上密码"
            size="large"
            prefix={<Lock className="w-5 h-5 text-gray-400" />}
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

          {/* 确认密码 */}
          <Input
            label="确认密码"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入密码"
            size="large"
            prefix={<Lock className="w-5 h-5 text-gray-400" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
            required
          />

          {/* 用户协议勾选 */}
          <div className="flex items-start gap-2">
            <Checkbox
              checked={agreeTerms}
              onChange={(checked) => setAgreeTerms(checked)}
              size="small"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              我已阅读并同意
              <button
                type="button"
                onClick={() => setShowUserAgreement(true)}
                className="text-primary-400 hover:text-primary-500 mx-0.5"
              >
                《用户协议》
              </button>
              和
              <button
                type="button"
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-primary-400 hover:text-primary-500 mx-0.5"
              >
                《隐私政策》
              </button>
            </span>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* 注册按钮 */}
          <Button
            type="submit"
            block
            size="large"
            loading={loading}
            disabled={loading}
            className="mt-6"
          >
            注册
          </Button>
        </form>

        {/* 登录链接 */}
        <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          已有账号？
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="ml-1 font-semibold text-primary-400 hover:text-primary-500 transition-colors"
          >
            立即登录
          </button>
        </p>
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

export default RegisterForm;
