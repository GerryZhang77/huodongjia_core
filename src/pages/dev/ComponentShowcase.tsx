/**
 * ComponentShowcase - 组件展示页面
 *
 * 用途: 开发环境下展示和测试所有基础 UI 组件
 * 访问: /components (仅开发环境)
 *
 * 功能:
 * - 展示完整设计系统 (色彩、字体、组件、布局)
 * - 提供交互式示例
 * - 显示代码片段和设计令牌
 *
 * 架构: 模块化展示组件，每个模块独立维护
 */

import { FC, useState } from "react";
import {
  ColorShowcase,
  TypographyShowcase,
  ButtonShowcase,
  TagShowcase,
  InputShowcase,
  CardShowcase,
  LayoutShowcase,
  DesignTokens,
} from "./showcase";

const ComponentShowcase: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("colors");

  // 导航标签配置
  const tabs = [
    { id: "colors", label: "色彩系统", icon: "🎨" },
    { id: "typography", label: "字体排版", icon: "✏️" },
    { id: "buttons", label: "按钮组件", icon: "🔘" },
    { id: "tags", label: "标签组件", icon: "🏷️" },
    { id: "inputs", label: "表单组件", icon: "📝" },
    { id: "cards", label: "卡片组件", icon: "🃏" },
    { id: "layout", label: "布局组件", icon: "📐" },
    { id: "tokens", label: "设计令牌", icon: "🔧" },
  ];

  // 渲染当前激活的展示模块
  const renderActiveShowcase = () => {
    switch (activeTab) {
      case "colors":
        return <ColorShowcase />;
      case "typography":
        return <TypographyShowcase />;
      case "buttons":
        return <ButtonShowcase />;
      case "tags":
        return <TagShowcase />;
      case "inputs":
        return <InputShowcase />;
      case "cards":
        return <CardShowcase />;
      case "layout":
        return <LayoutShowcase />;
      case "tokens":
        return <DesignTokens />;
      default:
        return <ColorShowcase />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 固定头部 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* 页面标题 */}
          <div className="py-6 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              设计系统展示中心
            </h1>
            <p className="text-gray-500">
              活动家智能连接平台 · 2024 新版设计系统 · 开发环境专用
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">
                v1.0
              </span>
              <span>•</span>
              <span>基于 Nunito 字体</span>
              <span>•</span>
              <span>主色 Sky Blue #3B82F6</span>
            </div>
          </div>

          {/* 导航标签 */}
          <nav className="py-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150
                    ${
                      activeTab === tab.id
                        ? "bg-primary-400 text-white shadow-primary"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* 渲染当前激活的展示模块 */}
          {renderActiveShowcase()}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="mt-12 py-8 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <p className="text-sm text-gray-500 mb-2">
            活动家智能连接平台 · 设计系统 v1.0
          </p>
          <p className="text-xs text-gray-400">
            参考文档:{" "}
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              docs-private/design-system/
            </code>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            UI 设计:{" "}
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              ui_design_drafts/UISystem/
            </code>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ComponentShowcase;
