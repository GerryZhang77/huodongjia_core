/**
 * InputShowcase - 输入组件展示模块
 */

import { FC } from "react";
import { Input, Textarea, SearchInput } from "@/components/ui";
import { UserOutline, LockOutline, MailOutline } from "antd-mobile-icons";

const InputShowcase: FC = () => {
  return (
    <div className="space-y-8">
      {/* 基础输入框 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          基础输入框 (Input)
        </h3>
        <div className="space-y-4 max-w-md">
          <Input placeholder="请输入用户名" />
          <Input label="邮箱" placeholder="example@email.com" required />
          <Input
            label="密码"
            type="password"
            placeholder="请输入密码"
            helperText="密码至少 8 位"
          />
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Input placeholder="请输入用户名" />
<Input label="邮箱" required />
<Input type="password" helperText="密码至少 8 位" />`}</code>
        </pre>
      </div>

      {/* 带图标 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          带图标输入框
        </h3>
        <div className="space-y-4 max-w-md">
          <Input prefix={<UserOutline />} placeholder="用户名" label="用户名" />
          <Input prefix={<MailOutline />} placeholder="邮箱" label="邮箱" />
          <Input
            prefix={<LockOutline />}
            type="password"
            placeholder="密码"
            label="密码"
          />
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`import { UserOutline } from 'antd-mobile-icons';

<Input 
  prefix={<UserOutline />} 
  placeholder="用户名"
/>`}</code>
        </pre>
      </div>

      {/* 尺寸展示 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          输入框尺寸 (Size)
        </h3>
        <div className="space-y-4 max-w-md">
          <div>
            <div className="text-sm text-gray-600 mb-2">Large (44px)</div>
            <Input size="large" placeholder="大输入框" />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">
              Medium (40px) ⭐ 默认
            </div>
            <Input size="medium" placeholder="默认输入框" />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Small (32px)</div>
            <Input size="small" placeholder="小输入框" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          输入框圆角统一为 10px，背景色为 #F8FAFC
        </p>
      </div>

      {/* 状态展示 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          输入框状态 (Status)
        </h3>
        <div className="space-y-4 max-w-md">
          <Input status="default" placeholder="默认状态" />
          <Input status="error" value="invalid@" helperText="邮箱格式不正确" />
          <Input
            status="success"
            value="valid@email.com"
            helperText="验证通过"
          />
          <Input status="warning" value="张三" helperText="用户名已存在" />
          <Input disabled placeholder="禁用状态" />
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Input status="error" helperText="邮箱格式不正确" />
<Input status="success" helperText="验证通过" />
<Input disabled placeholder="禁用状态" />`}</code>
        </pre>
      </div>

      {/* 多行文本 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          多行文本 (Textarea)
        </h3>
        <div className="space-y-4 max-w-md">
          <Textarea rows={3} placeholder="请输入活动描述..." />
          <Textarea
            label="活动详情"
            rows={4}
            placeholder="详细描述活动内容..."
            required
          />
          <Textarea rows={4} maxLength={200} placeholder="最多 200 字" />
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Textarea 
  rows={4} 
  placeholder="请输入..." 
/>

<Textarea 
  maxLength={200}
  placeholder="最多 200 字"
/>`}</code>
        </pre>
      </div>

      {/* 搜索输入框 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          搜索输入框 (SearchInput)
        </h3>
        <div className="space-y-4 max-w-md">
          <SearchInput
            placeholder="搜索活动..."
            onSearch={(value) => console.log("搜索:", value)}
          />
          <SearchInput
            placeholder="搜索用户..."
            onSearch={(value) => console.log("搜索:", value)}
          />
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<SearchInput 
  placeholder="搜索活动..." 
  onSearch={(value) => handleSearch(value)}
/>

<SearchInput 
  placeholder="搜索用户..."
  onSearch={(value) => handleSearch(value)}
/>`}</code>
        </pre>
      </div>

      {/* 实际应用 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          实际应用示例
        </h3>
        <div className="space-y-6 max-w-md">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              登录表单
            </h4>
            <div className="space-y-3">
              <Input
                prefix={<UserOutline />}
                placeholder="手机号/邮箱"
                label="账号"
                required
              />
              <Input
                prefix={<LockOutline />}
                type="password"
                placeholder="请输入密码"
                label="密码"
                required
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              创建活动
            </h4>
            <div className="space-y-3">
              <Input label="活动标题" placeholder="输入活动名称" required />
              <Textarea
                label="活动描述"
                rows={4}
                placeholder="详细描述活动内容、时间、地点等..."
                required
              />
              <Input
                label="活动地点"
                placeholder="如: 北京市朝阳区..."
                required
              />
              <Input
                type="number"
                label="最大人数"
                placeholder="0"
                helperText="0 表示不限制"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 设计规范 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          📐 设计规范
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ 圆角: 10px (rounded-[10px])</li>
          <li>✅ 尺寸: Large(44px) / Medium(40px) / Small(32px)</li>
          <li>✅ 聚焦: 蓝色边框 + 蓝色光晕阴影</li>
          <li>✅ 状态: default / error / success / warning / disabled</li>
          <li>✅ 支持前后图标、计数器、清除按钮</li>
          <li>⚠️ 必填字段添加 required 标记</li>
        </ul>
      </div>
    </div>
  );
};

export default InputShowcase;
