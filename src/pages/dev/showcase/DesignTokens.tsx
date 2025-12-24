/**
 * DesignTokens - 设计规范速查
 */

import { FC } from "react";

const DesignTokens: FC = () => {
  return (
    <div className="space-y-8">
      {/* 设计令牌表格 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          核心设计令牌 (Design Tokens)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  类别
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  令牌名称
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  值
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  用途
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 颜色 */}
              <tr>
                <td
                  rowSpan={7}
                  className="px-4 py-3 border-b font-medium text-gray-700"
                >
                  颜色
                </td>
                <td className="px-4 py-3 border-b">primary-400</td>
                <td className="px-4 py-3 border-b font-mono text-sm">
                  #3B82F6
                </td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  主色 - 天空蓝
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">secondary-400</td>
                <td className="px-4 py-3 border-b font-mono text-sm">
                  #F97316
                </td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  辅助色 - 活力橙
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">accent-400</td>
                <td className="px-4 py-3 border-b font-mono text-sm">
                  #A855F7
                </td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  强调色 - 梦幻紫
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">success</td>
                <td className="px-4 py-3 border-b font-mono text-sm">
                  #22C55E
                </td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  成功状态
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">warning</td>
                <td className="px-4 py-3 border-b font-mono text-sm">
                  #F59E0B
                </td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  警告提示
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">error</td>
                <td className="px-4 py-3 border-b font-mono text-sm">
                  #EF4444
                </td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  错误状态
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">gray-200</td>
                <td className="px-4 py-3 border-b font-mono text-sm">
                  #E2E8F0
                </td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  边框/分割线
                </td>
              </tr>

              {/* 字体 */}
              <tr>
                <td
                  rowSpan={3}
                  className="px-4 py-3 border-b font-medium text-gray-700"
                >
                  字体
                </td>
                <td className="px-4 py-3 border-b">font-family</td>
                <td className="px-4 py-3 border-b font-mono text-sm">Nunito</td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  主字体
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">text-base</td>
                <td className="px-4 py-3 border-b font-mono text-sm">14px</td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  默认字号
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">font-semibold</td>
                <td className="px-4 py-3 border-b font-mono text-sm">600</td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  标题字重
                </td>
              </tr>

              {/* 间距 */}
              <tr>
                <td
                  rowSpan={4}
                  className="px-4 py-3 border-b font-medium text-gray-700"
                >
                  间距
                </td>
                <td className="px-4 py-3 border-b">spacing-2</td>
                <td className="px-4 py-3 border-b font-mono text-sm">8px</td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  小间距
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">spacing-3</td>
                <td className="px-4 py-3 border-b font-mono text-sm">12px</td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  默认间距
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">spacing-4</td>
                <td className="px-4 py-3 border-b font-mono text-sm">16px</td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  中等间距
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">spacing-6</td>
                <td className="px-4 py-3 border-b font-mono text-sm">24px</td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  大间距
                </td>
              </tr>

              {/* 圆角 */}
              <tr>
                <td
                  rowSpan={3}
                  className="px-4 py-3 border-b font-medium text-gray-700"
                >
                  圆角
                </td>
                <td className="px-4 py-3 border-b">rounded-[10px]</td>
                <td className="px-4 py-3 border-b font-mono text-sm">10px</td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  输入框
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">rounded-xl</td>
                <td className="px-4 py-3 border-b font-mono text-sm">16px</td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  卡片
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">rounded-[22px]</td>
                <td className="px-4 py-3 border-b font-mono text-sm">22px</td>
                <td className="px-4 py-3 border-b text-sm text-gray-600">
                  按钮 (Pill)
                </td>
              </tr>

              {/* 阴影 */}
              <tr>
                <td rowSpan={3} className="px-4 py-3 font-medium text-gray-700">
                  阴影
                </td>
                <td className="px-4 py-3">shadow-card</td>
                <td className="px-4 py-3 font-mono text-xs">
                  0 4px 12px rgba(0,0,0,0.06)
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">卡片阴影</td>
              </tr>
              <tr>
                <td className="px-4 py-3">shadow-primary</td>
                <td className="px-4 py-3 font-mono text-xs">
                  0 2px 8px rgba(59,130,246,0.3)
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">主按钮阴影</td>
              </tr>
              <tr>
                <td className="px-4 py-3">shadow-card-hover</td>
                <td className="px-4 py-3 font-mono text-xs">
                  0 8px 16px rgba(59,130,246,0.12)
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">卡片悬停</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 组件尺寸对照 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          组件尺寸对照表
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  组件
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Large
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Medium (默认)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Small
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 border-b font-medium">Button</td>
                <td className="px-4 py-3 border-b font-mono text-sm">44px</td>
                <td className="px-4 py-3 border-b font-mono text-sm">40px</td>
                <td className="px-4 py-3 border-b font-mono text-sm">32px</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b font-medium">Input</td>
                <td className="px-4 py-3 border-b font-mono text-sm">44px</td>
                <td className="px-4 py-3 border-b font-mono text-sm">40px</td>
                <td className="px-4 py-3 border-b font-mono text-sm">32px</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Tag</td>
                <td className="px-4 py-3 font-mono text-sm">28px</td>
                <td className="px-4 py-3 font-mono text-sm">24px</td>
                <td className="px-4 py-3 font-mono text-sm">20px</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 断点系统 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">响应式断点</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  断点
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  最小宽度
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  设备
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Tailwind 前缀
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 border-b font-medium">xs</td>
                <td className="px-4 py-3 border-b font-mono text-sm">0px</td>
                <td className="px-4 py-3 border-b text-sm">小屏手机</td>
                <td className="px-4 py-3 border-b font-mono text-sm">(默认)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b font-medium">sm</td>
                <td className="px-4 py-3 border-b font-mono text-sm">640px</td>
                <td className="px-4 py-3 border-b text-sm">大屏手机</td>
                <td className="px-4 py-3 border-b font-mono text-sm">sm:</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b font-medium">md</td>
                <td className="px-4 py-3 border-b font-mono text-sm">768px</td>
                <td className="px-4 py-3 border-b text-sm">平板</td>
                <td className="px-4 py-3 border-b font-mono text-sm">md:</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b font-medium">lg</td>
                <td className="px-4 py-3 border-b font-mono text-sm">1024px</td>
                <td className="px-4 py-3 border-b text-sm">桌面</td>
                <td className="px-4 py-3 border-b font-mono text-sm">lg:</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">xl</td>
                <td className="px-4 py-3 font-mono text-sm">1280px</td>
                <td className="px-4 py-3 text-sm">大桌面</td>
                <td className="px-4 py-3 font-mono text-sm">xl:</td>
              </tr>
            </tbody>
          </table>
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`// Mobile First 用法
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-lg md:text-xl lg:text-2xl">标题</h1>
</div>`}</code>
        </pre>
      </div>

      {/* 动效参数 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">动效参数</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  类型
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  值
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  用途
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 border-b">duration-fast</td>
                <td className="px-4 py-3 border-b font-mono text-sm">150ms</td>
                <td className="px-4 py-3 border-b text-sm">
                  hover, focus 快速反馈
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b">duration-base</td>
                <td className="px-4 py-3 border-b font-mono text-sm">300ms</td>
                <td className="px-4 py-3 border-b text-sm">
                  标准过渡 (展开/折叠)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">ease-in-out</td>
                <td className="px-4 py-3 font-mono text-xs">
                  cubic-bezier(0.4,0,0.2,1)
                </td>
                <td className="px-4 py-3 text-sm">标准缓动函数</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 快速参考 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3">
          🎯 快速参考
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-2">常用颜色</p>
            <ul className="space-y-1 text-xs">
              <li>• 主按钮: bg-primary-400</li>
              <li>• 热门标签: bg-secondary-400</li>
              <li>• 智能功能: bg-accent-400</li>
              <li>• 标题文本: text-gray-900</li>
              <li>• 辅助文本: text-gray-500</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">常用尺寸</p>
            <ul className="space-y-1 text-xs">
              <li>• 按钮高度: 40px (默认)</li>
              <li>• 输入框高度: 40px (默认)</li>
              <li>• 卡片圆角: 16px (rounded-xl)</li>
              <li>• 按钮圆角: 22px (rounded-[22px])</li>
              <li>• 内边距: 16px (p-4)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignTokens;
