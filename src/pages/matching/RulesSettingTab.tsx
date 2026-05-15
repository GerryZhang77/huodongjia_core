import React from "react";
import { Button, Card, Stepper, Switch, Toast } from "antd-mobile";
import { AddCircleOutline, SetOutline } from "antd-mobile-icons";
import {
  MatchingRule,
  MatchConstraints,
  MatchOperator,
  RegistrationSchemaField,
} from "./types";

interface RulesSettingTabProps {
  rules: MatchingRule[];
  onRulesChange: (rules: MatchingRule[]) => void;
  constraints: MatchConstraints;
  onConstraintsChange: (constraints: MatchConstraints) => void;
  onSaveRules: () => Promise<void>;
  onNext: () => void;
  schemaFields?: RegistrationSchemaField[];
  schemaLoading?: boolean;
  naturalLanguageInput?: string;
  onNaturalLanguageInputChange?: (value: string) => void;
  loading?: boolean;
  onGenerateRules?: () => Promise<void>;
}

const OPERATOR_OPTIONS: Array<{ value: MatchOperator; label: string }> = [
  { value: "similarity", label: "similarity" },
  { value: "complement", label: "complement" },
  { value: "exact", label: "exact" },
  { value: "distance_decay", label: "distance_decay" },
];

const buildRuleName = (rule: MatchingRule) => {
  const operatorLabelMap: Record<MatchOperator, string> = {
    similarity: "相似",
    complement: "互补",
    exact: "一致",
    distance_decay: "距离衰减",
  };

  const source = rule.source_field || "待选字段";
  const target = rule.target_field || "待选字段";
  const operator = rule.operator || "similarity";
  return `${source} / ${target} · ${operatorLabelMap[operator]}`;
};

const createEmptyRule = (): MatchingRule => ({
  id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "未配置规则",
  source_field: "",
  target_field: "",
  operator: "similarity",
  weight: 1,
  enabled: true,
});

const RulesSettingTab: React.FC<RulesSettingTabProps> = ({
  rules,
  onRulesChange,
  constraints,
  onConstraintsChange,
  onSaveRules,
  onNext,
  schemaFields = [],
  schemaLoading = false,
}) => {
  const safeRules = rules.length > 0 ? rules : [createEmptyRule()];

  const updateRule = (
    ruleId: string | undefined,
    updates: Partial<MatchingRule>,
  ) => {
    onRulesChange(
      safeRules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              ...updates,
              name: buildRuleName({ ...rule, ...updates }),
            }
          : rule,
      ),
    );
  };

  const toggleRuleEnabled = (ruleId: string | undefined) => {
    updateRule(ruleId, {
      enabled: !safeRules.find((rule) => rule.id === ruleId)?.enabled,
    });
  };

  const addRule = () => {
    onRulesChange([...safeRules, createEmptyRule()]);
  };

  const removeRule = (ruleId: string | undefined) => {
    const nextRules = safeRules.filter((rule) => rule.id !== ruleId);
    onRulesChange(nextRules.length > 0 ? nextRules : [createEmptyRule()]);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    ruleId: string | undefined,
    side: "source_field" | "target_field",
  ) => {
    event.preventDefault();
    const label = event.dataTransfer.getData("text/plain");
    if (!label) return;
    updateRule(ruleId, { [side]: label } as Partial<MatchingRule>);
  };

  const handleSave = async () => {
    const invalidRule = safeRules.find(
      (rule) => !rule.source_field || !rule.target_field,
    );
    if (invalidRule) {
      Toast.show({ content: "请先为每条规则选择左右字段", icon: "fail" });
      return;
    }
    await onSaveRules();
  };

  const handleNext = () => {
    const enabledRules = safeRules.filter((rule) => rule.enabled);
    if (enabledRules.length === 0) {
      Toast.show({ content: "请至少启用一条匹配规则", icon: "fail" });
      return;
    }
    const invalidRule = enabledRules.find(
      (rule) => !rule.source_field || !rule.target_field,
    );
    if (invalidRule) {
      Toast.show({ content: "请先为所有启用规则选择左右字段", icon: "fail" });
      return;
    }
    onNext();
  };

  return (
    <div className="px-4 md:px-6 py-4 pb-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
        <Card
          title="报名表单字段"
          style={{ borderRadius: "12px" } as React.CSSProperties}
        >
          <div className="space-y-3">
            <div className="text-xs text-gray-500 leading-relaxed">
              先获取当前报名表 schema。将左侧字段块拖到右侧规则行的前两个框中，设置匹配字段映射。
            </div>

            {schemaLoading ? (
              <div className="text-sm text-gray-500">正在加载报名字段...</div>
            ) : schemaFields.length === 0 ? (
              <div className="text-sm text-amber-600">
                当前活动没有自定义报名表单字段
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {schemaFields.map((field) => (
                  <div
                    key={field.key}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", field.label);
                    }}
                    className="cursor-grab active:cursor-grabbing rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 shadow-sm"
                  >
                    {field.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card
          title="规则设置器"
          style={{ borderRadius: "12px" } as React.CSSProperties}
        >
          <div className="space-y-4">
            {safeRules.map((rule, index) => (
              <div
                key={rule.id || index}
                className={`rounded-xl border p-3 ${
                  rule.enabled
                    ? "border-blue-200 bg-blue-50/50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      规则 {index + 1}
                    </div>
                    <div className="text-xs text-gray-500">{buildRuleName(rule)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">启用</span>
                    <Switch
                      checked={rule.enabled}
                      onChange={() => toggleRuleEnabled(rule.id)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {(["source_field", "target_field"] as const).map((side, idx) => (
                    <div
                      key={side}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleDrop(event, rule.id, side)}
                      className="min-h-[72px] rounded-xl border-2 border-dashed border-gray-300 bg-white px-3 py-2"
                    >
                      <div className="mb-1 text-xs text-gray-500">
                        {idx === 0 ? "左字段" : "右字段"}
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {rule[side] || "拖拽字段到这里"}
                      </div>
                    </div>
                  ))}

                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                    <div className="mb-1 text-xs text-gray-500">operator</div>
                    <select
                      value={rule.operator || "similarity"}
                      onChange={(event) =>
                        updateRule(rule.id, {
                          operator: event.target.value as MatchOperator,
                        })
                      }
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 focus:outline-none"
                    >
                      {OPERATOR_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                    <div className="mb-1 text-xs text-gray-500">weight</div>
                    <div className="flex items-center justify-between gap-3">
                      <Stepper
                        min={1}
                        max={100}
                        value={rule.weight}
                        onChange={(value) =>
                          updateRule(rule.id, { weight: Number(value) || 1 })
                        }
                      />
                      <span className="text-sm font-semibold text-primary-600">
                        {rule.weight}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    size="mini"
                    fill="outline"
                    color="danger"
                    onClick={() => removeRule(rule.id)}
                    className="rounded-lg"
                  >
                    删除规则
                  </Button>
                </div>
              </div>
            ))}

            <Button
              block
              fill="outline"
              size="large"
              className="rounded-xl h-11"
              onClick={addRule}
            >
              <div className="flex items-center justify-center gap-2">
                <AddCircleOutline />
                <span>新增规则</span>
              </div>
            </Button>

            {import.meta.env.VITE_PRODUCTION_MODE !== "true" && (
              <Card
                title="⚙️ 边界条件（可选）"
                style={{ borderRadius: "12px" } as React.CSSProperties}
              >
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-gray-900">👥 每组人数</span>
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
                </div>
              </Card>
            )}
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3">
          <div className="flex gap-3">
            <Button
              fill="outline"
              size="large"
              onClick={handleSave}
              className="flex-1 rounded-xl h-12 font-medium border-2 border-gray-300 hover:border-primary-500 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <SetOutline />
                <span>保存规则</span>
              </div>
            </Button>

            <Button
              color="primary"
              size="large"
              onClick={handleNext}
              className="flex-1 rounded-xl h-12 font-semibold shadow-md"
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
