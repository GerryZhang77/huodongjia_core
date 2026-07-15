/**
 * RestoreHistoryDialog - 恢复历史记录确认弹窗
 * 确认恢复历史匹配结果作为当前结果
 */

import React from "react";
import {
  RotateCcw,
  AlertTriangle,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { MatchingHistory } from "../../types";

export interface RestoreHistoryDialogProps {
  visible: boolean;
  historyItem: MatchingHistory | null;
  historyIndex?: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * 恢复历史记录确认弹窗
 */
export const RestoreHistoryDialog: React.FC<RestoreHistoryDialogProps> = ({
  visible,
  historyItem,
  historyIndex = 0,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!visible || !historyItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* 标题栏 */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              <RotateCcw size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                恢复历史记录
              </h3>
              <p className="text-sm text-gray-500">
                将此记录恢复为当前匹配结果
              </p>
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="p-5 space-y-4">
          {/* 历史记录信息 */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-600">
                {historyIndex + 1}
              </div>
              <div>
                <span className="text-sm font-semibold text-purple-800">
                  第 {historyIndex + 1} 次匹配
                </span>
                {historyItem.isPublished && (
              <span className="ml-2 whitespace-nowrap rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                    已发布
                  </span>
                )}
              </div>
            </div>

            {/* 匹配时间 */}
            <div className="flex items-center gap-2 text-sm text-purple-700 mb-2">
              <Clock size={14} />
              <span>匹配时间：{formatDate(historyItem.executedAt)}</span>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-purple-600">
                <Users size={14} />
                <span>{historyItem.statistics.totalGroups} 组</span>
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                <CheckCircle size={14} />
                <span>
                  平均 {historyItem.statistics.avgScore.toFixed(0)} 分
                </span>
              </div>
              <div className="text-xs text-purple-500">
                {historyItem.statistics.totalParticipants} 人
              </div>
            </div>
          </div>

          {/* 警告提示 */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle
              size={16}
              className="text-amber-500 mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-amber-700">
              恢复后，当前的匹配结果将被替换为此历史记录的结果。此操作不会影响已发布的结果。
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="large"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            size="large"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <RotateCcw size={18} className="animate-spin" />
                恢复中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RotateCcw size={18} />
                确认恢复
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestoreHistoryDialog;
