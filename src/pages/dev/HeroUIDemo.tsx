/**
 * HeroUI v3 组件演示页面
 * 用于验证 HeroUI 集成是否成功
 */
import {
  Button,
  Card,
  Chip,
  Input,
  Label,
  Switch,
  TextField,
  Description,
} from "@heroui/react";
import { useState } from "react";

export default function HeroUIDemo() {
  const [switchValue, setSwitchValue] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            HeroUI v3 组件演示
          </h1>
          <p className="text-gray-500">
            验证 TailwindCSS v4 + HeroUI v3 集成成功
          </p>
        </div>

        {/* 按钮演示 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Button 按钮</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="danger-soft">Danger Soft</Button>
            <Button isDisabled>Disabled</Button>
          </div>
        </Card>

        {/* 输入框演示 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">TextField 输入框</h2>
          <div className="space-y-4">
            <TextField
              className="w-full"
              name="username"
              value={inputValue}
              onChange={setInputValue}
            >
              <Label>用户名</Label>
              <Input placeholder="请输入用户名" />
              <Description>请输入您的用户名</Description>
            </TextField>

            <TextField className="w-full" name="password">
              <Label>密码</Label>
              <Input type="password" placeholder="请输入密码" />
            </TextField>

            <TextField className="w-full" name="email">
              <Label>邮箱</Label>
              <Input type="email" placeholder="请输入邮箱" />
              <Description>我们不会分享您的邮箱</Description>
            </TextField>
          </div>
        </Card>

        {/* Chip 标签演示 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Chip 标签</h2>
          <div className="flex flex-wrap gap-2">
            <Chip color="default">Default</Chip>
            <Chip color="accent">Accent</Chip>
            <Chip color="success">Success</Chip>
            <Chip color="warning">Warning</Chip>
            <Chip color="danger">Danger</Chip>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Chip variant="primary" color="accent">
              Primary
            </Chip>
            <Chip variant="secondary" color="accent">
              Secondary
            </Chip>
            <Chip variant="tertiary" color="accent">
              Tertiary
            </Chip>
            <Chip variant="soft" color="accent">
              Soft
            </Chip>
          </div>
        </Card>

        {/* Switch 开关演示 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Switch 开关</h2>
          <div className="flex items-center gap-4">
            <Switch isSelected={switchValue} onChange={setSwitchValue}>
              <Label>启用通知</Label>
            </Switch>
            <span className="text-sm text-gray-500">
              当前状态: {switchValue ? "开启" : "关闭"}
            </span>
          </div>
        </Card>

        {/* 品牌色彩展示 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">品牌色彩系统</h2>
          <div className="grid grid-cols-5 gap-2">
            {/* 主色 */}
            <div className="space-y-1">
              <div className="h-10 rounded bg-primary-500"></div>
              <p className="text-xs text-center">Primary</p>
            </div>
            {/* 辅助色 */}
            <div className="space-y-1">
              <div className="h-10 rounded bg-secondary-500"></div>
              <p className="text-xs text-center">Secondary</p>
            </div>
            {/* 点缀色 */}
            <div className="space-y-1">
              <div className="h-10 rounded bg-accent-500"></div>
              <p className="text-xs text-center">Accent</p>
            </div>
            {/* 警告色 */}
            <div className="space-y-1">
              <div className="h-10 rounded bg-warning-500"></div>
              <p className="text-xs text-center">Warning</p>
            </div>
            {/* 错误色 */}
            <div className="space-y-1">
              <div className="h-10 rounded bg-error-500"></div>
              <p className="text-xs text-center">Error</p>
            </div>
          </div>
        </Card>

        {/* 返回链接 */}
        <div className="text-center">
          <a
            href="/dev/components"
            className="text-primary-500 hover:text-primary-600 underline"
          >
            返回组件展示页
          </a>
        </div>
      </div>
    </div>
  );
}
