/**
 * Tailwind 配置测试页面
 * 用于验证自定义阴影类是否正确生成
 */

import { FC } from "react";

const TailwindTest: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Tailwind 自定义类测试
      </h1>

      <div className="space-y-8">
        {/* 测试 1: 自定义阴影类 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            1. 自定义阴影类测试
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="h-11 px-6 rounded-[22px] bg-blue-500 text-white shadow-primary">
              使用 shadow-primary
            </button>
            <button className="h-11 px-6 rounded-[22px] bg-orange-500 text-white shadow-secondary">
              使用 shadow-secondary
            </button>
            <button className="h-11 px-6 rounded-[22px] bg-purple-500 text-white shadow-accent">
              使用 shadow-accent
            </button>
            <button className="h-11 px-6 rounded-[22px] bg-green-500 text-white shadow-success">
              使用 shadow-success
            </button>
          </div>
        </section>

        {/* 测试 2: 悬停阴影 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            2. 悬停阴影测试（hover:shadow-primary-hover）
          </h2>
          <button className="h-11 px-6 rounded-[22px] bg-blue-500 text-white shadow-primary hover:shadow-primary-hover transition-shadow duration-150">
            悬停查看阴影变化
          </button>
        </section>

        {/* 测试 3: 渐变背景 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            3. 渐变背景测试
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="h-11 px-6 rounded-[22px] bg-gradient-to-br from-primary-400 to-primary-500 text-white">
              使用 primary 渐变
            </button>
            <button className="h-11 px-6 rounded-[22px] bg-gradient-to-br from-secondary-400 to-secondary-500 text-white">
              使用 secondary 渐变
            </button>
          </div>
        </section>

        {/* 测试 4: 完整按钮样式 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            4. 完整按钮样式测试
          </h2>
          <button className="h-11 px-6 rounded-[22px] bg-gradient-to-br from-primary-400 to-primary-500 text-white shadow-primary hover:shadow-primary-hover hover:-translate-y-0.5 transition-all duration-150">
            完整样式按钮（渐变+阴影+悬停）
          </button>
        </section>

        {/* 调试信息 */}
        <section className="mt-12 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔍 调试信息
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>配置文件:</strong> tailwind.config.js
            </p>
            <p>
              <strong>期望生成的类:</strong> shadow-primary,
              shadow-primary-hover, shadow-secondary, shadow-accent,
              shadow-success, shadow-danger
            </p>
            <p>
              <strong>检查方法:</strong> 打开浏览器开发者工具，查看元素的
              computed styles，检查 box-shadow 属性是否正确
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-900 font-medium">💡 预期结果:</p>
              <ul className="mt-2 space-y-1 text-blue-800">
                <li>
                  • shadow-primary 应该有: box-shadow: 0 2px 8px rgba(59, 130,
                  246, 0.3)
                </li>
                <li>• 悬停时应该看到明显的蓝色阴影效果</li>
                <li>• 按钮应该有圆角和渐变背景</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TailwindTest;
