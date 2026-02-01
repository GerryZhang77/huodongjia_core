/**
 * 规则设置 Tab 组件 (重构版)
 * 设计风格统一：使用新设计系统（天空蓝、活力橙、梦幻紫）
 * 功能：展示后端下发规则 → 调整权重 → 边界条件 → 保存/开始匹配
 *
 * 注意：自然语言输入功能已移除，改为直接使用后端下发的匹配规则
 */

import React, { useState, useMemo } from "react";
import { Toast } from "antd-mobile";
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  Play,
  Save,
  Loader2,
  Users,
  Scale,
  Building2,
  Lock,
  X,
  RefreshCw,
} from "lucide-react";
import { Button, Switch } from "@/components/ui";
import { WeightSlider } from "../WeightSlider";
import { SaveConfigDialog, type SavedConfig } from "../SaveConfigDialog";
import type { MatchingRule as MatchRule, MatchConstraints } from "../../types";
import AddRuleModal from "./AddRuleModal";

// 使用从 types.ts 导入的 MatchConstraints 类型

interface RulesTabProps {
  /** 匹配规则列表（从后端获取） */
  rules: MatchRule[];
  /** 规则变更回调 */
  onRulesChange: (rules: MatchRule[]) => void;
  /** 边界约束条件 */
  constraints: MatchConstraints;
  /** 约束条件变更回调 */
  onConstraintsChange: (constraints: MatchConstraints) => void;
  /** 保存规则配置（带名称） */
  onSaveRules: (configName: string) => Promise<void>;
  /** 开始匹配 */
  onStartMatching: () => Promise<void>;
  /** 是否正在匹配 */
  isMatching: boolean;
  /** 匹配进度 (0-100) */
  matchingProgress: number;
  /** 参与人数 */
  participantCount: number;
  /** 规则是否锁定（匹配过程中不可编辑） */
  isRulesLocked?: boolean;
  /** 是否处于重新匹配模式 */
  isRematchMode?: boolean;
  /** 重新匹配时锁定的分组数量 */
  lockedGroupsCount?: number;
  /** 取消重新匹配模式 */
  onCancelRematchMode?: () => void;
  /** 已保存的配置列表 */
  savedConfigs?: SavedConfig[];
  /** 加载已保存的配置 */
  onLoadConfig?: (config: SavedConfig) => void;
  /** 删除已保存的配置 */
  onDeleteConfig?: (configId: string) => void;
}

/**
 * 规则卡片组件
 */
interface RuleCardProps {
  rule: MatchRule;
  onToggle: () => void;
  onWeightChange: (weight: number) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onExpandToggle: () => void;
  isLocked?: boolean;
}

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  onToggle,
  onWeightChange,
  onDelete,
  isExpanded,
  onExpandToggle,
  isLocked = false,
}) => {
  return (
    <div
      className={`border rounded-xl transition-all duration-200 ${
        isLocked ? "opacity-70" : ""
      } ${
        rule.enabled
          ? "bg-primary-50/50 border-primary-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      {/* 头部 */}
      <div
        className={`flex items-center gap-3 p-4 ${!isLocked ? "cursor-pointer" : "cursor-not-allowed"}`}
        onClick={!isLocked ? onExpandToggle : undefined}
      >
        {/* 开关 */}
        <Switch
          checked={rule.enabled}
          onChange={() => !isLocked && onToggle()}
          disabled={isLocked}
          aria-label={`${rule.enabled ? "禁用" : "启用"}规则: ${rule.name}`}
        />

        {/* 规则信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{rule.name}</h4>
            {/* 权重标签 - 始终占位，禁用时透明 */}
            <span
              className={`px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-600 rounded-full transition-opacity duration-200 ${
                rule.enabled ? "opacity-100" : "opacity-0"
              }`}
            >
              {rule.weight}%
            </span>
          </div>
          {rule.description && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {rule.description}
            </p>
          )}
        </div>

        {/* 展开/收起图标 - 始终占位，禁用时透明 */}
        <div
          className={`text-gray-400 transition-opacity duration-200 ${
            rule.enabled ? "opacity-100" : "opacity-0"
          }`}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* 展开内容 */}
      {rule.enabled && isExpanded && !isLocked && (
        <div className="px-4 pb-4 border-t border-primary-100 pt-4">
          {/* 权重滑块 */}
          <div className="mb-4">
            <WeightSlider
              value={rule.weight}
              onChange={onWeightChange}
              disabled={isLocked}
              label="权重调整"
              ticks={[0, 25, 50, 75, 100]}
            />
          </div>

          {/* 删除按钮 */}
          <button
            onClick={onDelete}
            disabled={isLocked}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            <span>删除规则</span>
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * 规则设置 Tab 主组件
 */
const RulesTab: React.FC<RulesTabProps> = ({
  rules,
  onRulesChange,
  constraints,
  onConstraintsChange,
  onSaveRules,
  onStartMatching,
  isMatching,
  matchingProgress,
  participantCount,
  isRulesLocked = false,
  isRematchMode = false,
  lockedGroupsCount = 0,
  onCancelRematchMode,
  savedConfigs = [],
  onLoadConfig,
  onDeleteConfig,
}) => {
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);

  // 保存配置弹窗状态
  const [showSaveConfigDialog, setShowSaveConfigDialog] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // 计算启用规则和权重总和
  const { enabledRules, totalWeight } = useMemo(() => {
    const enabled = rules.filter((r) => r.enabled);
    const total = enabled.reduce((sum, r) => sum + r.weight, 0);
    return { enabledRules: enabled, totalWeight: total };
  }, [rules]);

  // 更新规则权重
  const handleWeightChange = (ruleId: string, weight: number) => {
    onRulesChange(rules.map((r) => (r.id === ruleId ? { ...r, weight } : r)));
  };

  // 切换规则启用
  const handleToggleRule = (ruleId: string) => {
    onRulesChange(
      rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)),
    );
  };

  // 删除规则
  const handleDeleteRule = (ruleId: string) => {
    onRulesChange(rules.filter((r) => r.id !== ruleId));
  };

  // 添加自定义规则
  const handleAddRule = (rule: MatchRule) => {
    onRulesChange([...rules, rule]);
    setShowAddModal(false);
    Toast.show({ content: "规则已添加", icon: "success" });
  };

  // 打开保存配置弹窗
  const handleOpenSaveDialog = () => {
    if (rules.length === 0) {
      Toast.show({ content: "暂无规则可保存", icon: "fail" });
      return;
    }
    setShowSaveConfigDialog(true);
  };

  // 保存配置确认
  const handleSaveConfigConfirm = async (configName: string) => {
    setIsSavingConfig(true);
    try {
      await onSaveRules(configName);
      setShowSaveConfigDialog(false);
      Toast.show({ content: `配置"${configName}"已保存`, icon: "success" });
    } catch (error) {
      Toast.show({ content: "保存失败，请重试", icon: "fail" });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // 加载已保存的配置
  const handleLoadConfig = (config: SavedConfig) => {
    if (onLoadConfig) {
      onLoadConfig(config);
      setShowSaveConfigDialog(false);
      Toast.show({ content: `已加载配置"${config.name}"`, icon: "success" });
    }
  };

  // 开始匹配前验证
  const handleStartMatching = async () => {
    if (enabledRules.length === 0) {
      Toast.show({ content: "请至少启用一条匹配规则", icon: "fail" });
      return;
    }
    if (participantCount === 0) {
      Toast.show({ content: "暂无参与者数据", icon: "fail" });
      return;
    }
    await onStartMatching();
  };

  return (
    <div className="pb-32">
      {/* 重新匹配模式提示 Banner */}
      {isRematchMode && (
        <div className="mb-4 p-4 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <RefreshCw size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  重新匹配模式
                </h4>
                {onCancelRematchMode && (
                  <button
                    onClick={onCancelRematchMode}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white/60 rounded-lg transition-colors"
                  >
                    <X size={14} />
                    取消
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                调整规则后点击"开始匹配"重新计算未锁定的分组
              </p>
              {lockedGroupsCount > 0 && (
                <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-white/60 rounded-lg w-fit">
                  <Lock size={12} className="text-amber-500" />
                  <span className="text-xs font-medium text-amber-700">
                    {lockedGroupsCount} 个分组已锁定，将保持不变
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 匹配进行中提示 */}
      {isRulesLocked && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Loader2 size={20} className="text-amber-600 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">正在匹配中...</p>
            <p className="text-xs text-amber-600 mt-0.5">
              匹配过程中规则配置已锁定，完成后可继续编辑
            </p>
          </div>
        </div>
      )}

      {/* 规则列表 */}
      {rules.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">
                匹配规则
              </h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {rules.length} 条
              </span>
            </div>
            {enabledRules.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">权重总和: </span>
                <span className="font-semibold text-primary-500">
                  {totalWeight}%
                </span>
              </div>
            )}
          </div>

          {/* 权重说明 */}
          {enabledRules.length > 0 && totalWeight !== 100 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-600">
                💡 系统会自动按比例归一化权重，无需手动调整到 100%
              </p>
            </div>
          )}

          {/* 规则卡片列表 */}
          <div className="space-y-3">
            {rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onToggle={() => handleToggleRule(rule.id!)}
                onWeightChange={(weight) =>
                  handleWeightChange(rule.id!, weight)
                }
                onDelete={() => handleDeleteRule(rule.id!)}
                isExpanded={expandedRuleId === rule.id}
                onExpandToggle={() =>
                  setExpandedRuleId(
                    expandedRuleId === rule.id ? null : rule.id!,
                  )
                }
                isLocked={isRulesLocked}
              />
            ))}
          </div>

          {/* 添加自定义规则按钮 */}
          <button
            onClick={() => setShowAddModal(true)}
            disabled={isRulesLocked}
            className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-500 disabled:hover:bg-transparent"
          >
            <Plus size={18} />
            添加自定义规则
          </button>
        </div>
      )}

      {/* 边界条件设置 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <button
          onClick={() => setShowConstraints(!showConstraints)}
          className="w-full px-4 md:px-6 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Settings size={16} className="text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              边界条件（可选）
            </h3>
          </div>
          <div className="text-gray-400">
            {showConstraints ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>
        </button>

        {showConstraints && (
          <div className="px-4 md:px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
            {/* 每组人数 */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-primary-500" />
                <span className="text-sm font-medium text-gray-700">
                  每组人数
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-600 rounded-full">
                  {constraints.minGroupSize || 3} -{" "}
                  {constraints.maxGroupSize || 8} 人
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    最小人数
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={constraints.maxGroupSize || 20}
                    value={constraints.minGroupSize || 3}
                    onChange={(e) =>
                      onConstraintsChange({
                        ...constraints,
                        minGroupSize: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    最大人数
                  </label>
                  <input
                    type="number"
                    min={constraints.minGroupSize || 2}
                    max={20}
                    value={constraints.maxGroupSize || 8}
                    onChange={(e) =>
                      onConstraintsChange({
                        ...constraints,
                        maxGroupSize: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
                  />
                </div>
              </div>
            </div>

            {/* 性别比例 */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Scale size={16} className="text-secondary-500" />
                <span className="text-sm font-medium text-gray-700">
                  性别比例
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-secondary-600 rounded-full">
                  {constraints.genderRatioMin || 40}% -{" "}
                  {constraints.genderRatioMax || 60}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    最小比例
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={constraints.genderRatioMin || 40}
                    onChange={(e) =>
                      onConstraintsChange({
                        ...constraints,
                        genderRatioMin: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    最大比例
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={constraints.genderRatioMax || 60}
                    onChange={(e) =>
                      onConstraintsChange({
                        ...constraints,
                        genderRatioMax: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
                  />
                </div>
              </div>
            </div>

            {/* 同行业限制 */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={16} className="text-accent-500" />
                <span className="text-sm font-medium text-gray-700">
                  同行业限制
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-accent-600 rounded-full">
                  最多 {constraints.sameIndustryMax || 2} 人
                </span>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  同行业最多人数
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={constraints.sameIndustryMax || 2}
                  onChange={(e) =>
                    onConstraintsChange({
                      ...constraints,
                      sameIndustryMax: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 匹配进度（匹配中显示）*/}
      {isMatching && (
        <div className="bg-white rounded-2xl border border-primary-200 shadow-sm p-4 md:p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 size={20} className="text-primary-500 animate-spin" />
            <h3 className="text-base font-semibold text-gray-900">
              匹配进行中...
            </h3>
          </div>
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${matchingProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-500">正在生成匹配结果...</span>
            <span className="font-medium text-primary-500">
              {matchingProgress}%
            </span>
          </div>
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
          {/* 参与人数提示 */}
          <div className="flex items-center justify-center gap-4 mb-2 text-sm">
            <span className="text-gray-500">
              参与人数:{" "}
              <span className="font-semibold text-primary-500">
                {participantCount} 人
              </span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              启用规则:{" "}
              <span className="font-semibold text-primary-500">
                {enabledRules.length} 条
              </span>
            </span>
          </div>

          {/* 按钮组 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="large"
              onClick={handleOpenSaveDialog}
              disabled={rules.length === 0}
              className="flex-1"
            >
              <span className="flex items-center gap-2">
                <Save size={18} />
                保存配置
              </span>
            </Button>
            <Button
              size="large"
              onClick={handleStartMatching}
              disabled={
                enabledRules.length === 0 ||
                participantCount === 0 ||
                isMatching
              }
              className="flex-1"
            >
              {isMatching ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  匹配中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play size={18} />
                  开始匹配
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 添加规则弹窗 */}
      <AddRuleModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRule}
        existingRules={rules}
      />

      {/* 保存配置命名弹窗 */}
      <SaveConfigDialog
        visible={showSaveConfigDialog}
        rules={rules}
        savedConfigs={savedConfigs}
        onConfirm={handleSaveConfigConfirm}
        onCancel={() => setShowSaveConfigDialog(false)}
        onLoadConfig={onLoadConfig ? handleLoadConfig : undefined}
        onDeleteConfig={onDeleteConfig}
        isLoading={isSavingConfig}
      />
    </div>
  );
};

export default RulesTab;
