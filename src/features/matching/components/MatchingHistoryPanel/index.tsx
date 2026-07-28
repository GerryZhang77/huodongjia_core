/**
 * MatchingHistoryPanel - 匹配历史记录面板
 * 显示历史匹配版本；只有接口返回完整结果快照时才允许查看详情。
 */

import React, { useState } from "react";
import {
  History,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  Eye,
} from "lucide-react";
import type { MatchingHistory } from "../../types";

export interface MatchingHistoryPanelProps {
  history: MatchingHistory[];
  currentHistoryId?: string;
  onViewHistory?: (historyItem: MatchingHistory) => void;
  isLoading?: boolean;
}

/**
 * 历史记录卡片
 */
interface HistoryCardProps {
  item: MatchingHistory;
  index: number;
  isCurrent: boolean;
  onView?: () => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  item,
  index,
  isCurrent,
  onView,
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
                第 {item.version ?? index + 1} 版
              </span>
              {(item.resultState === "published" || item.isPublished) && (
          <span className="whitespace-nowrap rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                  已发布
                </span>
              )}
              {item.resultState === "draft" && (
          <span className="whitespace-nowrap rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-600">
                  草稿
                </span>
              )}
              {item.resultState === "superseded" && (
          <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  已归档
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
      {item.groups.length > 0 ? (
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Users size={14} />
            <span>{item.statistics.totalGroups} 组</span>
          </div>
          <div className="text-xs text-gray-400">
            {item.statistics.totalParticipants} 人参与
          </div>
        </div>
      ) : (
        <div className="mb-3 text-xs leading-5 text-gray-500">
          当前接口仅保留此版本的状态与规则快照，未返回可浏览的结果快照。
        </div>
      )}

      {/* 使用的规则标签 */}
      {item.rules && item.rules.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.rules
            .filter((r) => r.enabled)
            .slice(0, 3)
            .map((rule, idx) => (
              <span
                key={idx}
                className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {rule.name}
              </span>
            ))}
          {item.rules.filter((r) => r.enabled).length > 3 && (
            <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs tabular-nums text-gray-500">
              +{item.rules.filter((r) => r.enabled).length - 3}
            </span>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      {onView && item.groups.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex flex-1 flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-50 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100 [&>svg]:shrink-0"
          >
            <Eye size={14} />
            查看详情
          </button>
        </div>
      )}
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
                共 {history.length} 个版本
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
                onView={onViewHistory ? () => onViewHistory(item) : undefined}
              />
            ))}

            {/* 展开/收起按钮 */}
            {hasMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full flex-nowrap items-center justify-center gap-1 whitespace-nowrap py-2 text-sm text-gray-500 transition-colors hover:text-gray-700 [&>svg]:shrink-0"
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
