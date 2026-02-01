/**
 * MatchingHistoryPanel - 匹配历史记录面板
 * 显示历史匹配结果列表，支持查看和恢复
 */

import React, { useState } from "react";
import {
  History,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  CheckCircle,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { MatchingHistory } from "../../types";

export interface MatchingHistoryPanelProps {
  history: MatchingHistory[];
  currentHistoryId?: string;
  onViewHistory: (historyItem: MatchingHistory) => void;
  onRestoreHistory?: (historyItem: MatchingHistory) => void;
  isLoading?: boolean;
}

/**
 * 历史记录卡片
 */
interface HistoryCardProps {
  item: MatchingHistory;
  index: number;
  isCurrent: boolean;
  onView: () => void;
  onRestore?: () => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  item,
  index,
  isCurrent,
  onView,
  onRestore,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return "刚刚";
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isCurrent
          ? "bg-primary-50 border-primary-200"
          : "bg-white border-gray-100 hover:border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
              isCurrent
                ? "bg-primary-100 text-primary-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                第 {index + 1} 次匹配
              </span>
              {item.isPublished && (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                  已发布
                </span>
              )}
              {isCurrent && !item.isPublished && (
                <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-600 rounded-full">
                  当前
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
              <Clock size={12} />
              <span>{formatDate(item.executedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Users size={14} />
          <span>{item.statistics.totalGroups} 组</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <CheckCircle size={14} />
          <span>平均 {item.statistics.avgScore.toFixed(0)} 分</span>
        </div>
        <div className="text-xs text-gray-400">
          {item.statistics.totalParticipants} 人参与
        </div>
      </div>

      {/* 使用的规则标签 */}
      {item.rules && item.rules.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.rules
            .filter((r) => r.enabled)
            .slice(0, 3)
            .map((rule, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {rule.name}
              </span>
            ))}
          {item.rules.filter((r) => r.enabled).length > 3 && (
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
              +{item.rules.filter((r) => r.enabled).length - 3}
            </span>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
        >
          <Eye size={14} />
          查看详情
        </button>
        {onRestore && !isCurrent && (
          <button
            onClick={onRestore}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            恢复
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * 匹配历史记录面板
 */
export const MatchingHistoryPanel: React.FC<MatchingHistoryPanelProps> = ({
  history,
  currentHistoryId,
  onViewHistory,
  onRestoreHistory,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 显示的历史记录数量
  const displayCount = isExpanded ? history.length : 3;
  const displayHistory = history.slice(0, displayCount);
  const hasMore = history.length > 3;

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* 标题栏 */}
      <div className="px-4 md:px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              <History size={16} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                历史匹配记录
              </h3>
              <p className="text-xs text-gray-500">
                共 {history.length} 次匹配
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 历史记录列表 */}
      <div className="p-4 md:p-5 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {displayHistory.map((item, index) => (
              <HistoryCard
                key={item.id}
                item={item}
                index={history.length - 1 - index} // 倒序显示序号
                isCurrent={item.id === currentHistoryId}
                onView={() => onViewHistory(item)}
                onRestore={
                  onRestoreHistory ? () => onRestoreHistory(item) : undefined
                }
              />
            ))}

            {/* 展开/收起按钮 */}
            {hasMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-2 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    收起
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    查看更多 ({history.length - 3} 条)
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MatchingHistoryPanel;
