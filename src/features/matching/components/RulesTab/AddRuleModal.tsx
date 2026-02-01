/**
 * 添加自定义规则弹窗组件
 */

import React, { useState } from "react";
import { X, Info } from "lucide-react";
import { Button } from "@/components/ui";
import type { MatchingRule, RuleType } from "../../types";

interface AddRuleModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rule: MatchingRule) => void;
  existingRules: MatchingRule[];
}

// 预设规则模板 - 使用新的 RuleType
const RULE_TEMPLATES: Array<{
  type: RuleType;
  name: string;
  description: string;
  field: string;
}> = [
  {
    type: "similarity",
    name: "兴趣相似",
    description: "根据兴趣标签计算相似度",
    field: "interests",
  },
  {
    type: "diversity",
    name: "院校多样",
    description: "避免同院校人员聚集",
    field: "school",
  },
  {
    type: "diversity",
    name: "行业分散",
    description: "确保不同行业的人混合",
    field: "industry",
  },
  {
    type: "similarity",
    name: "年龄相近",
    description: "同年龄段人员优先匹配",
    field: "age",
  },
  {
    type: "diversity",
    name: "地域多元",
    description: "来自不同地区的人混合",
    field: "city",
  },
  {
    type: "constraint",
    name: "性别平衡",
    description: "保持组内性别比例均衡",
    field: "gender",
  },
];

export const AddRuleModal: React.FC<AddRuleModalProps> = ({
  visible,
  onClose,
  onSubmit,
  existingRules,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<
    (typeof RULE_TEMPLATES)[0] | null
  >(null);
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [weight, setWeight] = useState(50);
  const [mode, setMode] = useState<"template" | "custom">("template");

  if (!visible) return null;

  const handleSubmit = () => {
    let rule: MatchingRule;

    if (mode === "template" && selectedTemplate) {
      rule = {
        id: `custom_${Date.now()}`,
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        type: selectedTemplate.type,
        field: selectedTemplate.field,
        weight: weight,
        enabled: true,
      };
    } else if (mode === "custom" && customName.trim()) {
      rule = {
        id: `custom_${Date.now()}`,
        name: customName.trim(),
        description: customDescription.trim(),
        type: "custom",
        weight: weight,
        enabled: true,
      };
    } else {
      return;
    }

    onSubmit(rule);
    handleReset();
  };

  const handleReset = () => {
    setSelectedTemplate(null);
    setCustomName("");
    setCustomDescription("");
    setWeight(50);
    setMode("template");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // 检查模板是否已存在
  const isTemplateUsed = (template: (typeof RULE_TEMPLATES)[0]) => {
    return existingRules.some(
      (r) => r.name === template.name || r.type === template.type,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">添加匹配规则</h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* 模式切换 */}
          <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setMode("template")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "template"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              选择模板
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "custom"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              自定义
            </button>
          </div>

          {mode === "template" ? (
            <>
              {/* 模板列表 */}
              <div className="space-y-2 mb-5">
                {RULE_TEMPLATES.map((template, idx) => {
                  const isUsed = isTemplateUsed(template);
                  const isSelected = selectedTemplate === template;

                  return (
                    <button
                      key={idx}
                      onClick={() => !isUsed && setSelectedTemplate(template)}
                      disabled={isUsed}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        isUsed
                          ? "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed"
                          : isSelected
                            ? "bg-primary-50 border-primary-300"
                            : "border-gray-200 hover:border-primary-200 hover:bg-primary-50/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${isSelected ? "text-primary-600" : "text-gray-900"}`}
                        >
                          {template.name}
                        </span>
                        {isUsed && (
                          <span className="text-xs text-gray-400">已添加</span>
                        )}
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {template.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* 自定义输入 */}
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    规则名称
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="例如：技能互补"
                    maxLength={20}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    规则描述
                  </label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="描述这条规则的匹配逻辑..."
                    maxLength={100}
                    rows={2}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
                  />
                </div>
              </div>
            </>
          )}

          {/* 权重设置 */}
          {((mode === "template" && selectedTemplate) ||
            (mode === "custom" && customName.trim())) && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  初始权重
                </span>
                <span className="text-lg font-bold text-primary-500">
                  {weight}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary-400
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${weight}%, #E5E7EB ${weight}%, #E5E7EB 100%)`,
                }}
              />
            </div>
          )}

          {/* 提示 */}
          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
            <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-600">
              添加后可以在规则列表中随时调整权重或删除
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="large"
            onClick={handleClose}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            size="large"
            onClick={handleSubmit}
            disabled={
              (mode === "template" && !selectedTemplate) ||
              (mode === "custom" && !customName.trim())
            }
            className="flex-1"
          >
            添加规则
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddRuleModal;
