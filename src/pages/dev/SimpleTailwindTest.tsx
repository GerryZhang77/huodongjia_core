import { FC } from "react";

/**
 * 极简 Tailwind 测试
 * 只测试最基础的功能
 */
export const SimpleTailwindTest: FC = () => {
  return (
    <div className="p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">极简 Tailwind 测试</h1>

      {/* 测试 1: 标准 Tailwind 颜色 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">1. 标准颜色（应该显示）</h2>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-blue-500 rounded"></div>
          <div className="w-20 h-20 bg-red-500 rounded"></div>
          <div className="w-20 h-20 bg-green-500 rounded"></div>
        </div>
      </div>

      {/* 测试 2: @theme 自定义颜色 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          2. 自定义颜色（@theme配置）
        </h2>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-primary-400 rounded"></div>
          <div className="w-20 h-20 bg-secondary-400 rounded"></div>
          <div className="w-20 h-20 bg-accent-400 rounded"></div>
        </div>
      </div>

      {/* 测试 3: 自定义阴影 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          3. 自定义阴影（@theme配置）
        </h2>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-white rounded shadow-primary"></div>
          <div className="w-20 h-20 bg-white rounded shadow-secondary"></div>
          <div className="w-20 h-20 bg-white rounded shadow-accent"></div>
        </div>
      </div>

      {/* 测试 4: 渐变 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">4. 渐变背景</h2>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-500 rounded"></div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <p className="text-sm">
          <strong>检查说明：</strong>
          <br />
          - 第1组应该显示蓝/红/绿色 → Tailwind 基础功能正常
          <br />
          - 第2组如果显示白色 → @theme 颜色未生成工具类
          <br />
          - 第3组如果没有阴影 → @theme 阴影未生成工具类
          <br />- 第4组第一个应该有渐变，第二个测试自定义颜色渐变
        </p>
      </div>
    </div>
  );
};

export default SimpleTailwindTest;
