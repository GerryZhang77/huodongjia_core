import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Input,
  Card,
  Toast,
  Selector,
  Checkbox,
  Space
} from 'antd-mobile'
import {
  EyeInvisibleOutline,
  EyeOutline,
  UserOutline,
  LockOutline
} from 'antd-mobile-icons'
import { useStore } from '../store'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { setToken, setUser } = useStore()
  
  const [selectedAccount, setSelectedAccount] = useState<string[]>(['org1'])
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(true)
  const [loading, setLoading] = useState(false)

  // 测试账号选项
  const accountOptions = [
    {
      label: 'org1 (测试商家账号)',
      value: 'org1',
      description: '密码: 123456'
    },
    {
      label: 'admin1 (管理员账号)',
      value: 'admin1',
      description: '密码: admin123'
    }
  ]

  const handleLogin = async () => {
    if (!selectedAccount.length) {
      Toast.show('请选择登录账号')
      return
    }

    if (!password) {
      Toast.show('请输入密码')
      return
    }

    if (!agreed) {
      Toast.show('请同意隐私政策和用户协议')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: selectedAccount[0],
          password: password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setToken(data.token)
        setUser(data.user)
        Toast.show('登录成功')
        navigate('/dashboard')
      } else {
        Toast.show(data.message || '登录失败')
      }
    } catch (error) {
      console.error('Login error:', error)
      Toast.show('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-blue flex flex-col">
      {/* 顶部Logo区域 */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Logo和标题 */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <div className="text-3xl">🎯</div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">活动家</h1>
            <p className="text-blue-100">智能活动管理平台</p>
          </div>

          {/* 登录表单 */}
          <Card 
            className="fade-in"
            style={{ 
              '--border-radius': '16px',
              '--body-padding': '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="space-y-6">
              {/* 账号选择 */}
              <div>
                <div className="flex items-center mb-3">
                  <UserOutline className="text-gray-400 mr-2" />
                  <span className="text-gray-700 font-medium">选择账号</span>
                </div>
                <Selector
                  options={accountOptions}
                  value={selectedAccount}
                  onChange={setSelectedAccount}
                  style={{
                    '--border-radius': '12px',
                    '--border': '1px solid #e5e7eb',
                    '--checked-color': '#1890ff'
                  }}
                />
                
                {/* 测试账号提示 */}
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium mb-1">测试账号信息：</div>
                  <div className="text-xs text-blue-500 space-y-1">
                    <div>• org1 / 123456 (商家账号)</div>
                    <div>• admin1 / admin123 (管理员)</div>
                  </div>
                </div>
              </div>

              {/* 密码输入 */}
              <div>
                <div className="flex items-center mb-3">
                  <LockOutline className="text-gray-400 mr-2" />
                  <span className="text-gray-700 font-medium">登录密码</span>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={password}
                  onChange={setPassword}
                  suffix={
                    <div onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOutline /> : <EyeInvisibleOutline />}
                    </div>
                  }
                  style={{
                    '--border-radius': '12px',
                    '--border-color': '#e5e7eb',
                    '--font-size': '16px',
                    '--padding-left': '16px',
                    '--padding-right': '16px'
                  }}
                />
              </div>

              {/* 协议同意 */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={agreed}
                  onChange={setAgreed}
                  style={{
                    '--icon-size': '18px',
                    '--font-size': '14px'
                  }}
                />
                <div className="text-sm text-gray-600 leading-relaxed">
                  我已阅读并同意
                  <span className="text-blue-500 mx-1">《隐私政策》</span>
                  和
                  <span className="text-blue-500 mx-1">《用户协议》</span>
                </div>
              </div>

              {/* 登录按钮 */}
              <Button
                color="primary"
                size="large"
                block
                loading={loading}
                onClick={handleLogin}
                disabled={!selectedAccount.length || !password || !agreed}
                style={{
                  '--border-radius': '12px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                {loading ? '登录中...' : '立即登录'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className="text-center py-6">
        <p className="text-blue-100 text-sm">© 2024 活动家. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Login