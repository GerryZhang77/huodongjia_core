import React, { useState } from "react";
import {
  Card,
  TextArea,
  Button,
  Tag,
  Slider,
  Switch,
  Stepper,
  Toast,
} from "antd-mobile";
import { StarOutline, AddCircleOutline, SetOutline } from "antd-mobile-icons";
import { MatchingRule, MatchConstraints } from "./types";
import AddCustomRuleModal from "./AddCustomRuleModal";

interface RulesSettingTabProps {
  naturalLanguageInput: string;
  onNaturalLanguageInputChange: (value: string) => void;
  rules: MatchingRule[];
  onRulesChange: (rules: MatchingRule[]) => void;
  constraints: MatchConstraints;
  onConstraintsChange: (constraints: MatchConstraints) => void;
  loading: boolean;
  onGenerateRules: () => Promise<void>;
  onSaveRules: () => Promise<void>;
  onNext: () => void;
}

/**
 * Tab 1: 规则设置
 * 功能：自然语言输入 → AI生成规则 → 调整权重 → 设置边界条件 → 保存规则
 */
const RulesSettingTab: React.FC<RulesSettingTabProps> = ({
  naturalLanguageInput,
  onNaturalLanguageInputChange,
  rules,
  onRulesChange,
  constraints,
  onConstraintsChange,
  loading,
  onGenerateRules,
  onSaveRules,
  onNext,
}) => {
  // 自定义规则弹窗状态
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);

  // 计算权重总和
  const totalWeight = rules
    .filter((r) => r.enabled)
    .reduce((sum, r) => sum + r.weight, 0);

  // 更新规则权重
  const updateRuleWeight = (ruleId: string, weight: number) => {
    onRulesChange(
      rules.map((rule) => (rule.id === ruleId ? { ...rule, weight } : rule))
    );
  };

  // 切换规则启用状态
  const toggleRuleEnabled = (ruleId: string) => {
    onRulesChange(
      rules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  // 删除规则
  const deleteRule = (ruleId: string) => {
    onRulesChange(rules.filter((rule) => rule.id !== ruleId));
  };

  // 快速填充示例
  const quickFillExample = (text: string) => {
    onNaturalLanguageInputChange(text);
  };

  // 验证边界条件
  const validateConstraints = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // 验证每组人数
    if (
      constraints.minGroupSize &&
      constraints.maxGroupSize &&
      constraints.minGroupSize > constraints.maxGroupSize
    ) {
      errors.push("每组最小人数不能大于最大人数");
    }

    if (constraints.minGroupSize && constraints.minGroupSize < 2) {
      errors.push("每组最小人数不能少于2人");
    }

    if (constraints.maxGroupSize && constraints.maxGroupSize > 20) {
      errors.push("每组最大人数不能超过20人");
    }

    // 验证性别比例
    if (
      constraints.genderRatioMin !== undefined &&
      constraints.genderRatioMax !== undefined
    ) {
      if (constraints.genderRatioMin > constraints.genderRatioMax) {
        errors.push("性别比例最小值不能大于最大值");
      }

      if (constraints.genderRatioMin < 0 || constraints.genderRatioMin > 100) {
        errors.push("性别比例最小值必须在0-100之间");
      }

      if (constraints.genderRatioMax < 0 || constraints.genderRatioMax > 100) {
        errors.push("性别比例最大值必须在0-100之间");
      }
    }

    // 验证同行业上限
    if (constraints.sameIndustryMax) {
      if (constraints.sameIndustryMax < 1) {
        errors.push("同行业最多人数不能少于1人");
      }
      if (
        constraints.maxGroupSize &&
        constraints.sameIndustryMax > constraints.maxGroupSize
      ) {
        errors.push("同行业最多人数不能超过每组最大人数");
      }
    }

    return { valid: errors.length === 0, errors };
  };

  // 保存前验证
  const handleSave = async () => {
    const validation = validateConstraints();
    if (!validation.valid) {
      Toast.show({
        content: validation.errors.join("\n"),
        icon: "fail",
        duration: 3000,
      });
      return;
    }
    await onSaveRules();
  };

  // 下一步验证
  const handleNext = () => {
    const enabledRules = rules.filter((r) => r.enabled);

    console.log("=".repeat(60));
    console.log("[规则设置] 点击'下一步：执行匹配'按钮");
    console.log("[规则设置] 当前规则数量:", rules.length);
    console.log("[规则设置] 启用的规则数量:", enabledRules.length);
    console.log("[规则设置] 权重总和:", totalWeight);

    if (enabledRules.length === 0) {
      console.warn("[规则设置] ❌ 验证失败：没有启用任何规则");
      Toast.show({
        content: "请至少启用一条匹配规则",
        icon: "fail",
        duration: 3000,
      });
      console.log("=".repeat(60));
      return;
    }

    console.log("[规则设置] ✅ 验证通过，即将切换到匹配控制台");
    console.log("=".repeat(60));
    onNext();
  };
  return (
    <div className="px-4 md:px-6 py-4 pb-24">
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* 自然语言输入区域 */}
        <Card
          title="活动匹配期望"
          style={{ borderRadius: "12px" } as React.CSSProperties}
        >
          <div className="space-y-3">
            <TextArea
              placeholder="请用自然语言描述您的匹配需求，例如：&#10;• 尽量跨院校、跨行业&#10;• 兴趣重合优先&#10;• 男女比例均衡"
              value={naturalLanguageInput}
              onChange={onNaturalLanguageInputChange}
              maxLength={500}
              showCount
              rows={5}
              style={{ borderRadius: "8px" } as React.CSSProperties}
            />

            {/* 快捷示例 */}
            <div className="flex flex-wrap gap-2">
              <Tag
                color="primary"
                fill="outline"
                onClick={() =>
                  quickFillExample(
                    "尽量跨院校、跨行业，兴趣重合优先，男女比例均衡。"
                  )
                }
                className="cursor-pointer"
              >
                示例1: 跨校跨行业
              </Tag>
              <Tag
                color="primary"
                fill="outline"
                onClick={() =>
                  quickFillExample(
                    "按照兴趣爱好和专业技能进行分组，让有共同话题的人组成团队。"
                  )
                }
                className="cursor-pointer"
              >
                示例2: 兴趣匹配
              </Tag>
              <Tag
                color="primary"
                fill="outline"
                onClick={() =>
                  quickFillExample(
                    "平衡各组的性别比例、年龄结构和地域分布，促进多元交流。"
                  )
                }
                className="cursor-pointer"
              >
                示例3: 平衡分组
              </Tag>
            </div>

            <Button
              color="primary"
              size="large"
              block
              loading={loading}
              onClick={onGenerateRules}
              disabled={!naturalLanguageInput.trim()}
              className="rounded-xl h-12 font-semibold"
            >
              {loading ? (
                <span>生成中...</span>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <StarOutline />
                  <span>生成匹配规则</span>
                </div>
              )}
            </Button>
          </div>
        </Card>

        {/* 规则列表 */}
        {rules.length > 0 && (
          <Card
            title={`匹配规则列表 (共 ${rules.length} 条)`}
            style={{ borderRadius: "12px" } as React.CSSProperties}
          >
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3 rounded-lg border ${
                    rule.enabled
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          {rule.enabled ? "✅" : "❌"} {rule.name}
                        </h4>
                        <span className="text-sm font-medium text-primary-500">
                          权重: {rule.weight}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {rule.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Switch
                        checked={rule.enabled}
                        onChange={() => toggleRuleEnabled(rule.id)}
                      />
                    </div>
                  </div>

                  {rule.enabled && (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">权重调整</span>
                        <span className="text-base font-bold text-primary-500">
                          {rule.weight}%
                        </span>
                      </div>
                      <Slider
                        value={rule.weight}
                        onChange={(value) =>
                          updateRuleWeight(rule.id, value as number)
                        }
                        min={0}
                        max={100}
                        step={5}
                        marks={{
                          0: "0",
                          25: "25",
                          50: "50",
                          75: "75",
                          100: "100",
                        }}
                        style={
                          {
                            "--fill-color": "var(--adm-color-primary)",
                          } as React.CSSProperties
                        }
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="mini"
                          fill="outline"
                          color="danger"
                          onClick={() => deleteRule(rule.id)}
                          className="rounded-lg"
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* 权重总和提示 */}
              {rules.filter((r) => r.enabled).length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-700">
                      💡 当前权重总和:{" "}
                      <span className="font-semibold text-primary-500">
                        {totalWeight}%
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    系统会自动按比例归一化权重，无需手动调整到 100%
                  </p>
                </div>
              )}
            </div>

            <Button
              block
              fill="outline"
              size="large"
              className="mt-4 rounded-xl h-11"
              onClick={() => setShowAddRuleModal(true)}
            >
              <div className="flex items-center justify-center gap-2">
                <AddCircleOutline />
                <span>添加自定义规则</span>
              </div>
            </Button>
          </Card>
        )}

        {/* 添加自定义规则弹窗 */}
        <AddCustomRuleModal
          visible={showAddRuleModal}
          existingRules={rules}
          onClose={() => setShowAddRuleModal(false)}
          onSubmit={(newRule) => {
            onRulesChange([...rules, newRule]);
            Toast.show({ content: "规则已添加", icon: "success" });
          }}
        />

        {/* 边界条件设置 */}
        <Card
          title="⚙️ 边界条件（可选）"
          style={{ borderRadius: "12px" } as React.CSSProperties}
        >
          <div className="space-y-4">
            {/* 每组人数 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-900">
                  👥 每组人数
                </span>
                <div className="px-3 py-1 bg-primary-100 rounded-md">
                  <span className="text-sm font-semibold text-primary-600">
                    {constraints.minGroupSize || 3} -{" "}
                    {constraints.maxGroupSize || 8} 人
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-2">最小人数</div>
                  <Stepper
                    value={constraints.minGroupSize || 3}
                    onChange={(value) =>
                      onConstraintsChange({
                        ...constraints,
                        minGroupSize: value as number,
                      })
                    }
                    min={2}
                    max={constraints.maxGroupSize || 10}
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-2">最大人数</div>
                  <Stepper
                    value={constraints.maxGroupSize || 8}
                    onChange={(value) =>
                      onConstraintsChange({
                        ...constraints,
                        maxGroupSize: value as number,
                      })
                    }
                    min={constraints.minGroupSize || 3}
                    max={20}
                  />
                </div>
              </div>
            </div>

            {/* 性别比例 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-900">
                  ⚖️ 性别比例
                </span>
                <div className="px-3 py-1 bg-secondary-100 rounded-md">
                  <span className="text-sm font-semibold text-secondary-600">
                    {constraints.genderRatioMin || 40}% -{" "}
                    {constraints.genderRatioMax || 60}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-2">最小比例</div>
                  <Stepper
                    value={constraints.genderRatioMin || 40}
                    onChange={(value) =>
                      onConstraintsChange({
                        ...constraints,
                        genderRatioMin: value as number,
                      })
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-2">最大比例</div>
                  <Stepper
                    value={constraints.genderRatioMax || 60}
                    onChange={(value) =>
                      onConstraintsChange({
                        ...constraints,
                        genderRatioMax: value as number,
                      })
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              </div>
            </div>

            {/* 同行业上限 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-900">
                  🏢 同行业限制
                </span>
                <div className="px-3 py-1 bg-accent-100 rounded-md">
                  <span className="text-sm font-semibold text-accent-600">
                    最多 {constraints.sameIndustryMax || 2} 人
                  </span>
                </div>
              </div>
              <Stepper
                value={constraints.sameIndustryMax || 2}
                onChange={(value) =>
                  onConstraintsChange({
                    ...constraints,
                    sameIndustryMax: value as number,
                  })
                }
                min={1}
                max={10}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 底部操作按钮 - 响应式设计 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
          <div className="flex gap-3">
            <Button
              fill="outline"
              size="large"
              onClick={handleSave}
              disabled={rules.length === 0}
              className="flex-1 rounded-xl h-12 font-medium border-2 border-gray-300 hover:border-primary-500 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <SetOutline fontSize={18} />
                <span>保存规则配置</span>
              </div>
            </Button>
            <Button
              color="primary"
              size="large"
              onClick={handleNext}
              disabled={rules.filter((r) => r.enabled).length === 0}
              className="flex-1 rounded-xl h-12 font-semibold shadow-md hover:shadow-lg transition-shadow"
              style={
                {
                  background:
                    "linear-gradient(135deg, #4A78FF 0%, #2563EB 100%)",
                } as React.CSSProperties
              }
            >
              下一步：执行匹配
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesSettingTab;
