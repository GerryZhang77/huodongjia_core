/**
 * 注册表单组件
 * 学号 + 密码注册，支持自定义头像
 */

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "@/components/ui";
import { useRegister } from "@/features/auth/hooks";
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Camera, User } from "lucide-react";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useRegister();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError("");

    if (!account) {
      setFormError("请输入学号");
      return;
    }
    if (!/^\d+$/.test(account)) {
      setFormError("学号只能包含数字");
      return;
    }
    if (account.length < 2 || account.length > 20) {
      setFormError("学号长度需在 2-20 位之间");
      return;
    }
    if (!password) {
      setFormError("请设置密码");
      return;
    }
    if (password.length < 6) {
      setFormError("密码至少 6 位");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("两次密码输入不一致");
      return;
    }

    await register(account, password, avatarFile || undefined);
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
            使用学号注册，开启精彩活动之旅
          </p>
        </div>

        {/* 头像选择 */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              onClick={handleAvatarClick}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-300 dark:text-gray-500" />
              )}
            </div>
            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 w-6 h-6 bg-primary-400 rounded-full flex items-center justify-center shadow-md hover:bg-primary-500 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {avatarPreview ? "点击更换头像" : "点击上传头像（可选）"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 学号 */}
          <Input
            label="学号"
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
            placeholder="请输入学号（如 56785679）"
            size="large"
            prefix={<User className="w-5 h-5 text-gray-400" />}
            maxLength={20}
            required
          />

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
