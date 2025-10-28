import React from "react";
import { Card, Button, ProgressBar, Tag } from "antd-mobile";
import { PlayOutline, RedoOutline } from "antd-mobile-icons";
import { MatchingRule, MatchConstraints, MatchingStage } from "./types";

interface MatchingConsoleTabProps {
  rules: MatchingRule[];
  constraints: MatchConstraints;
  participantCount: number;
  isMatching: boolean;
  matchingProgress: number;
  matchingStage: MatchingStage;
  estimatedTimeRemaining: number;
  matchingError: string | null;
  hasMatchResult: boolean;
  onStartMatching: () => Promise<void>;
  onRematch: () => Promise<void>;
}

/**
 * Tab 2: 匹配控制台
 * 功能：显示规则摘要 → 开始匹配 → 进度条 → 重新匹配
 */
const MatchingConsoleTab: React.FC<MatchingConsoleTabProps> = ({
  rules,
  constraints,
  participantCount,
  isMatching,
  matchingProgress,
  matchingStage,
  estimatedTimeRemaining,
  matchingError,
  hasMatchResult,
  onStartMatching,
  onRematch,
}) => {
  // 组件挂载时打印日志
  React.useEffect(() => {
    console.log("=".repeat(60));
    console.log("[匹配控制台] Tab 组件已挂载/更新");
    console.log("[匹配控制台] 参与人数:", participantCount);
    console.log(
      "[匹配控制台] 启用规则数:",
      rules.filter((r) => r.enabled).length
    );
    console.log("[匹配控制台] 匹配状态:", isMatching ? "进行中" : "空闲");
    console.log("[匹配控制台] 是否有结果:", hasMatchResult);
    console.log("=".repeat(60));
  }, [participantCount, rules, isMatching, hasMatchResult]);

  // 获取启用的规则
  const enabledRules = rules.filter((r) => r.enabled);

  // 阶段描述映射
  const stageDescriptions: Record<MatchingStage, string> = {
    idle: "准备就绪",
    "extracting-keywords": "正在提取关键词...",
    "calculating-embedding": "正在计算词嵌入...",
    "calculating-similarity": "正在计算相似度...",
    matching: "正在生成匹配结果...",
    done: "匹配完成",
  };

  return (
    <div className="px-4 md:px-6 py-4">
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* 规则摘要卡片 */}
        <Card
          title="📋 当前匹配配置"
          style={{ borderRadius: "12px" } as React.CSSProperties}
        >
          <div className="space-y-3">
            {/* 启用规则 */}
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">启用规则:</span>
              <span className="text-sm font-medium text-gray-900">
                {enabledRules.length} 条
              </span>
            </div>

            {/* 权重分布 */}
            {enabledRules.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">权重分布:</div>
                <div className="flex flex-wrap gap-2">
                  {enabledRules.map((rule) => (
                    <Tag key={rule.id} color="primary" fill="outline">
                      {rule.name}({rule.weight}%)
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* 约束条件 */}
            <div>
              <div className="text-sm text-gray-600 mb-2">约束条件:</div>
              <div className="text-sm text-gray-900 space-y-1">
                <div>
                  • 组人数: {constraints.minGroupSize || 3}-
                  {constraints.maxGroupSize || 8}人
                </div>
                {constraints.genderRatioMin !== undefined && (
                  <div>
                    • 性别均衡: {constraints.genderRatioMin}%-
                    {constraints.genderRatioMax}%
                  </div>
                )}
                {constraints.sameIndustryMax !== undefined && (
                  <div>• 同行业最多: {constraints.sameIndustryMax}人</div>
                )}
              </div>
            </div>

            {/* 参与人数 */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">参与人数:</span>
              <span className="text-lg font-bold text-primary-500">
                {participantCount} 人
              </span>
            </div>
          </div>
        </Card>

        {/* 匹配操作区 */}
        <Card
          title="匹配操作"
          style={{ borderRadius: "12px" } as React.CSSProperties}
        >
          <div className="space-y-4">
            {/* 按钮组 */}
            <div className="grid grid-cols-1 gap-3">
              {!hasMatchResult ? (
                // 首次匹配
                <Button
                  color="primary"
                  size="large"
                  block
                  loading={isMatching}
                  onClick={onStartMatching}
                  disabled={enabledRules.length === 0 || participantCount === 0}
                  className="rounded-xl h-12 font-semibold"
                >
                  {isMatching ? (
                    <span>匹配中...</span>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <PlayOutline />
                      <span>开始匹配</span>
                    </div>
                  )}
                </Button>
              ) : (
                // 已有结果 - 仅支持重新匹配
                <Button
                  color="primary"
                  size="large"
                  block
                  loading={isMatching}
                  onClick={onRematch}
                  disabled={enabledRules.length === 0}
                  className="rounded-xl h-12 font-semibold"
                >
                  {isMatching ? (
                    <span>重新匹配中...</span>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <RedoOutline />
                      <span>重新匹配</span>
                    </div>
                  )}
                </Button>
              )}
            </div>

            {/* 进度条 */}
            {isMatching && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      匹配进度
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary-500">
                        {matchingProgress}%
                      </span>
                      {estimatedTimeRemaining > 0 && (
                        <span className="text-xs text-gray-500">
                          约 {Math.ceil(estimatedTimeRemaining)}s
                        </span>
                      )}
                    </div>
                  </div>
                  <ProgressBar
                    percent={matchingProgress}
                    style={{
                      "--fill-color": "var(--adm-color-primary)",
                      "--track-width": "8px",
                    }}
                  />
                </div>

                <div className="text-sm text-gray-600 text-center">
                  {stageDescriptions[matchingStage]}
                </div>
              </div>
            )}

            {/* 错误信息显示 */}
            {matchingError && !isMatching && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-800 mb-1">
                      匹配失败
                    </div>
                    <div className="text-xs text-red-600">{matchingError}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      请检查网络连接或稍后重试
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 说明文字 */}
            {!isMatching && !matchingError && (
              <div className="text-xs text-gray-500 text-center px-4">
                {!hasMatchResult
                  ? "点击「开始匹配」后，系统将基于您设置的规则进行智能分组"
                  : "重新匹配将保留已锁定的分组，仅对未锁定成员重新计算"}
              </div>
            )}
          </div>
        </Card>

        {/* 温馨提示 */}
        {enabledRules.length === 0 && (
          <Card style={{ borderRadius: "12px" } as React.CSSProperties}>
            <div className="text-center py-4">
              <div className="text-yellow-500 text-4xl mb-2">⚠️</div>
              <p className="text-sm text-gray-600">
                请先在「规则设置」中配置至少一条匹配规则
              </p>
            </div>
          </Card>
        )}

        {participantCount === 0 && (
          <Card style={{ borderRadius: "12px" } as React.CSSProperties}>
            <div className="text-center py-4">
              <div className="text-red-500 text-4xl mb-2">❗</div>
              <p className="text-sm text-gray-600">
                暂无参与者数据，无法执行匹配
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MatchingConsoleTab;
