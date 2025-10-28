import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NavBar, Tabs } from "antd-mobile";
import { EditSOutline, PlayOutline, PieOutline } from "antd-mobile-icons";
import { useMatchingLogic } from "./matching/useMatchingLogic";
import RulesSettingTab from "./matching/RulesSettingTab";
import MatchingConsoleTab from "./matching/MatchingConsoleTab";
import MatchingResultsTab from "./matching/MatchingResultsTab";

/**
 * 匹配配置主页面
 * 功能：智能匹配规则设置、匹配执行、结果查看
 * 架构：Tabs 结构 + 自定义 Hook 业务逻辑分离
 */
const MatchingConfiguration: React.FC = () => {
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

    // 初始化
    fetchParticipants,
  } = useMatchingLogic({
    eventId: id || "",
  });

  // 初始化：获取参与者数据和规则配置
  useEffect(() => {
    console.log("=".repeat(60));
    console.log("[MatchingConfiguration] useEffect 触发");
    console.log("[MatchingConfiguration] 当前时间:", new Date().toISOString());
    console.log("[MatchingConfiguration] eventId:", id);
    console.log("[MatchingConfiguration] eventId 类型:", typeof id);

    if (id) {
      console.log("[MatchingConfiguration] ✅ 条件满足，开始加载数据");
      console.log("[MatchingConfiguration] 即将调用 fetchParticipants");
      fetchParticipants();
      console.log("[MatchingConfiguration] fetchParticipants 已调用");
      console.log("[MatchingConfiguration] 即将调用 fetchRules");
      fetchRules(); // 加载已保存的规则
      console.log("[MatchingConfiguration] fetchRules 已调用");
    } else {
      console.warn("[MatchingConfiguration] ❌ 条件不满足：eventId 为空");
    }
    console.log("=".repeat(60));
  }, [id, fetchParticipants, fetchRules]);

  // Tab 切换监听：切换到匹配控制台时确保有参与者数据
  useEffect(() => {
    console.log("[Tab切换监听] useEffect 被触发");
    console.log("[Tab切换监听] activeTab:", activeTab);
    console.log("[Tab切换监听] participants.length:", participants.length);

    if (activeTab === "console" && participants.length === 0) {
      console.log("=".repeat(60));
      console.log("[Tab切换] 切换到匹配控制台 Tab");
      console.log("[Tab切换] 当前参与者数量:", participants.length);
      console.log("[Tab切换] 需要重新加载参与者数据");
      console.log("[Tab切换] eventId =", id);
      console.log(
        "[Tab切换] fetchParticipants 函数类型:",
        typeof fetchParticipants
      );

      if (id) {
        console.log("[Tab切换] ✅ 条件满足，即将调用 fetchParticipants()");
        fetchParticipants();
        console.log("[Tab切换] fetchParticipants() 已调用");
      } else {
        console.log("[Tab切换] ❌ 条件不满足：id 为空");
      }
      console.log("=".repeat(60));
    }
  }, [activeTab, participants.length, id, fetchParticipants]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <NavBar onBack={() => navigate(-1)}>智能匹配配置</NavBar>
        </div>
      </div>

      {/* Tab 导航 - 响应式容器 */}
      <div className="max-w-4xl mx-auto">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as typeof activeTab)}
          style={{ "--fixed-active-line-width": "30px" }}
        >
          {/* Tab 1: 规则设置 */}
          <Tabs.Tab
            title={
              <div className="flex items-center gap-1">
                <EditSOutline />
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
              onNext={() => setActiveTab("console")}
            />
          </Tabs.Tab>

          {/* Tab 2: 匹配控制台 */}
          <Tabs.Tab
            title={
              <div className="flex items-center gap-1">
                <PlayOutline />
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

          {/* Tab 3: 匹配结果 */}
          <Tabs.Tab
            title={
              <div className="flex items-center gap-1">
                <PieOutline />
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
    </div>
  );
};

export default MatchingConfiguration;
