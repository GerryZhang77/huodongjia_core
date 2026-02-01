/**
 * Matching Module - Constants
 * 匹配模块 - 常量定义
 */

import type { RuleType } from "../types";

// 兼容别名
type MatchRuleType =
  | RuleType
  | "age"
  | "gender"
  | "interests"
  | "location"
  | "skill";
type RulePriority = "high" | "medium" | "low";

/**
 * 规则类型选项
 */
export const RULE_TYPE_OPTIONS = [
  { label: "相似度匹配", value: "similarity" as RuleType },
  { label: "多样性匹配", value: "diversity" as RuleType },
  { label: "约束条件", value: "constraint" as RuleType },
  { label: "偏好设置", value: "preference" as RuleType },
  { label: "自定义", value: "custom" as RuleType },
];

/**
 * 旧版规则类型选项 (兼容)
 * @deprecated 使用 RULE_TYPE_OPTIONS
 */
export const LEGACY_RULE_TYPE_OPTIONS = [
  { label: "年龄匹配", value: "age" as MatchRuleType },
  { label: "性别匹配", value: "gender" as MatchRuleType },
  { label: "兴趣爱好", value: "interests" as MatchRuleType },
  { label: "地理位置", value: "location" as MatchRuleType },
  { label: "技能水平", value: "skill" as MatchRuleType },
  { label: "自定义", value: "custom" as MatchRuleType },
];

/**
 * 优先级选项
 * @deprecated 使用 weight (0-100) 代替
 */
export const PRIORITY_OPTIONS = [
  { label: "高", value: "high" as RulePriority },
  { label: "中", value: "medium" as RulePriority },
  { label: "低", value: "low" as RulePriority },
];

/**
 * 获取优先级颜色
 * @deprecated 使用 weight 代替
 */
export const getPriorityColor = (priority: RulePriority): string => {
  switch (priority) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    default:
      return "default";
  }
};

/**
 * 获取规则类型文本
 */
export const getRuleTypeText = (type: RuleType | MatchRuleType): string => {
  const allOptions = [...RULE_TYPE_OPTIONS, ...LEGACY_RULE_TYPE_OPTIONS];
  const option = allOptions.find((opt) => opt.value === type);
  return option?.label || type;
};

/**
 * 获取匹配分数颜色
 */
export const getScoreColor = (score: number): string => {
  if (score >= 0.8) return "var(--adm-color-success)"; // 绿色 - 高匹配
  if (score >= 0.6) return "var(--adm-color-warning)"; // 黄色 - 中等匹配
  return "var(--adm-color-danger)"; // 红色 - 低匹配
};

/**
 * 格式化匹配分数
 */
export const formatScore = (score: number): string => {
  return `${Math.round(score * 100)}%`;
};
