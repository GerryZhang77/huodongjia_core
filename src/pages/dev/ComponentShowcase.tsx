/**
 * ComponentShowcase - 组件展示页面
 *
 * 用途: 开发环境下展示和测试所有基础 UI 组件
 * 访问: /components (仅开发环境)
 *
 * 功能:
 * - 展示所有 Button 变体和状态
 * - 提供交互式示例
 * - 显示代码片段
 */

import { FC, useState } from "react";
import { Button, Card, Container, Stack, Grid } from "@/components/ui";
import {
  AddOutline,
  DeleteOutline,
  CheckOutline,
  CloseOutline,
  RightOutline,
} from "antd-mobile-icons";

const ComponentShowcase: FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // 模拟加载
  const handleLoadingTest = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 页面标题 */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            组件展示中心
          </h1>
          <p className="text-gray-500">
            活动家平台基础 UI 组件库 · 开发环境专用
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>注意</strong>: 此页面仅在开发环境可见，生产环境将自动隐藏
            </p>
          </div>
        </header>

        {/* Button 组件展示 */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-900">
                Button - 按钮组件
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                基于 primary-button.svg 设计稿实现
              </p>
            </div>

            <div className="p-6 space-y-10">
              {/* 1. 尺寸展示 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  1. 按钮尺寸 (Size)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Large */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">Large (48px)</div>
                    <Button size="large">立即报名</Button>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      <code>{`<Button size="large">立即报名</Button>`}</code>
                    </pre>
                  </div>

                  {/* Medium */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      Medium (40px) ⭐ 默认
                    </div>
                    <Button size="medium">确定</Button>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      <code>{`<Button>确定</Button>
// 或
<Button size="medium">确定</Button>`}</code>
                    </pre>
                  </div>

                  {/* Small */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">Small (32px)</div>
                    <Button size="small">保存</Button>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      <code>{`<Button size="small">保存</Button>`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* 2. 变体展示 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  2. 按钮变体 (Variant)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Primary */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      Primary - 主要按钮
                    </div>
                    <Button variant="primary">提交</Button>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      <code>{`<Button variant="primary">提交</Button>`}</code>
                    </pre>
                  </div>

                  {/* Secondary */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      Secondary - 次要按钮
                    </div>
                    <Button variant="secondary">取消</Button>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      <code>{`<Button variant="secondary">取消</Button>`}</code>
                    </pre>
                  </div>

                  {/* Text */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">Text - 文本按钮</div>
                    <Button variant="text">查看详情</Button>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      <code>{`<Button variant="text">查看详情</Button>`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* 3. 状态展示 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  3. 按钮状态 (State)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Default */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">Default - 默认</div>
                    <Button>默认状态</Button>
                    <div className="text-xs text-gray-400">悬停查看效果</div>
                  </div>

                  {/* Disabled */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">Disabled - 禁用</div>
                    <Button disabled>禁用状态</Button>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      <code>{`<Button disabled>禁用状态</Button>`}</code>
                    </pre>
                  </div>

                  {/* Loading */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      Loading - 加载中
                    </div>
                    <Button loading>加载中...</Button>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      <code>{`<Button loading>加载中...</Button>`}</code>
                    </pre>
                  </div>

                  {/* Interactive Loading */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">交互测试</div>
                    <Button loading={isLoading} onClick={handleLoadingTest}>
                      {isLoading ? "提交中..." : "点击测试"}
                    </Button>
                    <div className="text-xs text-gray-400">
                      点击查看加载效果
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. 带图标 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  4. 带图标按钮
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Button icon={<AddOutline />}>新增</Button>
                  <Button icon={<DeleteOutline />} variant="secondary">
                    删除
                  </Button>
                  <Button icon={<CheckOutline />} size="small">
                    确认
                  </Button>
                  <Button icon={<CloseOutline />} variant="text" size="small">
                    关闭
                  </Button>
                </div>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
                  <code>{`import { AddOutline, DeleteOutline } from 'antd-mobile-icons';

<Button icon={<AddOutline />}>新增</Button>
<Button icon={<DeleteOutline />} variant="secondary">
  删除
</Button>`}</code>
                </pre>
              </div>

              {/* 5. 块级按钮 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  5. 块级按钮 (Block)
                </h3>
                <div className="space-y-3 max-w-md">
                  <Button block>占满整行的按钮</Button>
                  <Button block variant="secondary">
                    次要块级按钮
                  </Button>
                </div>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
                  <code>{`<Button block>占满整行的按钮</Button>
<Button block variant="secondary">次要块级按钮</Button>`}</code>
                </pre>
              </div>

              {/* 6. 组合示例 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  6. 实际应用示例
                </h3>

                {/* 表单操作 */}
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      表单操作
                    </div>
                    <div className="flex gap-3">
                      <Button>提交</Button>
                      <Button variant="secondary">取消</Button>
                      <Button variant="text">重置</Button>
                    </div>
                  </div>

                  {/* 对话框操作 */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      对话框操作
                    </div>
                    <div className="flex gap-3">
                      <Button size="small">确定</Button>
                      <Button size="small" variant="secondary">
                        取消
                      </Button>
                    </div>
                  </div>

                  {/* 页面主操作 */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      页面主操作
                    </div>
                    <Button size="large" icon={<AddOutline />}>
                      创建新活动
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Card 组件展示 */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-900">
                Card - 卡片组件
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                内容分组展示的容器组件
              </p>
            </div>

            <div className="p-6 space-y-10">
              {/* 1. 基础卡片 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  1. 基础卡片
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">默认卡片</div>
                    <Card>
                      <p className="text-gray-900">这是一个基础卡片</p>
                      <p className="text-sm text-gray-500 mt-2">
                        包含默认的边框、阴影和圆角
                      </p>
                    </Card>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      <code>{`<Card>
  <p>这是一个基础卡片</p>
</Card>`}</code>
                    </pre>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">带标题的卡片</div>
                    <Card title="卡片标题">
                      <p className="text-gray-900">卡片内容...</p>
                    </Card>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      <code>{`<Card title="卡片标题">
  <p>卡片内容...</p>
</Card>`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* 2. 阴影和圆角 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  2. 阴影和圆角变体
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card shadow="sm" radius="sm" title="小阴影 + 小圆角">
                    <p className="text-sm text-gray-600">
                      shadow="sm" radius="sm"
                    </p>
                  </Card>
                  <Card shadow="md" radius="md" title="中等阴影 + 中等圆角">
                    <p className="text-sm text-gray-600">
                      shadow="md" radius="md"
                    </p>
                  </Card>
                  <Card shadow="lg" radius="xl" title="大阴影 + 大圆角">
                    <p className="text-sm text-gray-600">
                      shadow="lg" radius="xl"
                    </p>
                  </Card>
                </div>
              </div>

              {/* 3. 可悬停卡片 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  3. 可悬停卡片
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card
                    hoverable
                    title="活动卡片"
                    onClick={() => alert("卡片被点击")}
                  >
                    <p className="text-gray-900 mb-2">周末户外活动</p>
                    <p className="text-sm text-gray-500">
                      悬停查看效果，点击触发事件
                    </p>
                  </Card>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto self-start">
                    <code>{`<Card 
  hoverable 
  title="活动卡片"
  onClick={() => alert('卡片被点击')}
>
  <p>周末户外活动</p>
</Card>`}</code>
                  </pre>
                </div>
              </div>

              {/* 4. 带额外内容的卡片 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  4. 带额外内容
                </h3>
                <Card
                  title="活动设置"
                  extra={
                    <Button size="small" variant="text">
                      编辑 <RightOutline />
                    </Button>
                  }
                >
                  <p className="text-gray-900">
                    在卡片标题区域右侧添加额外的操作按钮或内容
                  </p>
                </Card>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-3 overflow-x-auto">
                  <code>{`<Card 
  title="活动设置" 
  extra={<Button size="small">编辑</Button>}
>
  <p>卡片内容...</p>
</Card>`}</code>
                </pre>
              </div>

              {/* 5. 内边距变体 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  5. 内边距变体
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card padding="none" title="无边距">
                    <div className="bg-gray-100 p-2">padding="none"</div>
                  </Card>
                  <Card padding="small" title="小边距">
                    <p className="text-sm">padding="small"</p>
                  </Card>
                  <Card padding="medium" title="中等边距">
                    <p className="text-sm">padding="medium"</p>
                  </Card>
                  <Card padding="large" title="大边距">
                    <p className="text-sm">padding="large"</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Container 组件展示 */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-900">
                Container - 容器组件
              </h2>
              <p className="text-sm text-gray-500 mt-1">页面内容的响应式容器</p>
            </div>

            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  不同最大宽度
                </h3>
                <div className="space-y-4">
                  <Container maxWidth="sm" padding="md" className="bg-blue-50">
                    <p className="text-sm">maxWidth="sm" - 最大宽度 640px</p>
                  </Container>
                  <Container maxWidth="md" padding="md" className="bg-green-50">
                    <p className="text-sm">maxWidth="md" - 最大宽度 768px</p>
                  </Container>
                  <Container
                    maxWidth="lg"
                    padding="md"
                    className="bg-purple-50"
                  >
                    <p className="text-sm">
                      maxWidth="lg" - 最大宽度 1024px (默认)
                    </p>
                  </Container>
                </div>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
                  <code>{`<Container maxWidth="lg">
  <h1>页面内容</h1>
</Container>`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Stack 组件展示 */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-900">
                Stack - 堆叠布局组件
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                简化 Flexbox 布局的组件
              </p>
            </div>

            <div className="p-6 space-y-10">
              {/* 垂直堆叠 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  1. 垂直堆叠
                </h3>
                <Stack direction="vertical" spacing={4}>
                  <div className="bg-blue-100 p-4 rounded">项目 1</div>
                  <div className="bg-blue-100 p-4 rounded">项目 2</div>
                  <div className="bg-blue-100 p-4 rounded">项目 3</div>
                </Stack>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
                  <code>{`<Stack direction="vertical" spacing={4}>
  <div>项目 1</div>
  <div>项目 2</div>
  <div>项目 3</div>
</Stack>`}</code>
                </pre>
              </div>

              {/* 水平堆叠 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  2. 水平堆叠
                </h3>
                <Stack direction="horizontal" spacing={4}>
                  <div className="bg-green-100 p-4 rounded">项目 1</div>
                  <div className="bg-green-100 p-4 rounded">项目 2</div>
                  <div className="bg-green-100 p-4 rounded">项目 3</div>
                </Stack>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
                  <code>{`<Stack direction="horizontal" spacing={4}>
  <div>项目 1</div>
  <div>项目 2</div>
</Stack>`}</code>
                </pre>
              </div>

              {/* 对齐方式 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  3. 对齐方式
                </h3>
                <Stack
                  direction="horizontal"
                  spacing={4}
                  align="center"
                  justify="between"
                >
                  <div className="bg-purple-100 p-4 rounded">左侧</div>
                  <div className="bg-purple-100 p-4 rounded h-20">
                    中间(较高)
                  </div>
                  <div className="bg-purple-100 p-4 rounded">右侧</div>
                </Stack>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
                  <code>{`<Stack 
  direction="horizontal" 
  spacing={4} 
  align="center" 
  justify="between"
>
  <div>左侧</div>
  <div>中间</div>
  <div>右侧</div>
</Stack>`}</code>
                </pre>
              </div>

              {/* 带分隔线 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  4. 带分隔线
                </h3>
                <Stack direction="vertical" spacing={0} divider>
                  <div className="p-4">项目 1</div>
                  <div className="p-4">项目 2</div>
                  <div className="p-4">项目 3</div>
                </Stack>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
                  <code>{`<Stack direction="vertical" spacing={0} divider>
  <div>项目 1</div>
  <div>项目 2</div>
</Stack>`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Grid 组件展示 */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-900">
                Grid - 网格布局组件
              </h2>
              <p className="text-sm text-gray-500 mt-1">响应式网格布局</p>
            </div>

            <div className="p-6 space-y-10">
              {/* 固定列数 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  1. 固定列数
                </h3>
                <Grid columns={3} gap={4}>
                  <div className="bg-orange-100 p-4 rounded text-center">1</div>
                  <div className="bg-orange-100 p-4 rounded text-center">2</div>
                  <div className="bg-orange-100 p-4 rounded text-center">3</div>
                  <div className="bg-orange-100 p-4 rounded text-center">4</div>
                  <div className="bg-orange-100 p-4 rounded text-center">5</div>
                  <div className="bg-orange-100 p-4 rounded text-center">6</div>
                </Grid>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
                  <code>{`<Grid columns={3} gap={4}>
  <div>1</div>
  <div>2</div>
  <div>3</div>
</Grid>`}</code>
                </pre>
              </div>

              {/* 响应式列数 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  2. 响应式列数
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  调整浏览器窗口大小查看效果
                </p>
                <Grid cols={{ default: 1, md: 2, lg: 4 }} gap={4}>
                  <div className="bg-pink-100 p-4 rounded text-center">1</div>
                  <div className="bg-pink-100 p-4 rounded text-center">2</div>
                  <div className="bg-pink-100 p-4 rounded text-center">3</div>
                  <div className="bg-pink-100 p-4 rounded text-center">4</div>
                </Grid>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
                  <code>{`<Grid cols={{ default: 1, md: 2, lg: 4 }} gap={4}>
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
</Grid>`}</code>
                </pre>
              </div>

              {/* 实际应用示例 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  3. 实际应用 - 活动列表
                </h3>
                <Grid cols={{ default: 1, md: 2, lg: 3 }} gap={4}>
                  <Card
                    hoverable
                    title="活动 1"
                    extra={
                      <Button size="small" variant="text">
                        详情
                      </Button>
                    }
                  >
                    <p className="text-sm text-gray-600">活动描述内容...</p>
                  </Card>
                  <Card
                    hoverable
                    title="活动 2"
                    extra={
                      <Button size="small" variant="text">
                        详情
                      </Button>
                    }
                  >
                    <p className="text-sm text-gray-600">活动描述内容...</p>
                  </Card>
                  <Card
                    hoverable
                    title="活动 3"
                    extra={
                      <Button size="small" variant="text">
                        详情
                      </Button>
                    }
                  >
                    <p className="text-sm text-gray-600">活动描述内容...</p>
                  </Card>
                </Grid>
              </div>
            </div>
          </div>
        </section>

        {/* 设计规范说明 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📐 设计规范
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 尺寸规范 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                尺寸规范
              </h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">尺寸</th>
                    <th className="px-3 py-2 text-left">高度</th>
                    <th className="px-3 py-2 text-left">圆角</th>
                    <th className="px-3 py-2 text-left">字号</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-3 py-2">Large</td>
                    <td className="px-3 py-2">48px</td>
                    <td className="px-3 py-2">10px</td>
                    <td className="px-3 py-2">18px</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Medium ⭐</td>
                    <td className="px-3 py-2">40px</td>
                    <td className="px-3 py-2">8px</td>
                    <td className="px-3 py-2">16px</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Small</td>
                    <td className="px-3 py-2">32px</td>
                    <td className="px-3 py-2">6px</td>
                    <td className="px-3 py-2">14px</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 颜色规范 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                颜色规范
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary-500"></div>
                  <span>主色: #4A78FF (晨曦蓝)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary-600"></div>
                  <span>悬停: #3862E6</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary-700"></div>
                  <span>按下: #2B4DCC</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-300"></div>
                  <span>禁用: #D1D5DB</span>
                </div>
              </div>
            </div>
          </div>

          {/* 可访问性 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              ♿ 可访问性 (WCAG 2.1 AA)
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>最小触摸目标: 40×40px</li>
              <li>文本对比度: ≥4.5:1</li>
              <li>支持键盘导航 (Tab, Enter, Space)</li>
              <li>支持 aria-label 和 aria-disabled</li>
            </ul>
          </div>
        </section>

        {/* 页脚 */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            活动家智能连接平台 · 设计系统 v1.0 · 参考文档:{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">
              docs-private/design-system/
            </code>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ComponentShowcase;
