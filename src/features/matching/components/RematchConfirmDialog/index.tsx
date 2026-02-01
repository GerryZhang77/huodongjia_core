/**
 * RematchConfirmDialog - 重新匹配确认对话框
 * 显示锁定分组信息，让用户确认后跳转到规则调整页面
 */

import React, { useMemo } from "react";
import { Lock, AlertTriangle, Settings, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui";

export interface MatchGroupInfo {
  id: string;
  name?: string;
  members: string[];
  isLocked: boolean;
}

export interface RematchConfirmDialogProps {
  visible: boolean;
  groups: MatchGroupInfo[];
  participantCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * 重新匹配确认对话框
 */
export const RematchConfirmDialog: React.FC<RematchConfirmDialogProps> = ({
  visible,
  groups,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  participantCount,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  // 计算统计数据
  const stats = useMemo(() => {
    const lockedGroups = groups.filter((g) => g.isLocked);
    const unlockedGroups = groups.filter((g) => !g.isLocked);
    const lockedMemberCount = lockedGroups.reduce(
      (sum, g) => sum + g.members.length,
      0,
    );
    const unlockedMemberCount = unlockedGroups.reduce(
      (sum, g) => sum + g.members.length,
      0,
    );

    return {
      totalGroups: groups.length,
      lockedGroups: lockedGroups.length,
      unlockedGroups: unlockedGroups.length,
      lockedMemberCount,
      unlockedMemberCount,
      lockedGroupNames: lockedGroups.map(
        (g) => g.name || `第 ${groups.indexOf(g) + 1} 组`,
      ),
    };
  }, [groups]);

  if (!visible) return null;

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <Settings size={20} className="text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">重新匹配</h3>
              <p className="text-sm text-gray-500">
                调整规则后重新计算未锁定分组
              </p>
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="p-5 space-y-4">
          {/* 锁定分组信息 */}
          {stats.lockedGroups > 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={18} className="text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                  已锁定的分组将保持不变
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700">锁定分组数</span>
                  <span className="font-semibold text-amber-800">
                    {stats.lockedGroups} 组
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700">锁定人数</span>
                  <span className="font-semibold text-amber-800">
                    {stats.lockedMemberCount} 人
                  </span>
                </div>
                {stats.lockedGroupNames.length > 0 &&
                  stats.lockedGroupNames.length <= 5 && (
                    <div className="pt-2 border-t border-amber-200">
                      <p className="text-xs text-amber-600">
                        锁定分组：{stats.lockedGroupNames.join("、")}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-blue-500" />
                <span className="text-sm text-blue-700">
                  暂无锁定的分组，所有分组都将重新计算
                </span>
              </div>
            </div>
          )}

          {/* 重新匹配信息 */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-800">
                重新匹配范围
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">待匹配分组</span>
                <span className="font-semibold text-gray-900">
                  {stats.unlockedGroups} 组
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">待匹配人数</span>
                <span className="font-semibold text-gray-900">
                  {stats.unlockedMemberCount} 人
                </span>
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
            <AlertTriangle
              size={16}
              className="text-blue-500 mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-blue-700">
              点击"去调整规则"将跳转到规则配置页面，您可以调整匹配规则后点击"开始匹配"重新计算。已锁定的分组将保持不变。
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
            disabled={isLoading || stats.unlockedMemberCount === 0}
            className="flex-1"
          >
            <span className="flex items-center gap-2">
              <Settings size={18} />
              去调整规则
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RematchConfirmDialog;
