/**
 * 忘记密码表单组件
 *
 * 采用手机号 + 验证码重置密码方式
 * 步骤：1. 输入手机号发送验证码 → 2. 验证码验证 → 3. 设置新密码
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "@/components/ui";
import { useForgotPassword } from "@/features/auth/hooks";

const SMS_CODE_LENGTH = 4;
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

// 步骤枚举
type Step = "phone" | "verify" | "reset" | "success";

export const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { sendSmsCode, resetPassword, loading, sendingCode } =
    useForgotPassword();

  // 当前步骤
  const [step, setStep] = useState<Step>("phone");

  // 表单状态
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  // 验证码倒计时
  const [countdown, setCountdown] = useState(0);

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
      setStep("verify");
    }
  };

  // 进入"重置密码"步骤
  //
  // 安全考虑：阿里云验证码在校验成功后即失效，如果这里提前调用 /verify-code，
  // 后续的 /reset-password-by-sms 将无法再次校验。因此此步骤只做前端格式校验，
  // 真正的验证码消费在 resetPassword 接口内部完成。
  const handleVerifyCode = () => {
    if (!smsCode) {
      setError("请输入验证码");
      return;
    }
    if (smsCode.length !== SMS_CODE_LENGTH) {
      setError(`请输入${SMS_CODE_LENGTH}位验证码`);
      return;
    }
    setError("");
    setStep("reset");
  };

  // 重置密码
  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("请输入新密码");
      return;
    }
    if (newPassword.length < 6) {
      setError("密码至少6位");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次密码输入不一致");
      return;
    }

    setError("");
    const success = await resetPassword(phone, smsCode, newPassword);
    if (success) {
      setStep("success");
    }
  };

  // 渲染步骤指示器
  const renderStepIndicator = () => {
    const steps = [
      { key: "phone", label: "验证手机" },
      { key: "verify", label: "输入验证码" },
      { key: "reset", label: "重置密码" },
    ];

    const currentIndex = steps.findIndex((s) => s.key === step);

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, index) => (
          <React.Fragment key={s.key}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                index <= currentIndex
                  ? "bg-primary-400 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 rounded transition-colors ${
                  index < currentIndex
                    ? "bg-primary-400"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // 渲染手机号输入步骤
  const renderPhoneStep = () => (
    <div className="space-y-5">
      <Input
        label="手机号"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="请输入注册时的手机号"
        size="large"
        prefix={<Phone className="w-5 h-5 text-gray-400" />}
        maxLength={11}
        required
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        </div>
      )}

      <Button
        type="button"
        block
        size="large"
        loading={sendingCode}
        disabled={sendingCode}
        onClick={handleSendCode}
      >
        发送验证码
      </Button>
    </div>
  );

  // 渲染验证码验证步骤
  const renderVerifyStep = () => (
    <div className="space-y-5">
      <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-4">
        验证码已发送至 <span className="font-semibold">{phone}</span>
      </p>

      <Input
        label="验证码"
        type="text"
        inputMode="numeric"
        value={smsCode}
        onChange={(e) =>
          setSmsCode(e.target.value.replace(/\D/g, "").slice(0, SMS_CODE_LENGTH))
        }
        placeholder={`请输入${SMS_CODE_LENGTH}位验证码`}
        size="large"
        maxLength={SMS_CODE_LENGTH}
        required
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSendCode}
          disabled={countdown > 0 || sendingCode}
          className={`text-sm ${
            countdown > 0
              ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "text-primary-400 hover:text-primary-500"
          }`}
        >
          {countdown > 0 ? `${countdown}s 后重新发送` : "重新发送验证码"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="large"
          onClick={() => {
            setStep("phone");
            setError("");
          }}
          className="flex-1"
        >
          上一步
        </Button>
        <Button
          type="button"
          size="large"
          loading={loading}
          disabled={loading}
          onClick={handleVerifyCode}
          className="flex-1"
        >
          下一步
        </Button>
      </div>
    </div>
  );

  // 渲染重置密码步骤
  const renderResetStep = () => (
    <div className="space-y-5">
      <Input
        label="新密码"
        type={showNewPassword ? "text" : "password"}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="请设置6位以上新密码"
        size="large"
        prefix={<Lock className="w-5 h-5 text-gray-400" />}
        suffix={
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showNewPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        }
        required
      />

      <Input
        label="确认新密码"
        type={showConfirmPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="请再次输入新密码"
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

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        </div>
      )}

      <Button
        type="button"
        block
        size="large"
        loading={loading}
        disabled={loading}
        onClick={handleResetPassword}
      >
        重置密码
      </Button>
    </div>
  );

  // 渲染成功步骤
  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10 text-success-500" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          密码重置成功
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          请使用新密码登录您的账号
        </p>
      </div>
      <Button
        type="button"
        block
        size="large"
        onClick={() => navigate("/login", { replace: true })}
      >
        返回登录
      </Button>
    </div>
  );

  return (
    <div className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-[30px] shadow-2xl overflow-hidden">
      <div className="px-[50px] py-12 max-md:px-8 max-md:py-10 max-sm:px-6 max-sm:py-8">
        {/* 返回按钮 - 成功页面不显示 */}
        {step !== "success" && (
          <button
            type="button"
            onClick={() => navigate("/login")}
          className="mb-6 flex flex-nowrap items-center gap-2 whitespace-nowrap text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 [&>svg]:shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回登录</span>
          </button>
        )}

        {/* 标题区域 - 成功页面不显示 */}
        {step !== "success" && (
          <div className="text-center mb-8 max-sm:mb-6">
            <div
              className="w-16 h-16 max-sm:w-14 max-sm:h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{
                background: "linear-gradient(to right, #4facfe, #00c6ff)",
              }}
            >
              <KeyRound className="w-8 h-8 max-sm:w-6 max-sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl max-sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              找回密码
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              通过手机验证码重置您的账号密码
            </p>
          </div>
        )}

        {/* 步骤指示器 - 成功页面不显示 */}
        {step !== "success" && renderStepIndicator()}

        {/* 根据步骤渲染内容 */}
        {step === "phone" && renderPhoneStep()}
        {step === "verify" && renderVerifyStep()}
        {step === "reset" && renderResetStep()}
        {step === "success" && renderSuccessStep()}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
