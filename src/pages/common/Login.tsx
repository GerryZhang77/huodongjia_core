import React from "react";
import { LoginForm } from "@/features/auth";

/**
 * 登录页面
 * MVP 版本 - 仅提供账号密码登录方式，无注册入口
 */
const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <LoginForm />

        {/* MVP 版本：暂无注册入口，账号由管理员分配 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">还没有账号？请联系管理员获取</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
