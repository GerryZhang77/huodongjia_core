/**
 * 匹配配置页面 (新版)
 * 使用 MerchantLayout 布局
 */

import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs } from "antd-mobile";
import { Settings, Play, PieChart } from "lucide-react";
import { MerchantLayout } from "@/components/layout";
import { useMatchingLogic } from "../matching/useMatchingLogic";
import RulesSettingTab from "../matching/RulesSettingTab";
import MatchingConsoleTab from "../matching/MatchingConsoleTab";
import MatchingResultsTab from "../matching/MatchingResultsTab";

/**
 * 匹配配置主页面
 * 功能：智能匹配规则设置、匹配执行、结果查看
 */
const MatchingConfigurationNew: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 使用自定义 Hook 管理所有业务逻辑
  const {
    // Tab 状态
    activeTab,
    setActiveTab,

    // 规则设置
    naturalLanguageInput,
    setNaturalLanguageInput,
    rules,
    setRules,
    constraints,
    setConstraints,
    isGeneratingRules,
    handleGenerateRules,
    handleSaveRules,
    fetchRules,

    // 匹配控制台
    participants,
    isMatching,
    matchingProgress,
    matchingStage,
    estimatedTimeRemaining,
    matchingError,
    hasMatchResult,
    handleStartMatching,
    handleRematch,

    // 匹配结果
    matchingGroups,
    ungroupedParticipants,
    handleToggleGroupLock,
    handleDragEnd,
    handleAddMemberToGroup,
    isPublishing,
    hasPublished,
    handlePublishResults,

    // 初始化 (fetchParticipants 由 hook 内部调用)
  } = useMatchingLogic({
    eventId: id || "",
  });

  // 初始化加载
  useEffect(() => {
    if (id) {
      fetchRules();
    }
  }, [id, fetchRules]);

  return (
    <MerchantLayout
      title="智能匹配"
      showBack
      onBack={() => navigate("/dashboard")}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab 导航 */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as typeof activeTab)}
          style={{
            "--fixed-active-line-width": "40px",
            "--title-font-size": "14px",
          }}
        >
          {/* Tab 1: 规则设置 */}
          <Tabs.Tab
            title={
              <div className="flex items-center gap-1.5">
                <Settings size={14} />
                <span>规则设置</span>
              </div>
            }
            key="rules"
          >
            <RulesSettingTab
              naturalLanguageInput={naturalLanguageInput}
              onNaturalLanguageInputChange={setNaturalLanguageInput}
              rules={rules}
              onRulesChange={setRules}
              constraints={constraints}
              onConstraintsChange={setConstraints}
              loading={isGeneratingRules}
              onGenerateRules={handleGenerateRules}
              onSaveRules={handleSaveRules}
              onNext={handleStartMatching}
            />
          </Tabs.Tab>

          {/* Tab 2: 匹配控制台 */}
          {import.meta.env.VITE_PRODUCTION_MODE !== "true" && (
            <Tabs.Tab
              title={
                <div className="flex items-center gap-1.5">
                  <Play size={14} />
                  <span>匹配控制台</span>
                </div>
              }
              key="console"
            >
              <MatchingConsoleTab
                rules={rules}
                constraints={constraints}
                participantCount={participants.length}
                isMatching={isMatching}
                matchingProgress={matchingProgress}
                matchingStage={matchingStage}
                estimatedTimeRemaining={estimatedTimeRemaining}
                matchingError={matchingError}
                hasMatchResult={hasMatchResult}
                onStartMatching={handleStartMatching}
                onRematch={handleRematch}
              />
            </Tabs.Tab>
          )}

          {/* Tab 3: 匹配结果 */}
          <Tabs.Tab
            title={
              <div className="flex items-center gap-1.5">
                <PieChart size={14} />
                <span>匹配结果</span>
              </div>
            }
            key="results"
          >
            <MatchingResultsTab
              groups={matchingGroups}
              ungroupedParticipants={ungroupedParticipants}
              onToggleGroupLock={handleToggleGroupLock}
              onDragEnd={handleDragEnd}
              onAddMemberToGroup={handleAddMemberToGroup}
              onPublishResults={handlePublishResults}
              isPublishing={isPublishing}
              hasPublished={hasPublished}
            />
          </Tabs.Tab>
        </Tabs>
      </div>
    </MerchantLayout>
  );
};

export default MatchingConfigurationNew;
