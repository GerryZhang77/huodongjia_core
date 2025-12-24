/**
 * Button 测试页面 - 验证纯 Tailwind v4 实现
 */

import { FC } from "react";
import { Button } from "@/components/ui";

export const ButtonTest: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* 页头 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Button 组件测试
          </h1>
          <p className="text-gray-500">纯 Tailwind v4 实现</p>
        </div>

        {/* 尺寸测试 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            尺寸 (Size)
          </h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="large">Large 按钮</Button>
            <Button size="medium">Medium 按钮</Button>
            <Button size="small">Small 按钮</Button>
          </div>
        </section>

        {/* 变体测试 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            变体 (Variant)
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="text">Text</Button>
          </div>
        </section>

        {/* 状态测试 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            状态 (State)
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button>正常</Button>
            <Button disabled>禁用</Button>
            <Button loading>加载中</Button>
          </div>
        </section>

        {/* 块级按钮 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            块级按钮 (Block)
          </h2>
          <div className="max-w-md space-y-3">
            <Button block>占满整行</Button>
            <Button block variant="secondary">
              次要块级按钮
            </Button>
          </div>
        </section>

        {/* 实际效果对比 */}
        <section className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            实际效果检查
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">主按钮应该是：</p>
              <ul className="text-sm text-gray-500 space-y-1 mb-3">
                <li>✓ 天空蓝色背景 (#3B82F6)</li>
                <li>✓ 白色文字</li>
                <li>✓ Pill 圆角 (22px for medium)</li>
                <li>✓ 悬停时变亮 + 轻微上移</li>
              </ul>
              <Button>测试主按钮</Button>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">次要按钮应该是：</p>
              <ul className="text-sm text-gray-500 space-y-1 mb-3">
                <li>✓ 活力橙色背景 (#F97316)</li>
                <li>✓ 白色文字</li>
                <li>✓ Pill 圆角</li>
                <li>✓ 悬停时变亮 + 轻微上移</li>
              </ul>
              <Button variant="secondary">测试次要按钮</Button>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">轮廓按钮应该是：</p>
              <ul className="text-sm text-gray-500 space-y-1 mb-3">
                <li>✓ 白色背景</li>
                <li>✓ 天空蓝边框和文字</li>
                <li>✓ Pill 圆角</li>
                <li>✓ 悬停时浅灰背景</li>
              </ul>
              <Button variant="outline">测试轮廓按钮</Button>
            </div>
          </div>
        </section>

        {/* 原始 HTML 对比 */}
        <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            原始 Tailwind 类名对比
          </h2>
          <p className="text-sm text-blue-700 mb-4">
            这是直接用 Tailwind 类名写的按钮，应该和组件效果一致：
          </p>
          <div className="space-y-3">
            <button className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 h-11 px-6 text-sm rounded-[22px] bg-primary text-white shadow-button hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]">
              原始 Tailwind 主按钮
            </button>
            <br />
            <button className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 h-11 px-6 text-sm rounded-[22px] bg-secondary text-white hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]">
              原始 Tailwind 次要按钮
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonTest;
