/**
 * TypographyShowcase - 字体系统展示模块
 */

import { FC } from "react";
import { Lightbulb, Check, AlertTriangle } from "lucide-react";

const TypographyShowcase: FC = () => {
  const typographyScale = [
    {
      name: "Display",
      className: "text-4xl font-extrabold",
      size: "32px / 2rem",
      lineHeight: "40px (1.25)",
      usage: "页面主标题",
      sample: "活动家智能连接平台",
    },
    {
      name: "H1",
      className: "text-2xl font-bold",
      size: "24px / 1.5rem",
      lineHeight: "32px (1.33)",
      usage: "区块标题",
      sample: "欢迎来到活动家",
    },
    {
      name: "H2",
      className: "text-xl font-semibold",
      size: "20px / 1.25rem",
      lineHeight: "28px (1.4)",
      usage: "卡片标题",
      sample: "周末户外活动",
    },
    {
      name: "H3",
      className: "text-lg font-semibold",
      size: "16px / 1rem",
      lineHeight: "24px (1.5)",
      usage: "列表标题",
      sample: "活动详情",
    },
    {
      name: "Body Large",
      className: "text-lg font-normal",
      size: "16px / 1rem",
      lineHeight: "26px (1.625)",
      usage: "重要正文",
      sample: "这是一段重要的正文内容，使用 16px 字号确保易读性。",
    },
    {
      name: "Body",
      className: "text-base font-normal",
      size: "14px / 0.875rem",
      lineHeight: "22px (1.57)",
      usage: "默认正文 ⭐",
      sample: "这是默认的正文内容，大部分文本都应该使用这个字号。",
    },
    {
      name: "Caption",
      className: "text-sm font-normal",
      size: "12px / 0.75rem",
      lineHeight: "18px (1.5)",
      usage: "辅助说明",
      sample: "辅助说明文字，如时间戳、提示信息等。",
    },
    {
      name: "Overline",
      className: "text-xs font-medium tracking-wide uppercase",
      size: "11px / 0.6875rem",
      lineHeight: "16px",
      usage: "标签/分类",
      sample: "CATEGORY",
    },
  ];

  const fontWeights = [
    {
      name: "Regular",
      value: "400",
      className: "font-normal",
      usage: "正文",
      sample: "正文使用 Regular 字重",
    },
    {
      name: "Medium",
      value: "500",
      className: "font-medium",
      usage: "强调文本",
      sample: "强调文本使用 Medium 字重",
    },
    {
      name: "SemiBold",
      value: "600",
      className: "font-semibold",
      usage: "小标题 ⭐",
      sample: "小标题使用 SemiBold 字重",
    },
    {
      name: "Bold",
      value: "700",
      className: "font-bold",
      usage: "标题",
      sample: "标题使用 Bold 字重",
    },
    {
      name: "ExtraBold",
      value: "800",
      className: "font-extrabold",
      usage: "展示文本",
      sample: "展示文本使用 ExtraBold 字重",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 字体家族 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          字体家族 (Font Family)
        </h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-2xl font-semibold mb-4">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-2xl font-semibold mb-2">活动家智能连接平台</p>
          <p className="text-sm text-gray-500 mt-4">
            主字体: Nunito (圆润友好、现代清新)
          </p>
          <pre className="text-xs bg-white p-3 rounded mt-2 overflow-x-auto">
            <code>
              {`font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 
            'PingFang SC', 'Microsoft YaHei', sans-serif;`}
            </code>
          </pre>
        </div>
      </div>

      {/* 字号层级 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          字号层级 (Type Scale)
        </h3>
        <div className="space-y-6">
          {typographyScale.map((type) => (
            <div
              key={type.name}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-400 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700">
                    {type.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {type.size} · {type.lineHeight} · {type.usage}
                  </p>
                </div>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {type.className}
                </code>
              </div>
              <p className={type.className}>{type.sample}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 字重 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          字重 (Font Weight)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fontWeights.map((weight) => (
            <div
              key={weight.name}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {weight.name}
                </span>
                <span className="text-xs text-gray-500">
                  {weight.value} · {weight.usage}
                </span>
              </div>
              <p className={`${weight.className} text-lg`}>{weight.sample}</p>
              <code className="text-xs text-gray-500 mt-2 block">
                {weight.className}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* 文本颜色 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          文本颜色 (Text Colors)
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm text-gray-600">Primary</div>
            <p className="text-gray-900 text-base">
              主要文本 (gray-900) #0F172A
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm text-gray-600">Secondary</div>
            <p className="text-gray-600 text-base">
              次要文本 (gray-600) #475569
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm text-gray-600">Tertiary</div>
            <p className="text-gray-500 text-base">
              辅助文本 (gray-500) #64748B
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm text-gray-600">Disabled</div>
            <p className="text-gray-400 text-base">
              禁用文本 (gray-400) #94A3B8
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm text-gray-600">Link</div>
            <p className="text-primary-400 text-base hover:text-primary-500 cursor-pointer">
              链接文本 (primary-400) #3B82F6
            </p>
          </div>
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
            <span>正文默认使用 14px (text-base)</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>标题使用 SemiBold 或 Bold 字重</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>行高确保 1.5 倍以上，提升可读性</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>中英文混排时，Nunito 优先用于英文/数字</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>
              文本对比度 大于等于 4.5:1 (正文) 或 大于等于 3:1 (大字号)
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <AlertTriangle
              size={14}
              className="text-amber-600 mt-0.5 flex-shrink-0"
            />
            <span>避免使用过多字重变化，保持一致性</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TypographyShowcase;
