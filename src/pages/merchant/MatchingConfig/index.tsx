/**
 * 智能匹配配置页面 (重构版)
 * 路由: /dashboard/activity/:id/matching
 *
 * 功能:
 * - 规则设置: 自然语言输入 → AI 生成规则 → 调整权重 → 边界条件
 * - 匹配结果: 查看分组 → 拖拽调整 → 锁定 → 发布
 */

import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Settings, Users, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import MerchantLayout from "@/components/layout/MerchantLayout";
import { Button } from "@/components/ui";
import { RulesTab, ResultsTab } from "@/features/matching/components";
import { useMatchingLogic } from "@/features/matching/hooks/useMatchingLogic";
import type { TabKey } from "@/features/matching/types";

/**
 * Tab 配置
 */
const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "rules", label: "规则设置", icon: <Settings size={18} /> },
  { key: "results", label: "匹配结果", icon: <Users size={18} /> },
];

/**
 * 智能匹配配置页面
 */
const MatchingConfigPage: React.FC = () => {
  const { id: activityId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 使用匹配逻辑 Hook
  const {
    // 状态
    stage,
    activeTab,
    isLoading,
    isGenerating,
    isMatching,
    isPublishing,
    matchingProgress,

    // 数据
    naturalLanguageInput,
    rules,
    constraints,
    participants,
    groups,
    matchingStats,

    // 设置方法
    setActiveTab,
    setNaturalLanguageInput,
    setRules,
    setConstraints,
    setGroups,

    // 操作方法
    handleGenerateRules,
    handleSaveRules,
    handleStartMatching,
    handleRematch,
    handlePublish,
  } = useMatchingLogic({ activityId: activityId || "" });

  // 计算结果 Tab 的徽章
  const resultsBadge = useMemo(() => {
    if (groups.length > 0) {
      return groups.length;
    }
    return undefined;
  }, [groups]);

  // 处理返回
  const handleBack = () => {
    navigate(`/dashboard/activity/${activityId}`);
  };

  // 加载状态
  if (isLoading) {
    return (
      <MerchantLayout title="智能匹配" showBack onBack={handleBack}>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-primary-400 animate-spin mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </MerchantLayout>
    );
  }

  // 无活动 ID
  if (!activityId) {
    return (
      <MerchantLayout
        title="智能匹配"
        showBack
        onBack={() => navigate("/dashboard")}
      >
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle size={40} className="text-red-400 mb-4" />
          <p className="text-gray-900 font-medium mb-2">活动不存在</p>
          <p className="text-gray-500 text-sm mb-4">请选择一个有效的活动</p>
          <Button onClick={() => navigate("/dashboard")}>返回活动列表</Button>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout
      title="智能匹配"
      showBack
      onBack={handleBack}
      showTabBar={false}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            智能匹配配置
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            使用 AI 根据参与者信息自动生成最佳分组方案
          </p>
        </div>

        {/* 自定义 Tab 切换 */}
        <div className="mb-6 flex gap-2 p-1 bg-gray-100 rounded-xl">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const badge = tab.key === "results" ? resultsBadge : undefined;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      isActive
                        ? "bg-primary-100 text-primary-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 内容 */}
        {activeTab === "rules" ? (
          <RulesTab
            naturalLanguageInput={naturalLanguageInput}
            onNaturalLanguageInputChange={setNaturalLanguageInput}
            rules={rules}
            onRulesChange={setRules}
            constraints={constraints}
            onConstraintsChange={setConstraints}
            isGenerating={isGenerating}
            onGenerateRules={handleGenerateRules}
            onSaveRules={handleSaveRules}
            onStartMatching={handleStartMatching}
            isMatching={isMatching}
            matchingProgress={matchingProgress}
            participantCount={participants.length}
          />
        ) : (
          <ResultsTab
            groups={groups}
            onGroupsChange={setGroups}
            participants={participants}
            rules={rules}
            isPublishing={isPublishing}
            onPublish={handlePublish}
            onRematch={handleRematch}
            isRematching={isMatching}
            matchingStats={matchingStats || undefined}
          />
        )}
      </div>
    </MerchantLayout>
  );
};

export default MatchingConfigPage;
