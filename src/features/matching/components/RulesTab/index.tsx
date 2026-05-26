import React, { useMemo, useState } from "react";
import { Toast } from "@/components/ui/Toast";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Play,
  Save,
  Settings,
  Trash2,
  Users,
  Scale,
  Building2,
} from "lucide-react";
import { Button, Switch } from "@/components/ui";
import type {
  MatchConstraints,
  MatchingRule,
  MatchingSchemaGroup,
  MatchingSchemaField,
  MatchOperator,
} from "../../types";

interface RulesTabProps {
  rules: MatchingRule[];
  onRulesChange: (rules: MatchingRule[]) => void;
  constraints: MatchConstraints;
  onConstraintsChange: (constraints: MatchConstraints) => void;
  onSaveRules: (configName: string) => Promise<void>;
  onStartMatching: () => Promise<void>;
  isMatching: boolean;
  matchingProgress: number;
  matchingMessage?: string;
  participantCount: number;
  isRulesLocked?: boolean;
  schemaFields?: MatchingSchemaField[];
  schemaGroups?: MatchingSchemaGroup[];
  schemaLoading?: boolean;
}

const OPERATORS: Array<{ value: MatchOperator; label: string }> = [
  { value: "similarity", label: "相似度匹配" },
  { value: "complement", label: "互补匹配" },
  { value: "exact", label: "精确匹配" },
  { value: "distance_decay", label: "数值距离匹配" },
];

const DEFAULT_OPERATOR: MatchOperator = "similarity";

const createRule = (): MatchingRule => ({
  id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "未配置规则",
  source_field: "",
  target_field: "",
  operator: DEFAULT_OPERATOR,
  type: DEFAULT_OPERATOR,
  weight: 1,
  enabled: true,
});

const formatRuleName = (rule: MatchingRule, index: number) => {
  return `${index + 1}-${rule.operator || DEFAULT_OPERATOR}`;
};

const normalizeWeight = (value: number) => {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0.1, value));
};

const RulesTab: React.FC<RulesTabProps> = ({
  rules,
  onRulesChange,
  constraints,
  onConstraintsChange,
  onSaveRules,
  onStartMatching,
  isMatching,
  matchingProgress,
  matchingMessage,
  participantCount,
  isRulesLocked = false,
  schemaFields = [],
  schemaGroups = [],
  schemaLoading = false,
}) => {
  const [showConstraints, setShowConstraints] = useState(false);
  const [draggingField, setDraggingField] = useState<{
    key: string;
    registrationTypeId?: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedWeightRuleIds, setExpandedWeightRuleIds] = useState<string[]>(
    [],
  );

  const schemaLabelMap = useMemo(() => {
    return new Map(schemaFields.map((field) => [field.key, field.label]));
  }, [schemaFields]);

  const visibleRules = rules.length > 0 ? rules : [createRule()];
  const enabledRules = visibleRules.filter((rule) => rule.enabled);
  const visibleSchemaGroups = schemaGroups.length > 0
    ? schemaGroups
    : schemaFields.length > 0
      ? [{ name: "默认报名表", fields: schemaFields }]
      : [];

  const getFieldLabel = (fieldKey?: string) => {
    if (!fieldKey) return "";
    return schemaLabelMap.get(fieldKey) || fieldKey;
  };

  const updateRules = (nextRules: MatchingRule[]) => {
    onRulesChange(
      nextRules.map((rule, index) => ({
        ...rule,
        name: formatRuleName(rule, index),
        type: rule.operator || DEFAULT_OPERATOR,
        operator: rule.operator || DEFAULT_OPERATOR,
        weight: normalizeWeight(rule.weight),
      })),
    );
  };

  const handleRuleChange = (
    ruleId: string,
    patch: Partial<MatchingRule>,
  ) => {
    updateRules(
      visibleRules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...patch } : rule,
      ),
    );
  };

  const handleAddRule = () => {
    updateRules([...visibleRules, createRule()]);
  };

  const handleDeleteRule = (ruleId?: string) => {
    const nextRules = visibleRules.filter((rule) => rule.id !== ruleId);
    updateRules(nextRules.length > 0 ? nextRules : [createRule()]);
  };

  const handleSave = async () => {
    const hasIncompleteRule = visibleRules.some(
      (rule) => !rule.source_field || !rule.target_field,
    );

    if (hasIncompleteRule) {
      Toast.show({ content: "字段设置不完整，无法保存", icon: "fail" });
      return;
    }

    const validRules = visibleRules.filter(
      (rule) =>
        rule.enabled &&
        rule.source_field &&
        rule.target_field &&
        rule.operator,
    );

    if (validRules.length === 0) {
      Toast.show({ content: "请先至少配置一条完整规则", icon: "fail" });
      return;
    }

    setIsSaving(true);
    try {
      await onSaveRules("默认配置");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStart = async () => {
    const validRules = visibleRules.filter(
      (rule) =>
        rule.enabled &&
        rule.source_field &&
        rule.target_field &&
        rule.operator,
    );

    if (validRules.length === 0) {
      Toast.show({ content: "请先至少配置一条完整规则", icon: "fail" });
      return;
    }

    if (participantCount === 0) {
      Toast.show({ content: "暂无参与者数据", icon: "fail" });
      return;
    }

    await onStartMatching();
  };

  const toggleWeightPanel = (ruleId?: string) => {
    if (!ruleId) return;
    setExpandedWeightRuleIds((current) =>
      current.includes(ruleId)
        ? current.filter((id) => id !== ruleId)
        : [...current, ruleId],
    );
  };

  return (
    <div className="pb-32">
      <div className="grid grid-cols-1 gap-4 lg:h-[calc(100vh-13rem)] lg:min-h-[520px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 lg:h-full lg:overflow-hidden lg:flex lg:flex-col">
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <GripVertical size={16} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">报名字段</h3>
              <p className="text-xs text-gray-500">拖到右侧规则槽位中</p>
            </div>
          </div>

          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            {schemaLoading ? (
              <div className="text-sm text-gray-500 py-8 text-center">字段加载中...</div>
            ) : visibleSchemaGroups.length === 0 ? (
              <div className="text-sm text-gray-500 py-8 text-center">
                当前活动还没有报名表字段
              </div>
            ) : (
              <div className="space-y-4">
                {visibleSchemaGroups.map((group, groupIndex) => (
                  <div key={`${group.name}-${groupIndex}`}>
                    {groupIndex > 0 && <div className="border-t border-gray-200 mb-3" />}
                    <div className="text-xs text-gray-400 mb-2 truncate">
                      {group.name}
                    </div>
                    <div className="space-y-2">
                      {group.fields.map((field) => (
                        <button
                          key={`${groupIndex}-${field.key}`}
                          type="button"
                          draggable={!isRulesLocked}
                          onDragStart={() =>
                            setDraggingField({
                              key: field.key,
                              registrationTypeId: group.id,
                            })
                          }
                          onDragEnd={() => setDraggingField(null)}
                          className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/40 transition-colors disabled:opacity-60"
                        >
                          <div className="font-medium text-gray-900 truncate">
                            {field.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 lg:h-full lg:overflow-hidden lg:flex lg:flex-col">
          <div className="mb-4 flex-shrink-0">
            <h3 className="text-base font-semibold text-gray-900">规则设置器</h3>
            <p className="text-xs text-gray-500 mt-1">
              每行一条规则，左右字段可分别拖入，后端将按对应 operator 和 weight 执行匹配。
            </p>
          </div>

          <div className="space-y-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            {visibleRules.map((rule, index) => (
              <div
                key={rule.id || index}
                className="rounded-2xl border border-gray-200 p-4 bg-gray-50/70"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 text-sm font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatRuleName(rule, index)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={rule.enabled}
                      onChange={() =>
                        handleRuleChange(rule.id || "", { enabled: !rule.enabled })
                      }
                      disabled={isRulesLocked}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      disabled={isRulesLocked}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_1.2fr_0.9fr]">
                  {(["source_field", "target_field"] as const).map((slot) => {
                    const fieldKey = rule[slot];
                    const fieldLabel = getFieldLabel(fieldKey);
                    return (
                      <div
                        key={slot}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (!draggingField || isRulesLocked) return;
                          handleRuleChange(rule.id || "", {
                            [slot]: draggingField.key,
                            [slot === "source_field"
                              ? "source_registration_type_id"
                              : "target_registration_type_id"]: draggingField.registrationTypeId,
                          });
                          setDraggingField(null);
                        }}
                        className={`min-h-[72px] rounded-2xl border-2 border-dashed px-4 py-3 transition-colors ${
                          fieldKey
                            ? "border-primary-300 bg-primary-50/60"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-2">
                          {slot === "source_field" ? "左字段" : "右字段"}
                        </div>
                        {fieldKey ? (
                          <div>
                            <div className="font-medium text-gray-900 truncate">
                              {fieldLabel}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            拖拽字段到这里
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <label className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                    <div className="text-xs text-gray-500 mb-2">匹配方式</div>
                    <select
                      value={rule.operator || DEFAULT_OPERATOR}
                      onChange={(event) =>
                        handleRuleChange(rule.id || "", {
                          operator: event.target.value as MatchOperator,
                          type: event.target.value as MatchOperator,
                        })
                      }
                      disabled={isRulesLocked}
                      className="w-full bg-transparent outline-none text-sm font-medium text-gray-900"
                    >
                      {OPERATORS.map((operator) => (
                        <option key={operator.value} value={operator.value}>
                          {operator.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-3 rounded-2xl border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() => toggleWeightPanel(rule.id)}
                    disabled={isRulesLocked}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm disabled:opacity-50"
                  >
                      <span className="font-medium text-gray-700">权重</span>
                    <span className="flex items-center gap-2 text-gray-500">
                      <span>{rule.weight}</span>
                      {rule.id && expandedWeightRuleIds.includes(rule.id) ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  </button>
                  {rule.id && expandedWeightRuleIds.includes(rule.id) && (
                    <div className="px-4 pb-4">
                      <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.1}
                        value={rule.weight}
                        onChange={(event) =>
                          handleRuleChange(rule.id || "", {
                            weight: normalizeWeight(Number(event.target.value)),
                          })
                        }
                        disabled={isRulesLocked}
                        className="w-full accent-[var(--adm-color-primary)]"
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>0.1</span>
                        <span>0.5</span>
                        <span>1</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddRule}
              disabled={isRulesLocked}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium rounded-xl border border-dashed border-gray-300 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/40 disabled:opacity-50"
            >
              <Plus size={16} />
              新增规则
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-4 mb-4">
        <button
          onClick={() => setShowConstraints(!showConstraints)}
          className="w-full px-4 md:px-6 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Settings size={16} className="text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">边界条件（可选）</h3>
          </div>
          <ArrowRight
            size={18}
            className={`text-gray-400 transition-transform ${showConstraints ? "rotate-90" : ""}`}
          />
        </button>

        {showConstraints && (
          <div className="px-4 md:px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-primary-500" />
                <span className="text-sm font-medium text-gray-700">每组人数</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min={2}
                  value={constraints.minGroupSize || 3}
                  onChange={(event) =>
                    onConstraintsChange({
                      ...constraints,
                      minGroupSize: Number(event.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                />
                <input
                  type="number"
                  min={constraints.minGroupSize || 2}
                  value={constraints.maxGroupSize || 8}
                  onChange={(event) =>
                    onConstraintsChange({
                      ...constraints,
                      maxGroupSize: Number(event.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Scale size={16} className="text-secondary-500" />
                <span className="text-sm font-medium text-gray-700">性别比例</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={constraints.genderRatioMin || 40}
                  onChange={(event) =>
                    onConstraintsChange({
                      ...constraints,
                      genderRatioMin: Number(event.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={constraints.genderRatioMax || 60}
                  onChange={(event) =>
                    onConstraintsChange({
                      ...constraints,
                      genderRatioMax: Number(event.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={16} className="text-accent-500" />
                <span className="text-sm font-medium text-gray-700">同行业限制</span>
              </div>
              <input
                type="number"
                min={1}
                max={10}
                value={constraints.sameIndustryMax || 2}
                onChange={(event) =>
                  onConstraintsChange({
                    ...constraints,
                    sameIndustryMax: Number(event.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {isMatching && (
        <div className="bg-white rounded-2xl border border-primary-200 shadow-sm p-4 md:p-6 mb-4">
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${matchingProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-500">
              {matchingMessage || "正在生成匹配结果..."}
            </span>
            <span className="font-medium text-primary-500">{matchingProgress}%</span>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-center gap-4 mb-2 text-sm">
            <span className="text-gray-500">
              参与人数: <span className="font-semibold text-primary-500">{participantCount} 人</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              启用规则: <span className="font-semibold text-primary-500">{enabledRules.length} 条</span>
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="large"
              onClick={handleSave}
              disabled={
                isSaving ||
                isMatching ||
                visibleRules.some(
                  (rule) => !rule.source_field || !rule.target_field,
                )
              }
              className="flex-1"
            >
              <span className="flex items-center gap-2">
                <Save size={18} />
                保存规则
              </span>
            </Button>
            <Button
              size="large"
              onClick={handleStart}
              disabled={isMatching || participantCount === 0}
              className="flex-1"
            >
              <span className="flex items-center gap-2">
                <Play size={18} />
                {isMatching ? "匹配中..." : "开始匹配"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesTab;
