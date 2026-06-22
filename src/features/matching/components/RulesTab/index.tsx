import React, { useMemo, useState } from "react";
import { Popup } from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Plus,
  Play,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button, Switch } from "@/components/ui";
import { getStandardFieldLabel } from "@/utils/fieldLabels";
import type {
  MatchConstraints,
  MatchingRule,
  MatchingSchemaGroup,
  MatchingSchemaField,
  MatchOperator,
  MatchFieldCatalogItem,
  MatchPreflightResult,
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
  fieldCatalog?: MatchFieldCatalogItem[];
  preflightResult?: MatchPreflightResult | null;
  schemaLoading?: boolean;
}

const OPERATORS: Array<{ value: MatchOperator; label: string }> = [
  { value: "similarity", label: "相似度匹配" },
  { value: "complement", label: "互补匹配" },
  { value: "exact", label: "精确匹配" },
  { value: "distance_decay", label: "数值距离匹配" },
];

const DEFAULT_OPERATOR: MatchOperator = "similarity";
type RuleFieldSlot = "source_field" | "target_field";
type RuleFieldOption = {
  key: string;
  label: string;
  registrationTypeId?: string | null;
  groupName: string;
  coverage?: number;
  totalEligibleParticipants?: number;
  canMatch?: boolean;
  source?: string;
};

const FIELD_SLOT_CONFIG: Record<
  RuleFieldSlot,
  {
    label: string;
    emptyText: string;
    helperText: string;
    registrationTypeKey:
      | "source_registration_type_id"
      | "target_registration_type_id";
  }
> = {
  source_field: {
    label: "参与者字段",
    emptyText: "请选择参与者字段",
    helperText: "当前参与者用于计算的报名信息",
    registrationTypeKey: "source_registration_type_id",
  },
  target_field: {
    label: "匹配对象字段",
    emptyText: "请选择匹配对象字段",
    helperText: "候选匹配对象用于对比的报名信息",
    registrationTypeKey: "target_registration_type_id",
  },
};

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

const formatRuleName = (index: number) => {
  return `规则 ${index + 1}`;
};

const normalizeWeight = (value: number) => {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0.1, value));
};

const RulesTab: React.FC<RulesTabProps> = ({
  rules,
  onRulesChange,
  onSaveRules,
  onStartMatching,
  isMatching,
  matchingProgress,
  matchingMessage,
  participantCount,
  isRulesLocked = false,
  schemaFields = [],
  schemaGroups = [],
  fieldCatalog = [],
  preflightResult,
  schemaLoading = false,
}) => {
  const [fieldPicker, setFieldPicker] = useState<{
    ruleId: string;
    slot: RuleFieldSlot;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedWeightRuleIds, setExpandedWeightRuleIds] = useState<string[]>(
    [],
  );

  const schemaLabelMap = useMemo(() => {
    return new Map(
      schemaFields.map((field) => [
        field.key,
        getStandardFieldLabel(field.key, field.label),
      ]),
    );
  }, [schemaFields]);

  const visibleRules = rules.length > 0 ? rules : [createRule()];
  const enabledRules = visibleRules.filter((rule) => rule.enabled);
  const visibleSchemaGroups = schemaGroups.length > 0
    ? schemaGroups
    : schemaFields.length > 0
      ? [{ name: "默认报名表", fields: schemaFields }]
      : [];
  const catalogFieldOptions = fieldCatalog.map((field): RuleFieldOption => ({
    key: field.key,
    label: getStandardFieldLabel(field.key, field.label || field.key),
    registrationTypeId: field.registrationTypeId,
    groupName:
      field.registrationTypeName ||
      (field.source === "import_extra" ? "导入额外字段" : "可匹配字段"),
    coverage: field.coverage,
    totalEligibleParticipants: field.totalEligibleParticipants,
    canMatch: field.canMatch,
    source: field.source,
  }));
  const schemaFieldOptions = visibleSchemaGroups.flatMap((group, groupIndex) =>
    group.fields
      .filter((field) => field.key)
      .map((field): RuleFieldOption => ({
        key: field.key,
        label: getStandardFieldLabel(field.key, field.label || field.key),
        registrationTypeId: group.id,
        groupName: group.name || `报名表 ${groupIndex + 1}`,
      })),
  );
  const fieldOptions = catalogFieldOptions.length > 0
    ? catalogFieldOptions
    : schemaFieldOptions;
  const fieldGroups = Array.from(
    fieldOptions.reduce<Map<string, RuleFieldOption[]>>((groups, field) => {
      const groupName = field.groupName || "可匹配字段";
      groups.set(groupName, [...(groups.get(groupName) || []), field]);
      return groups;
    }, new Map()),
  ).map(([name, fields]) => ({ name, fields }));
  const failedFieldKeys = new Set(
    preflightResult?.fieldDiagnostics
      ?.filter((field) => !field.canMatch)
      .map((field) => `${field.registrationTypeId || ""}::${field.key}`) || [],
  );

  const getFieldOption = (
    fieldKey?: string,
    registrationTypeId?: string | null,
  ) => {
    if (!fieldKey) return null;
    return (
      fieldOptions.find(
        (field) =>
          field.key === fieldKey &&
          (!registrationTypeId ||
            field.registrationTypeId === registrationTypeId),
      ) ||
      fieldOptions.find((field) => field.key === fieldKey) ||
      null
    );
  };

  const getFieldLabel = (
    fieldKey?: string,
    registrationTypeId?: string | null,
  ) => {
    if (!fieldKey) return "";
    return (
      getFieldOption(fieldKey, registrationTypeId)?.label ||
      schemaLabelMap.get(fieldKey) ||
      getStandardFieldLabel(fieldKey)
    );
  };

  const updateRules = (nextRules: MatchingRule[]) => {
    onRulesChange(
      nextRules.map((rule, index) => ({
        ...rule,
        name: formatRuleName(index),
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

  const handleOpenFieldPicker = (
    ruleId: string | undefined,
    slot: RuleFieldSlot,
  ) => {
    if (!ruleId || isRulesLocked || fieldOptions.length === 0) return;
    setFieldPicker({ ruleId, slot });
  };

  const handleSelectField = (
    ruleId: string,
    slot: RuleFieldSlot,
    field: {
      key: string;
      registrationTypeId?: string | null;
    },
  ) => {
    const registrationTypeKey = FIELD_SLOT_CONFIG[slot].registrationTypeKey;
    handleRuleChange(ruleId, {
      [slot]: field.key,
      [registrationTypeKey]: field.registrationTypeId,
    } as Partial<MatchingRule>);
    setFieldPicker(null);
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
      Toast.show({
        content: "请先选择参与者字段和匹配对象字段",
        icon: "fail",
      });
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
      Toast.show({ content: "请先至少配置一条完整匹配规则", icon: "fail" });
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
      Toast.show({ content: "请先至少配置一条完整匹配规则", icon: "fail" });
      return;
    }

    if (participantCount === 0) {
      Toast.show({ content: "暂无审核通过且参与匹配的用户", icon: "fail" });
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

  const activePickerRule = fieldPicker
    ? visibleRules.find((rule) => rule.id === fieldPicker.ruleId)
    : undefined;
  const activePickerSlot = fieldPicker?.slot;
  const activePickerConfig = activePickerSlot
    ? FIELD_SLOT_CONFIG[activePickerSlot]
    : undefined;
  const activePickerFieldKey =
    activePickerRule && activePickerSlot
      ? activePickerRule[activePickerSlot]
      : undefined;
  const activePickerRegistrationTypeId =
    activePickerRule && activePickerSlot
      ? activePickerRule[FIELD_SLOT_CONFIG[activePickerSlot].registrationTypeKey]
      : undefined;
  const activePickerSelectedOption = activePickerSlot
    ? getFieldOption(activePickerFieldKey, activePickerRegistrationTypeId)
    : null;

  return (
    <div className="pb-32">
      <div className="grid grid-cols-1 gap-4 lg:h-[calc(100vh-13rem)] lg:min-h-[520px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 lg:h-full lg:overflow-hidden lg:flex lg:flex-col">
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <ListChecks size={16} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">可用报名字段</h3>
              <p className="text-xs text-gray-500">选择器中按报名表分组展示</p>
            </div>
          </div>

          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            {schemaLoading ? (
              <div className="text-sm text-gray-500 py-8 text-center">字段加载中...</div>
            ) : fieldGroups.length === 0 ? (
              <div className="text-sm text-gray-500 py-8 text-center">
                当前活动还没有可匹配字段
              </div>
            ) : (
              <div className="space-y-4">
                {fieldGroups.map((group, groupIndex) => (
                  <div key={`${group.name}-${groupIndex}`}>
                    {groupIndex > 0 && <div className="border-t border-gray-200 mb-3" />}
                    <div className="text-xs text-gray-400 mb-2 truncate">
                      {group.name}
                    </div>
                    <div className="space-y-2">
                      {group.fields.map((field) => (
                        <div
                          key={`${groupIndex}-${field.key}`}
                          className={`w-full p-3 rounded-xl border bg-white ${
                            field.canMatch === false
                              ? "border-orange-200"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium text-gray-900 truncate">
                              {field.label}
                            </div>
                            {typeof field.coverage === "number" && (
                              <span
                                className={`text-xs flex-shrink-0 ${
                                  field.canMatch === false
                                    ? "text-orange-500"
                                    : "text-gray-400"
                                }`}
                              >
                                {field.coverage}/{field.totalEligibleParticipants || 0}
                              </span>
                            )}
                          </div>
                        </div>
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
              每条规则选择参与者字段和匹配对象字段，系统按匹配方式和权重计算推荐关系。
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
                      {formatRuleName(index)}
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
                    const slotConfig = FIELD_SLOT_CONFIG[slot];
                    const registrationTypeId =
                      rule[slotConfig.registrationTypeKey];
                    const fieldOption = getFieldOption(fieldKey, registrationTypeId);
                    const fieldLabel = getFieldLabel(fieldKey, registrationTypeId);
                    const fieldWarning =
                      fieldOption?.canMatch === false ||
                      failedFieldKeys.has(`${registrationTypeId || ""}::${fieldKey || ""}`);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleOpenFieldPicker(rule.id, slot)}
                        disabled={isRulesLocked || fieldOptions.length === 0}
                        className={`min-h-[76px] rounded-2xl border px-4 py-3 text-left transition-colors disabled:opacity-60 ${
                          fieldWarning
                            ? "border-orange-300 bg-orange-50/80"
                            : fieldKey
                            ? "border-primary-300 bg-primary-50/60"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mb-2">
                          <span>{slotConfig.label}</span>
                          <ChevronDown size={15} className="text-gray-400" />
                        </div>
                        {fieldKey ? (
                          <div>
                            <div className="font-medium text-gray-900 truncate">
                              {fieldLabel}
                            </div>
                            {fieldOption?.groupName && (
                              <div className="mt-1 text-xs text-gray-500 truncate">
                                {fieldOption.groupName}
                              </div>
                            )}
                            {typeof fieldOption?.coverage === "number" && (
                              <div
                                className={`mt-1 text-xs ${
                                  fieldWarning ? "text-orange-500" : "text-gray-500"
                                }`}
                              >
                                覆盖 {fieldOption.coverage}/{fieldOption.totalEligibleParticipants || 0}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-400">
                              {slotConfig.emptyText}
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              {slotConfig.helperText}
                            </div>
                          </div>
                        )}
                      </button>
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

      <Popup
        visible={Boolean(fieldPicker)}
        position="bottom"
        onMaskClick={() => setFieldPicker(null)}
        destroyOnClose
        bodyStyle={{
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          maxHeight: "76vh",
          overflow: "hidden",
        }}
      >
        <div className="bg-white">
          <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="min-w-0">
              <div className="text-base font-semibold text-gray-900">
                选择{activePickerConfig?.label || "字段"}
              </div>
              <div className="mt-1 text-xs text-gray-500 truncate">
                {activePickerConfig?.helperText}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFieldPicker(null)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
              aria-label="关闭字段选择"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[calc(76vh-73px)] overflow-y-auto px-4 py-3">
            {fieldGroups.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                当前活动还没有可匹配字段
              </div>
            ) : (
              <div className="space-y-5">
                {fieldGroups.map((group, groupIndex) => (
                  <div key={`picker-${group.name}-${groupIndex}`}>
                    <div className="mb-2 text-xs font-medium text-gray-500 truncate">
                      {group.name || `字段分组 ${groupIndex + 1}`}
                    </div>
                    <div className="space-y-2">
                      {group.fields.map((field) => {
                        const isSelected =
                          activePickerFieldKey === field.key &&
                          (activePickerRegistrationTypeId
                            ? activePickerRegistrationTypeId === field.registrationTypeId
                            : activePickerSelectedOption?.registrationTypeId === field.registrationTypeId);
                        return (
                          <button
                            key={`picker-${groupIndex}-${field.key}`}
                            type="button"
                            disabled={!fieldPicker || isRulesLocked}
                            onClick={() => {
                              if (!fieldPicker) return;
                              handleSelectField(fieldPicker.ruleId, fieldPicker.slot, {
                                key: field.key,
                                registrationTypeId: field.registrationTypeId,
                              });
                            }}
                            className={`w-full min-h-[48px] rounded-xl border px-3 py-3 text-left flex items-center justify-between gap-3 transition-colors ${
                              isSelected
                                ? "border-primary-300 bg-primary-50 text-primary-600"
                                : field.canMatch === false
                                  ? "border-orange-200 bg-orange-50 text-gray-900"
                                  : "border-gray-200 bg-white text-gray-900"
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block font-medium truncate">
                                {field.label || field.key}
                              </span>
                              {typeof field.coverage === "number" && (
                                <span
                                  className={`block mt-1 text-xs ${
                                    field.canMatch === false
                                      ? "text-orange-500"
                                      : "text-gray-400"
                                  }`}
                                >
                                  覆盖 {field.coverage}/{field.totalEligibleParticipants || 0}
                                </span>
                              )}
                            </span>
                            {isSelected ? (
                              <Check size={18} className="flex-shrink-0" />
                            ) : field.canMatch === false ? (
                              <AlertCircle size={17} className="flex-shrink-0 text-orange-500" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Popup>

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
              可匹配人数: <span className="font-semibold text-primary-500">{participantCount} 人</span>
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
