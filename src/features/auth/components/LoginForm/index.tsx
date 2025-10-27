/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button, Input, Card, Toast, Collapse } from "antd-mobile";
import {
  EyeInvisibleOutline,
  EyeOutline,
  UserOutline,
  LockOutline,
  InformationCircleOutline,
} from "antd-mobile-icons";
import { useLogin } from "../../hooks";
import { TEST_ACCOUNTS } from "../../utils";

/**
 * 登录表单组件
 * MVP 版本 - 简洁的账号密码登录方式
 */
export const LoginForm: React.FC = () => {
  const { login, loading } = useLogin();
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!identifier) {
      Toast.show({
        icon: "fail",
        content: "请输入账号",
      });
      return;
    }

    if (!password) {
      Toast.show({
        icon: "fail",
        content: "请输入密码",
      });
      return;
    }

    login({ identifier, password });
  };

  return (
    <Card
      className="w-full max-w-md shadow-lg"
      style={
        {
          "--border-radius": "16px",
          "--body-padding": "32px",
        } as any
      }
    >
      {/* Logo 区域 */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">活</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">活动家平台</h1>
        <p className="text-gray-500 text-sm mt-2">欢迎回来，请登录您的账号</p>
      </div>

      {/* 登录表单 */}
      <div className="space-y-4">
        {/* 账号输入 */}
        <div>
          <div className="flex items-center mb-2">
            <UserOutline className="text-gray-400 mr-2" />
            <span className="text-gray-700 font-medium text-sm">账号</span>
          </div>
          <Input
            placeholder="请输入账号"
            value={identifier}
            onChange={setIdentifier}
            onEnterPress={handleSubmit}
            clearable
            style={
              {
                "--border-radius": "12px",
                "--border-color": "var(--adm-border-color)",
                "--font-size": "16px",
                "--padding-left": "16px",
                "--padding-right": "16px",
              } as React.CSSProperties
            }
          />
        </div>

        {/* 密码输入 */}
        <div>
          <div className="flex items-center mb-2">
            <LockOutline className="text-gray-400 mr-2" />
            <span className="text-gray-700 font-medium text-sm">密码</span>
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="请输入密码"
            value={password}
            onChange={setPassword}
            onEnterPress={handleSubmit}
            {...({
              suffix: (
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer"
                >
                  {showPassword ? <EyeOutline /> : <EyeInvisibleOutline />}
                </div>
              ),
            } as any)}
            style={
              {
                "--border-radius": "12px",
                "--border-color": "var(--adm-border-color)",
                "--font-size": "16px",
                "--padding-left": "16px",
                "--padding-right": "16px",
              } as React.CSSProperties
            }
          />
        </div>

        {/* 登录按钮 */}
        <Button
          block
          color="primary"
          size="large"
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
          className="mt-6"
          style={
            {
              "--border-radius": "12px",
              "--background-color": "var(--color-primary-500)",
            } as any
          }
        >
          登录
        </Button>

        {/* 测试账号提示 - 仅开发环境显示 */}
        {import.meta.env.DEV && (
          <div className="mt-6">
            <Collapse>
              <Collapse.Panel
                key="test-accounts"
                title={
                  <div className="flex items-center text-sm text-gray-600">
                    <InformationCircleOutline className="mr-1" />
                    <span>查看测试账号</span>
                  </div>
                }
              >
                <div className="space-y-3 pt-2">
                  {TEST_ACCOUNTS.map((account) => (
                    <div
                      key={account.value}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {account.label}
                        </span>
                        <Button
                          size="mini"
                          fill="outline"
                          onClick={() => {
                            setIdentifier(account.value);
                            setPassword("123456"); // 默认密码
                            Toast.show({
                              icon: "success",
                              content: "已填充测试账号",
                            });
                          }}
                        >
                          快速填充
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        账号: {account.value} | {account.description}
                      </p>
                    </div>
                  ))}
                  <div className="text-xs text-gray-400 text-center mt-2">
                    ⚠️ 此区域仅在开发环境显示
                  </div>
                </div>
              </Collapse.Panel>
            </Collapse>
          </div>
        )}
      </div>
    </Card>
  );
};
