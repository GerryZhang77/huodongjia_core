/**
 * 测试登录 API - Apifox Mock
 */

import { useState } from "react";
import { Button, Toast, Input, Space } from "antd-mobile";
import { api } from "@/services/api";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
  error?: string;
}

export default function TestLoginPage() {
  const [phone, setPhone] = useState("13800138000");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);

  // 测试密码登录
  const testPasswordLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("🚀 开始测试密码登录...");
      console.log("📤 请求参数:", { phone, password });

      const data = (await api.post("/api/auth/login", {
        phone,
        password,
      })) as ApiResponse;

      console.log("📥 响应数据:", data);

      setResult(data);

      if (data.success) {
        Toast.show({
          icon: "success",
          content: "登录成功！",
        });
      } else {
        Toast.show({
          icon: "fail",
          content: data.message || "登录失败",
        });
      }
    } catch (error) {
      console.error("❌ 请求错误:", error);
      Toast.show({
        icon: "fail",
        content: "网络错误",
      });
      setResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  // 测试验证码登录
  const testSmsLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("🚀 开始测试验证码登录...");
      console.log("📤 请求参数:", { phone, code: "123456" });

      const data = (await api.post("/api/auth/login", {
        phone,
        code: "123456",
      })) as ApiResponse;

      console.log("📥 响应数据:", data);

      setResult(data);

      if (data.success) {
        Toast.show({
          icon: "success",
          content: "登录成功！",
        });
      } else {
        Toast.show({
          icon: "fail",
          content: data.message || "登录失败",
        });
      }
    } catch (error) {
      console.error("❌ 请求错误:", error);
      Toast.show({
        icon: "fail",
        content: "网络错误",
      });
      setResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🧪 登录 API 测试
        </h1>

        <Space direction="vertical" block style={{ "--gap": "16px" }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              手机号
            </label>
            <Input
              placeholder="请输入手机号"
              value={phone}
              onChange={setPhone}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <Input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={setPassword}
            />
          </div>

          <Button
            block
            color="primary"
            size="large"
            loading={loading}
            onClick={testPasswordLogin}
          >
            测试密码登录
          </Button>

          <Button
            block
            color="default"
            size="large"
            loading={loading}
            onClick={testSmsLogin}
          >
            测试验证码登录
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">响应结果：</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded text-sm">
            <p className="font-semibold mb-2">💡 测试说明：</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>
                确保已启动 Mock 模式: <code>npm run dev:mock</code>
              </li>
              <li>打开浏览器控制台查看详细日志</li>
              <li>检查 Network 标签查看请求详情</li>
            </ul>
          </div>
        </Space>
      </div>
    </div>
  );
}
