import React, { useState } from "react";
import { Eye, EyeOff, User, Lock, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useLogin } from "../../hooks";
import { TEST_ACCOUNTS } from "../../utils";

/**
 * 登录表单组件
 * 现代化设计 - 统一视觉风格 + 渐变背景 + 玻璃态效果
 */
export const LoginForm: React.FC = () => {
  const { login, loading } = useLogin();
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showTestAccounts, setShowTestAccounts] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!identifier) {
      setError("请输入账号");
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
    <div className="w-full max-w-md mx-auto px-4">
      {/* Logo 区域 - 带动画效果 */}
      <div className="text-center mb-8 animate-fade-in">
        {/* Logo 图标 - 渐变背景 + 阴影 */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-500 rounded-3xl blur-xl opacity-60 animate-pulse-slow" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          活动家平台
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          欢迎回来，开启精彩活动之旅 ✨
        </p>

        {/* 开发环境提示 */}
        {import.meta.env.VITE_PRODUCTION_MODE !== "true" &&
          import.meta.env.DEV && (
            <div className="mt-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl inline-block">
              <p className="text-xs text-amber-800 flex items-center gap-1">
                <Info className="w-3 h-3" />
                开发环境 | Chrome 密码警告可忽略
              </p>
            </div>
          )}
      </div>

      {/* 登录卡片 - 玻璃态效果 */}
      <Card className="backdrop-blur-xl bg-white/90 shadow-2xl border border-white/20 overflow-hidden p-6">
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
          {/* 账号输入 */}
          <div className="w-full">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1.5">
              <User className="w-4 h-4 text-primary-500" />
              <span>账号</span>
            </label>
            <Input
              type="text"
              name="login-identifier"
              placeholder="请输入账号"
              autoComplete="off"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) =>
                e.key === "Enter" && handleSubmit()
              }
            />
          </div>

          {/* 密码输入 */}
          <div className="w-full">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1.5">
              <Lock className="w-4 h-4 text-primary-500" />
              <span>密码</span>
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              name="login-password"
              placeholder="请输入密码"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              onKeyDown={(e: React.KeyboardEvent) =>
                e.key === "Enter" && handleSubmit()
              }
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-error-50 border border-error-200 rounded-lg animate-shake">
              <p className="text-sm text-error-600 flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* 登录按钮 */}
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            className="w-full"
          >
            立即登录
          </Button>

          {/* 测试账号折叠区域 - 仅开发环境 */}
          {import.meta.env.VITE_PRODUCTION_MODE !== "true" &&
            import.meta.env.DEV && (
              <div className="pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTestAccounts(!showTestAccounts)}
          className="mx-auto flex flex-nowrap items-center gap-2 whitespace-nowrap text-sm text-gray-600 transition-colors hover:text-primary-500 [&>svg]:shrink-0"
                >
                  <Info className="w-4 h-4" />
                  <span>{showTestAccounts ? "收起" : "查看"}测试账号</span>
                </button>

                {showTestAccounts && (
                  <div className="mt-4 space-y-2.5 animate-fade-in">
                    {TEST_ACCOUNTS.map((account) => (
                      <div
                        key={account.value}
                        className="p-3.5 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-gray-900">
                            {account.label}
                          </span>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleQuickFill(account)}
                            className="h-7 px-3 text-xs"
                          >
                            快速填充
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          账号:{" "}
                          <code className="px-1 py-0.5 bg-gray-100 rounded">
                            {account.value}
                          </code>{" "}
                          | {account.description}
                        </p>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400 text-center pt-2">
                      ⚠️ 此区域仅在开发环境显示
                    </p>
                  </div>
                )}
              </div>
            )}
        </form>
      </Card>
    </div>
  );
};
