/**
 * QuotaIndicator - 配额指示器
 *
 * 展示商家当月的发现用户配额使用情况：
 * - 解锁次数剩余
 * - 查看次数剩余
 * - 当前套餐信息
 */

import React from "react";
import { Zap, Eye, Crown } from "lucide-react";
import type { DiscoveryQuota } from "@/features/merchant/user-pool/types";

// ========================================
// 类型定义
// ========================================

export interface QuotaIndicatorProps {
  quota: DiscoveryQuota;
  onUpgrade?: () => void;
}

// ========================================
// 组件
// ========================================

const QuotaIndicator: React.FC<QuotaIndicatorProps> = ({
  quota,
  onUpgrade,
}) => {
  const unlockRemaining = quota.freeUnlockLimit - quota.usedUnlocks;
  const viewRemaining = quota.freeViewLimit - quota.usedViews;
  const unlockPercent = (quota.usedUnlocks / quota.freeUnlockLimit) * 100;
  const viewPercent = (quota.usedViews / quota.freeViewLimit) * 100;

  return (
    <div className="bg-gradient-to-r from-primary-50 via-white to-accent-50 rounded-xl border border-primary-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crown size={16} className="text-accent-500" />
          <span className="text-sm font-semibold text-gray-900">
            {quota.planName}
          </span>
        </div>
        {onUpgrade && (
          <button
          className="flex flex-nowrap items-center gap-1 whitespace-nowrap text-xs font-medium text-accent-600 transition-colors hover:text-accent-700 [&>svg]:shrink-0"
            onClick={onUpgrade}
          >
            <Zap size={12} />
            升级套餐
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 解锁配额 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Zap size={12} />
              解锁额度
            </div>
            <span className="text-xs font-medium text-gray-700">
              {unlockRemaining}/{quota.freeUnlockLimit}
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                unlockPercent > 80
                  ? "bg-error-400"
                  : unlockPercent > 50
                    ? "bg-warning-400"
                    : "bg-primary-400"
              }`}
              style={{ width: `${Math.min(unlockPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* 查看配额 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye size={12} />
              查看额度
            </div>
            <span className="text-xs font-medium text-gray-700">
              {viewRemaining}/{quota.freeViewLimit}
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                viewPercent > 80
                  ? "bg-error-400"
                  : viewPercent > 50
                    ? "bg-warning-400"
                    : "bg-accent-400"
              }`}
              style={{ width: `${Math.min(viewPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotaIndicator;
