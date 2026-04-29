/**
 * 注册表单组件
 * 手机号 + 验证码 + 密码注册
 */

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "@/components/ui";
import { useRegister } from "@/features/auth/hooks";
import { checkAccount, checkPhone } from "@/features/auth/services/authApi";
import { Lock, Eye, EyeOff, AlertCircle, Phone, Shield, User, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

type AvailabilityStatus = "idle" | "checking" | "available" | "taken";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, sendCode, loading, sendingCode, countdown, error, clearError } = useRegister();

  const [phone, setPhone] = useState("");
  const [phoneStatus, setPhoneStatus] = useState<AvailabilityStatus>("idle");
  const [smsCode, setSmsCode] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<AvailabilityStatus>("idle");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setUsernameStatus("idle");
  };

  const handleUsernameBlur = async () => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return;
    setUsernameStatus("checking");
    const res = await checkAccount(username);
    setUsernameStatus(res.available ? "available" : "taken");
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setPhoneStatus("idle");
  };

  const handlePhoneBlur = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) return;
    setPhoneStatus("checking");
    const res = await checkPhone(phone);
    setPhoneStatus(res.available ? "available" : "taken");
  };

  const handleSendCode = async () => {
    setFormError("");
    clearError();
    if (!phone) {
      setFormError("请输入手机号");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setFormError("请输入正确的手机号");
      return;
    }
    if (phoneStatus === "taken") {
      setFormError("该手机号已注册");
      return;
    }
    await sendCode(phone);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError("");
    clearError();

    if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setFormError("请输入正确的用户名（3-20位字母、数字或下划线）");
      return;
    }
    if (usernameStatus === "taken") {
      setFormError("该用户名已被使用");
      return;
    }
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setFormError("请输入正确的手机号");
      return;
    }
    if (phoneStatus === "taken") {
      setFormError("该手机号已注册");
      return;
    }
    if (!smsCode || !/^\d{4,6}$/.test(smsCode)) {
      setFormError("请输入正确的验证码");
      return;
    }
    if (!password || password.length < 6) {
      setFormError("密码至少 6 位");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("两次密码输入不一致");
      return;
    }

    await register(phone, smsCode, password, username);
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

        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl max-sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            创建账号
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            使用手机号注册，开启精彩活动之旅
          </p>
        </div>

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 用户名 */}
          <div>
            <Input
              label="用户名"
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))}
              onBlur={handleUsernameBlur}
              placeholder="3-20位字母、数字或下划线"
              size="large"
              prefix={<User className="w-5 h-5 text-gray-400" />}
              suffix={
                usernameStatus === "available" ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                usernameStatus === "taken" ? <XCircle className="w-5 h-5 text-red-500" /> :
                usernameStatus === "checking" ? <span className="text-xs text-gray-400">检查中...</span> : null
              }
              maxLength={20}
              required
            />
            {usernameStatus === "available" && <p className="text-xs text-green-500 mt-1">用户名可用</p>}
            {usernameStatus === "taken" && <p className="text-xs text-red-500 mt-1">该用户名已被使用</p>}
          </div>

          {/* 手机号 */}
          <Input
            label="手机号"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value.replace(/\D/g, "").slice(0, 11))}
            onBlur={handlePhoneBlur}
            placeholder="请输入手机号"
            size="large"
            prefix={<Phone className="w-5 h-5 text-gray-400" />}
            suffix={
              phoneStatus === "available" ? <CheckCircle className="w-5 h-5 text-green-500" /> :
              phoneStatus === "taken" ? <XCircle className="w-5 h-5 text-red-500" /> :
              phoneStatus === "checking" ? <span className="text-xs text-gray-400">检查中...</span> : null
            }
            maxLength={11}
            required
          />
          {phoneStatus === "available" && <p className="text-xs text-green-500 mt-1">手机号可用</p>}
          {phoneStatus === "taken" && <p className="text-xs text-red-500 mt-1">该手机号已注册</p>}

          {/* 验证码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              验证码
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="请输入验证码"
                  size="large"
                  prefix={<Shield className="w-5 h-5 text-gray-400" />}
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={
                  countdown > 0 ||
                  sendingCode ||
                  !phone ||
                  phoneStatus === "checking" ||
                  phoneStatus === "taken"
                }
                className="flex-shrink-0 px-4 h-12 bg-primary-400 text-white text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-500 transition-colors whitespace-nowrap"
              >
                {sendingCode
                  ? "发送中..."
                  : countdown > 0
                    ? `${countdown}s 后重发`
                    : "获取验证码"}
              </button>
            </div>
          </div>

          {/* 密码 */}
          <Input
            label="设置密码"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请设置 6 位以上密码"
            size="large"
            prefix={<Lock className="w-5 h-5 text-gray-400" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
            required
          />

          {/* 错误提示 */}
          {(formError || error) && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError || error}</span>
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
    </div>
  );
};

export default RegisterForm;
