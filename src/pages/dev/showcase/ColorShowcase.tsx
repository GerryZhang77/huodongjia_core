/**
 * ColorShowcase - 色彩系统展示模块
 */

import { FC } from "react";
import { Lightbulb, Check, AlertTriangle } from "lucide-react";

const ColorShowcase: FC = () => {
  // 色彩数据
  const colorGroups = [
    {
      name: "主色 - 天空蓝 (Primary)",
      description: "品牌核心色，用于主按钮、链接、选中状态",
      colors: [
        { name: "50", value: "#EFF6FF", usage: "浅色背景" },
        { name: "100", value: "#DBEAFE", usage: "浅色背景" },
        { name: "200", value: "#BFDBFE", usage: "浅色元素" },
        { name: "300", value: "#93C5FD", usage: "浅色元素" },
        { name: "400", value: "#3B82F6", usage: "主色 ⭐", main: true },
        { name: "500", value: "#2563EB", usage: "悬停态" },
        { name: "600", value: "#1D4ED8", usage: "激活态" },
        { name: "700", value: "#1E40AF", usage: "深色" },
        { name: "800", value: "#1E3A8A", usage: "深色" },
        { name: "900", value: "#172554", usage: "深色" },
      ],
    },
    {
      name: "辅助色 - 活力橙 (Secondary)",
      description: "用于强调、引导、活动标签",
      colors: [
        { name: "50", value: "#FFF7ED", usage: "浅色背景" },
        { name: "100", value: "#FFEDD5", usage: "浅色背景" },
        { name: "200", value: "#FED7AA", usage: "浅色元素" },
        { name: "300", value: "#FDBA74", usage: "浅色元素" },
        { name: "400", value: "#F97316", usage: "主色 ⭐", main: true },
        { name: "500", value: "#EA580C", usage: "悬停态" },
        { name: "600", value: "#C2410C", usage: "激活态" },
        { name: "700", value: "#9A3412", usage: "深色" },
        { name: "800", value: "#7C2D12", usage: "深色" },
        { name: "900", value: "#6C2711", usage: "深色" },
      ],
    },
    {
      name: "强调色 - 梦幻紫 (Accent)",
      description: "用于特殊标记、智能功能、VIP",
      colors: [
        { name: "50", value: "#FAF5FF", usage: "浅色背景" },
        { name: "100", value: "#F3E8FF", usage: "浅色背景" },
        { name: "200", value: "#E9D5FF", usage: "浅色元素" },
        { name: "300", value: "#D8B4FE", usage: "浅色元素" },
        { name: "400", value: "#A855F7", usage: "主色 ⭐", main: true },
        { name: "500", value: "#9333EA", usage: "悬停态" },
        { name: "600", value: "#7E22CE", usage: "激活态" },
        { name: "700", value: "#6B21A8", usage: "深色" },
        { name: "800", value: "#581C87", usage: "深色" },
        { name: "900", value: "#4C1D95", usage: "深色" },
      ],
    },
  ];

  const semanticColors = [
    { name: "Success", value: "#22C55E", bg: "#F0FDF4", usage: "成功状态" },
    { name: "Warning", value: "#F59E0B", bg: "#FFFBEB", usage: "警告提示" },
    { name: "Error", value: "#EF4444", bg: "#FEF2F2", usage: "错误状态" },
    { name: "Info", value: "#3B82F6", bg: "#EFF6FF", usage: "信息提示" },
  ];

  const neutralColors = [
    { name: "50", value: "#F8FAFC", usage: "最浅背景" },
    { name: "100", value: "#F1F5F9", usage: "页面背景" },
    { name: "200", value: "#E2E8F0", usage: "边框/分割线" },
    { name: "300", value: "#CBD5E1", usage: "边框" },
    { name: "400", value: "#94A3B8", usage: "占位符" },
    { name: "500", value: "#64748B", usage: "辅助文字" },
    { name: "600", value: "#475569", usage: "次要文字" },
    { name: "700", value: "#334155", usage: "正文" },
    { name: "800", value: "#1E293B", usage: "标题" },
    { name: "900", value: "#0F172A", usage: "最深色" },
  ];

  const gradients = [
    {
      name: "Primary",
      gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
      usage: "主按钮",
    },
    {
      name: "Secondary",
      gradient: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
      usage: "次要按钮",
    },
    {
      name: "Accent",
      gradient: "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)",
      usage: "强调按钮",
    },
    {
      name: "Success",
      gradient: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
      usage: "成功按钮",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 品牌色 */}
      {colorGroups.map((group) => (
        <div key={group.name}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {group.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{group.description}</p>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {group.colors.map((color) => (
              <div key={color.name} className="space-y-1.5">
                <div
                  className="h-16 rounded-lg shadow-sm relative group cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: color.value }}
                  title={`${color.value} - ${color.usage}`}
                >
                  {color.main && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-black/20 px-2 py-0.5 rounded">
                        ⭐
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700">
                    {color.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {color.value}
                  </p>
                  <p className="text-xs text-gray-400">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <pre className="text-xs overflow-x-auto">
              <code>{`// Tailwind 类名
className="bg-${group.name.split(" ")[0].toLowerCase()}-400 text-white"

// CSS 变量
color: var(--color-${group.name.split(" ")[0].toLowerCase()}-400);`}</code>
            </pre>
          </div>
        </div>
      ))}

      {/* 语义色 */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            语义色 (Semantic Colors)
          </h3>
          <p className="text-sm text-gray-500 mt-1">用于状态和反馈</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {semanticColors.map((color) => (
            <div key={color.name} className="space-y-2">
              <div
                className="h-20 rounded-lg flex items-center justify-center font-semibold text-white shadow-sm"
                style={{ backgroundColor: color.value }}
              >
                {color.name}
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-mono text-gray-700">{color.value}</p>
                <p className="text-xs text-gray-500">{color.usage}</p>
                <div
                  className="h-8 rounded border border-gray-200"
                  style={{ backgroundColor: color.bg }}
                  title={`背景色: ${color.bg}`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 中性色 */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            中性色 - 石板灰 (Neutral - Slate)
          </h3>
          <p className="text-sm text-gray-500 mt-1">用于文字、边框、背景</p>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
          {neutralColors.map((color) => (
            <div key={color.name} className="space-y-1.5">
              <div
                className="h-16 rounded-lg shadow-sm border border-gray-200"
                style={{ backgroundColor: color.value }}
              ></div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700">
                  {color.name}
                </p>
                <p className="text-xs text-gray-500 font-mono">{color.value}</p>
                <p className="text-xs text-gray-400">{color.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 渐变色 */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            渐变色 (Gradients)
          </h3>
          <p className="text-sm text-gray-500 mt-1">135° 渐变，用于按钮</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gradients.map((gradient) => (
            <div key={gradient.name} className="space-y-2">
              <div
                className="h-24 rounded-lg flex items-center justify-center font-semibold text-white shadow-md"
                style={{ background: gradient.gradient }}
              >
                {gradient.name}
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">{gradient.usage}</p>
                <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                  <code>{gradient.gradient}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 使用指南 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
          <Lightbulb size={16} className="text-blue-600" />
          使用指南
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li className="flex items-start gap-1.5">
            <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>主色(天空蓝): 品牌标识、主按钮、链接、选中状态</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>辅助色(活力橙): 热门/推荐、次要 CTA、强调</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>强调色(梦幻紫): 智能功能、VIP、特殊标记</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>语义色仅用于对应状态 (成功/警告/错误/信息)</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>文本对比度 大于等于 4.5:1 (WCAG AA 标准)</span>
          </li>
          <li className="flex items-start gap-1.5">
            <AlertTriangle
              size={14}
              className="text-amber-600 mt-0.5 flex-shrink-0"
            />
            <span>避免硬编码颜色值，优先使用 Tailwind 类名或 CSS 变量</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ColorShowcase;
