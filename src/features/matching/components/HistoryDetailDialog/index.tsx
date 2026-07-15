/**
 * HistoryDetailDialog - 历史记录详情弹窗
 * 展示历史匹配结果的具体分组信息
 */

import React, { useState, useMemo } from "react";
import {
  X,
  Clock,
  Users,
  CheckCircle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Lock,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { MatchingHistory } from "../../types";

/**
 * 简化的参与者类型（兼容组件内部使用）
 */
interface SimpleParticipant {
  id: string;
  name: string;
  gender?: string;
  industry?: string;
  occupation?: string;
  tags?: string[];
  city?: string;
}

export interface HistoryDetailDialogProps {
  visible: boolean;
  historyItem: MatchingHistory | null;
  historyIndex?: number;
  participants: SimpleParticipant[];
  onClose: () => void;
  onRestore?: (historyItem: MatchingHistory) => void;
  isRestoring?: boolean;
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * 成员头像组件
 */
const MemberAvatar: React.FC<{
  participant: SimpleParticipant | undefined;
  size?: "sm" | "md";
}> = ({ participant, size = "sm" }) => {
  const sizeClasses = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";

  if (!participant) {
    return (
      <div
        className={`${sizeClasses} bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-medium flex-shrink-0`}
      >
        ?
      </div>
    );
  }

  const bgColor =
    participant.gender === "male"
      ? "bg-blue-100 text-blue-600"
      : participant.gender === "female"
        ? "bg-pink-100 text-pink-600"
        : "bg-gray-100 text-gray-600";

  return (
    <div
      className={`${sizeClasses} ${bgColor} rounded-full flex items-center justify-center font-medium flex-shrink-0`}
      title={participant.name}
    >
      {participant.name?.charAt(0) || "?"}
    </div>
  );
};

/**
 * 兼容的分组类型 - 支持两种格式
 */
interface CompatibleGroup {
  id?: string;
  group_id?: string;
  name?: string;
  group_name?: string;
  members: (string | Record<string, unknown>)[];
  score?: number;
  similarity_score?: number;
  reasons?: string[];
  match_reasons?: string[];
  warnings?: string[];
  isLocked?: boolean;
  is_locked?: boolean;
}

/**
 * 分组卡片组件
 * 注意：group.members 可能是两种格式：
 * 1. string[] - ID 列表（前端标准格式）
 * 2. object[] - 包含成员详情的对象数组（Mock 数据格式）
 */
interface GroupCardProps {
  group: CompatibleGroup;
  index: number;
  participants: SimpleParticipant[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  index,
  participants,
  isExpanded,
  onToggleExpand,
}) => {
  // 获取组内成员详情 - 兼容两种数据格式
  const members = useMemo(() => {
    const rawMembers = group.members || [];

    // 检查第一个成员是字符串还是对象
    if (rawMembers.length === 0) return [];

    const firstMember = rawMembers[0];

    if (typeof firstMember === "string") {
      // 格式 1: ID 列表 - 从 participants 中查找
      return rawMembers
        .map((memberId: string) => participants.find((p) => p.id === memberId))
        .filter(Boolean) as SimpleParticipant[];
    } else if (typeof firstMember === "object") {
      // 格式 2: 对象数组 (Mock 数据) - 直接转换
      return rawMembers.map((m: Record<string, unknown>) => {
        const profile = m.profile as Record<string, unknown> | undefined;
        return {
          id: (m.user_id || m.id) as string,
          name: m.name as string,
          gender: m.gender as string | undefined,
          industry: (profile?.industry || m.industry) as string | undefined,
          occupation: (profile?.occupation || m.occupation) as
            | string
            | undefined,
          city: (profile?.city || m.city) as string | undefined,
          tags: (m.keywords || m.tags) as string[] | undefined,
        };
      }) as SimpleParticipant[];
    }

    return [];
  }, [group.members, participants]);

  // 计算组内性别比例
  const genderStats = useMemo(() => {
    const male = members.filter((m) => m.gender === "male").length;
    const female = members.filter((m) => m.gender === "female").length;
    return { male, female, other: members.length - male - female };
  }, [members]);

  // 获取分数 - 兼容两种格式 (0-1 小数 或 0-100 整数)
  const rawScore = group.similarity_score ?? group.score ?? 0;
  // 如果分数小于等于1，认为是小数，转换为百分制
  const score =
    rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);

  // 评分颜色
  const scoreColor =
    score >= 80
      ? "text-green-600 bg-green-50"
      : score >= 60
        ? "text-primary-600 bg-primary-50"
        : score >= 40
          ? "text-amber-600 bg-amber-50"
          : "text-red-600 bg-red-50";

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* 头部 */}
      <div
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
            {index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {group.group_name || group.name || `第 ${index + 1} 组`}
              </span>
              {(group.is_locked || group.isLocked) && (
                <Lock size={12} className="text-amber-500" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
              <span>{members.length} 人</span>
              <span>·</span>
              <span>
                男 {genderStats.male} / 女 {genderStats.female}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-2 py-1 rounded-lg text-xs font-semibold ${scoreColor}`}
          >
            {score} 分
          </div>
          <div className="text-gray-400">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-100">
          {/* 成员列表 */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <MemberAvatar participant={member} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {member.industry || member.occupation || "未知"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 匹配理由 */}
          {((group.match_reasons || group.reasons) ?? []).length > 0 && (
            <div className="p-2 bg-green-50 rounded-lg">
              <p className="text-xs font-medium text-green-700 mb-1">
                匹配理由
              </p>
              <ul className="space-y-0.5">
                {(group.match_reasons || group.reasons || []).map(
                  (reason: string, idx: number) => (
                    <li
                      key={idx}
                      className="text-xs text-green-600 flex items-start gap-1"
                    >
                      <CheckCircle size={10} className="mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {/* 警告 */}
          {group.warnings && group.warnings.length > 0 && (
            <div className="mt-2 p-2 bg-amber-50 rounded-lg">
              <p className="text-xs font-medium text-amber-700 mb-1">
                注意事项
              </p>
              <ul className="space-y-0.5">
                {group.warnings.map((warning, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-amber-600 flex items-start gap-1"
                  >
                    <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 历史记录详情弹窗
 */
export const HistoryDetailDialog: React.FC<HistoryDetailDialogProps> = ({
  visible,
  historyItem,
  historyIndex = 0,
  participants,
  onClose,
  onRestore,
  isRestoring = false,
}) => {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  if (!visible || !historyItem) return null;

  const { statistics, groups, rules, isPublished, executedAt } = historyItem;

  // 启用的规则
  const enabledRules = rules?.filter((r) => r.enabled) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-lg font-bold text-primary-600">
              {historyIndex + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  第 {historyIndex + 1} 次匹配结果
                </h3>
                {isPublished && (
                  <span className="whitespace-nowrap rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                    已发布
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-sm text-gray-500">
                <Clock size={14} />
                <span>{formatDate(executedAt)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 统计概览 */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-primary-500" />
            <span className="text-sm font-medium text-gray-700">统计概览</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl text-center">
              <p className="text-xl font-bold text-primary-600">
                {statistics.totalGroups}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">总分组</p>
            </div>
            <div className="p-3 bg-white rounded-xl text-center">
              <p className="text-xl font-bold text-green-600">
                {/* 兼容小数和整数格式 */}
                {statistics.avgScore <= 1
                  ? Math.round(statistics.avgScore * 100)
                  : Math.round(statistics.avgScore)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">平均分</p>
            </div>
            <div className="p-3 bg-white rounded-xl text-center">
              <p className="text-xl font-bold text-gray-600">
                {statistics.totalParticipants}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">参与人数</p>
            </div>
            <div className="p-3 bg-white rounded-xl text-center">
              <p className="text-xl font-bold text-amber-600">
                {/* 兼容小数和整数格式 */}
                {statistics.minScore <= 1
                  ? Math.round(statistics.minScore * 100)
                  : Math.round(statistics.minScore)}
                -
                {statistics.maxScore <= 1
                  ? Math.round(statistics.maxScore * 100)
                  : Math.round(statistics.maxScore)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">分数范围</p>
            </div>
          </div>

          {/* 使用的规则 */}
          {enabledRules.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1.5">使用的规则：</p>
              <div className="flex flex-wrap gap-1">
                {enabledRules.map((rule, idx) => (
                  <span
                    key={idx}
                          className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600"
                  >
                    {rule.name} ({rule.weight}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 分组列表 */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              分组详情 ({groups?.length || 0} 组)
            </h4>
          </div>

          {groups && groups.length > 0 ? (
            <div className="space-y-2">
              {groups.map((group, index) => (
                <GroupCard
                  key={group.id || index}
                  group={group}
                  index={index}
                  participants={participants}
                  isExpanded={expandedGroupId === (group.id || String(index))}
                  onToggleExpand={() =>
                    setExpandedGroupId(
                      expandedGroupId === (group.id || String(index))
                        ? null
                        : group.id || String(index),
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users size={40} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">暂无分组数据</p>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <Button
            variant="outline"
            size="large"
            onClick={onClose}
            className="flex-1"
          >
            关闭
          </Button>
          {onRestore && historyItem && (
            <Button
              size="large"
              onClick={() => onRestore(historyItem)}
              disabled={isRestoring}
              className="flex-1"
            >
              {isRestoring ? (
                <span className="flex items-center gap-2">
                  <RotateCcw size={18} className="animate-spin" />
                  恢复中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RotateCcw size={18} />
                  恢复此结果
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailDialog;
