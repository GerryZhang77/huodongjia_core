/**
 * 匹配结果 Tab 组件 (重构版)
 * 展示匹配生成的分组结果，支持拖拽调整、锁定分组、发布结果
 */

import React, { useState, useMemo } from "react";
import { Dialog } from "antd-mobile";
import {
  Users,
  RefreshCw,
  Send,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart3,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui";
import { UserHoverCard } from "@/components/business/UserHoverCard";
import type { MatchingGroup, MatchingRule } from "../../types";

// 类型别名 - 兼容
type MatchGroup = MatchingGroup;
type MatchRule = MatchingRule;

// 简化的参与者类型，用于组件内部
interface Participant {
  id: string;
  name: string;
  gender?: string;
  industry?: string;
  occupation?: string;
  tags?: string[];
  city?: string;
}

// 简化的分组类型（兼容组件需要）
interface DisplayGroup {
  id: string;
  name?: string;
  members: string[];
  score: number;
  reasons?: string[];
  warnings?: string[];
  isLocked: boolean;
}

interface ResultsTabProps {
  groups: DisplayGroup[];
  onGroupsChange: (groups: DisplayGroup[]) => void;
  participants: Participant[];
  rules: MatchRule[];
  isPublishing: boolean;
  onPublish: () => Promise<void>;
  onRematch: () => Promise<void>;
  isRematching: boolean;
  matchingStats?: {
    avgScore: number;
    minScore: number;
    maxScore: number;
  };
}

/**
 * 成员头像组件
 */
const MemberAvatar: React.FC<{
  participant: Participant;
  size?: "sm" | "md";
}> = ({ participant, size = "md" }) => {
  const sizeClasses = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  // 根据性别设置颜色
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
 * 成员卡片 - 集成 UserHoverCard
 */
interface MemberCardProps {
  participant: Participant;
  isDraggable?: boolean;
  matchScore?: number;
}

const MemberCard: React.FC<MemberCardProps> = ({
  participant,
  isDraggable: _isDraggable,
  matchScore,
}) => {
  // 转换为 UserHoverCard 需要的格式
  const userBrief = {
    id: participant.id,
    name: participant.name,
    avatar: undefined, // participant 中暂无 avatar
    occupation: participant.occupation,
    city: participant.city,
    tags: participant.tags,
  };

  return (
    <UserHoverCard user={userBrief} matchScore={matchScore} placement="right">
      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer">
        <MemberAvatar participant={participant} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {participant.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {participant.industry || participant.occupation || "未知"}
          </p>
        </div>
      </div>
    </UserHoverCard>
  );
};

/**
 * 分组卡片组件
 */
interface GroupCardProps {
  group: DisplayGroup;
  index: number;
  participants: Participant[];
  onToggleLock: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMemberMove?: (
    memberId: string,
    fromGroupId: string,
    toGroupId: string,
  ) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  index,
  participants,
  onToggleLock,
  isExpanded,
  onToggleExpand,
}) => {
  // 获取组内成员详情
  const members = useMemo(() => {
    return group.members
      .map((memberId) => participants.find((p) => p.id === memberId))
      .filter(Boolean) as Participant[];
  }, [group.members, participants]);

  // 计算组内性别比例
  const genderStats = useMemo(() => {
    const male = members.filter((m) => m.gender === "male").length;
    const female = members.filter((m) => m.gender === "female").length;
    const other = members.length - male - female;
    return { male, female, other };
  }, [members]);

  // 评分颜色
  const scoreColor =
    group.score >= 80
      ? "text-green-600 bg-green-50"
      : group.score >= 60
        ? "text-primary-600 bg-primary-50"
        : "text-orange-600 bg-orange-50";

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        group.isLocked ? "border-amber-200 bg-amber-50/30" : "border-gray-100"
      }`}
    >
      {/* 头部 */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* 组序号 */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-primary-600">
            {index + 1}
          </span>
        </div>

        {/* 组信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">
              {group.name || `第 ${index + 1} 组`}
            </h4>
            {group.isLocked && <Lock size={14} className="text-amber-500" />}
            {group.warnings && group.warnings.length > 0 && (
              <AlertTriangle size={14} className="text-orange-500" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-sm text-gray-500">{members.length} 人</span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500">
              男 {genderStats.male} / 女 {genderStats.female}
            </span>
          </div>
        </div>

        {/* 评分 */}
        <div
          className={`px-3 py-1 rounded-full text-sm font-semibold ${scoreColor}`}
        >
          {group.score.toFixed(0)}分
        </div>

        {/* 展开图标 */}
        <div className="text-gray-400">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          {/* 成员列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                participant={member}
                isDraggable={!group.isLocked}
                matchScore={group.score}
              />
            ))}
          </div>

          {/* 匹配理由 */}
          {group.reasons && group.reasons.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-xs font-medium text-green-700">
                  匹配理由
                </span>
              </div>
              <ul className="space-y-1">
                {group.reasons.slice(0, 3).map((reason, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-green-600 pl-4 relative before:content-['•'] before:absolute before:left-1"
                  >
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 警告 */}
          {group.warnings && group.warnings.length > 0 && (
            <div className="mb-4 p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={14} className="text-orange-500" />
                <span className="text-xs font-medium text-orange-700">
                  注意事项
                </span>
              </div>
              <ul className="space-y-1">
                {group.warnings.map((warning, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-orange-600 pl-4 relative before:content-['•'] before:absolute before:left-1"
                  >
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                group.isLocked
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {group.isLocked ? (
                <>
                  <Unlock size={14} />
                  <span>解锁</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>锁定</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 匹配结果 Tab 主组件
 */
const ResultsTab: React.FC<ResultsTabProps> = ({
  groups,
  onGroupsChange,
  participants,
  rules: _rules, // 预留，用于未来规则展示
  isPublishing,
  onPublish,
  onRematch,
  isRematching,
  matchingStats,
}) => {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);

  // 计算统计数据
  const stats = useMemo(() => {
    if (!groups.length) return null;

    const lockedCount = groups.filter((g) => g.isLocked).length;
    const warningCount = groups.filter(
      (g) => g.warnings && g.warnings.length > 0,
    ).length;
    const totalMembers = groups.reduce((sum, g) => sum + g.members.length, 0);
    const avgGroupSize = (totalMembers / groups.length).toFixed(1);

    return {
      groupCount: groups.length,
      lockedCount,
      warningCount,
      totalMembers,
      avgGroupSize,
      avgScore: matchingStats?.avgScore || 0,
      minScore: matchingStats?.minScore || 0,
      maxScore: matchingStats?.maxScore || 0,
    };
  }, [groups, matchingStats]);

  // 切换锁定状态
  const handleToggleLock = (groupId: string) => {
    onGroupsChange(
      groups.map((g) =>
        g.id === groupId ? { ...g, isLocked: !g.isLocked } : g,
      ),
    );
  };

  // 发布前确认
  const handlePublish = async () => {
    const result = await Dialog.confirm({
      title: "发布匹配结果",
      content: "发布后将通知所有参与者查看分组结果，确定发布吗？",
      confirmText: "确定发布",
      cancelText: "再想想",
    });

    if (result) {
      await onPublish();
    }
  };

  // 无结果状态
  if (!groups.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Users size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无匹配结果</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          请先在「规则设置」中配置匹配规则，然后点击开始匹配
        </p>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* 统计概览 */}
      {stats && showStats && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-primary-500" />
              <h3 className="text-base font-semibold text-gray-900">
                匹配统计
              </h3>
            </div>
            <button
              onClick={() => setShowStats(false)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              收起
            </button>
          </div>

          {/* 统计数据网格 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-primary-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-primary-600">
                {stats.groupCount}
              </p>
              <p className="text-xs text-primary-500 mt-0.5">总分组数</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.avgScore.toFixed(0)}
              </p>
              <p className="text-xs text-green-500 mt-0.5">平均得分</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-600">
                {stats.avgGroupSize}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">平均人数</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-amber-600">
                {stats.lockedCount}
              </p>
              <p className="text-xs text-amber-500 mt-0.5">已锁定</p>
            </div>
          </div>

          {/* 分数范围 */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">分数范围</span>
              <span className="font-medium text-gray-700">
                {stats.minScore.toFixed(0)} ~ {stats.maxScore.toFixed(0)} 分
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 via-primary-400 to-green-400 rounded-full"
                style={{
                  marginLeft: `${stats.minScore}%`,
                  width: `${stats.maxScore - stats.minScore}%`,
                }}
              />
            </div>
          </div>

          {/* 警告提示 */}
          {stats.warningCount > 0 && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-orange-50 rounded-xl">
              <AlertTriangle size={16} className="text-orange-500" />
              <span className="text-sm text-orange-600">
                {stats.warningCount} 个分组存在警告，请检查后再发布
              </span>
            </div>
          )}
        </div>
      )}

      {/* 收起状态的统计显示 */}
      {stats && !showStats && (
        <button
          onClick={() => setShowStats(true)}
          className="w-full mb-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              共{" "}
              <span className="font-semibold text-primary-600">
                {stats.groupCount}
              </span>{" "}
              组
            </span>
            <span className="text-gray-500">
              平均{" "}
              <span className="font-semibold text-green-600">
                {stats.avgScore.toFixed(0)}
              </span>{" "}
              分
            </span>
          </div>
          <span className="text-xs text-gray-400">展开</span>
        </button>
      )}

      {/* 操作提示 */}
      <div className="mb-4 flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
        <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-600">
          点击分组卡片可展开查看详情，锁定的分组在重新匹配时将保持不变
        </p>
      </div>

      {/* 分组列表 */}
      <div className="space-y-3">
        {groups.map((group, index) => (
          <GroupCard
            key={group.id}
            group={group}
            index={index}
            participants={participants}
            onToggleLock={() => handleToggleLock(group.id)}
            isExpanded={expandedGroupId === group.id}
            onToggleExpand={() =>
              setExpandedGroupId(expandedGroupId === group.id ? null : group.id)
            }
          />
        ))}
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
          {/* 状态提示 */}
          <div className="flex items-center justify-center gap-4 mb-2 text-sm">
            <span className="text-gray-500">
              共{" "}
              <span className="font-semibold text-primary-500">
                {groups.length}
              </span>{" "}
              个分组
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              已锁定{" "}
              <span className="font-semibold text-amber-500">
                {stats?.lockedCount || 0}
              </span>{" "}
              个
            </span>
          </div>

          {/* 按钮组 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="large"
              onClick={onRematch}
              disabled={isRematching || isPublishing}
              className="flex-1"
            >
              {isRematching ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  重新匹配中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw size={18} />
                  重新匹配
                </span>
              )}
            </Button>
            <Button
              size="large"
              onClick={handlePublish}
              disabled={isPublishing || isRematching}
              className="flex-1"
            >
              {isPublishing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  发布中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send size={18} />
                  发布结果
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsTab;
