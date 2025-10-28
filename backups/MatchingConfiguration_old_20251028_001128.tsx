import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  NavBar,
  Toast,
  Tabs,
} from "antd-mobile";
import { useStore } from "../store";
import RulesSettingTab from "./matching/RulesSettingTab";
import MatchingConsoleTab from "./matching/MatchingConsoleTab";
import MatchingResultsTab from "./matching/MatchingResultsTab";

interface MatchingRule {
  id: string;
  name: string;
  description: string;
  weight: number;
  enabled: boolean;
}

interface Participant {
  user_id: string;
  name: string;
  avatar?: string;
  keywords: string[];
  profile: any;
}

interface MatchingGroup {
  group_id: string;
  members: Participant[];
  similarity_score: number;
  match_reasons: string[];
  is_locked: boolean;
}

interface BubbleData {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
  connections: string[];
}

const MatchingConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [generatedRules, setGeneratedRules] = useState<MatchingRule[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matchingGroups, setMatchingGroups] = useState<MatchingGroup[]>([]);
  const [bubbleData, setBubbleData] = useState<BubbleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("bubble");
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<MatchingRule | null>(null);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [isMatching, setIsMatching] = useState(false);

  // 步骤配置
  const steps = [
    { title: "输入需求", description: "自然语言描述匹配需求" },
    { title: "生成规则", description: "AI生成匹配规则" },
    { title: "调整权重", description: "调整各规则权重" },
    { title: "执行匹配", description: "执行智能匹配" },
    { title: "查看结果", description: "查看匹配结果" },
  ];

  // 获取参与者数据
  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/event-participants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error("Fetch participants error:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchParticipants();
    }
  }, [id]);

  // 生成匹配规则
  const generateMatchingRules = async () => {
    if (!naturalLanguageInput.trim()) {
      Toast.show("请输入匹配需求描述");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/generate-match-rules/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: naturalLanguageInput,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedRules(data.rules || []);
        setCurrentStep(1);
        Toast.show("规则生成成功");
      } else {
        Toast.show(data.message || "规则生成失败");
      }
    } catch (error) {
      console.error("Generate rules error:", error);
      Toast.show("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 执行匹配
  const executeMatching = async () => {
    setIsMatching(true);
    setMatchingProgress(0);

    try {
      // 1. 提取关键词
      setMatchingProgress(20);
      const keywordsResponse = await fetch(`/api/extract-keywords/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!keywordsResponse.ok) {
        throw new Error("提取关键词失败");
      }

      // 2. 计算词嵌入
      setMatchingProgress(40);
      const embeddingResponse = await fetch(`/api/get-embedding/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!embeddingResponse.ok) {
        throw new Error("计算词嵌入失败");
      }

      // 3. 计算相似度
      setMatchingProgress(60);
      const similarityResponse = await fetch(
        `/api/calculate-similarity/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const similarityData = await similarityResponse.json();

      if (!similarityData.success) {
        throw new Error(similarityData.message || "计算相似度失败");
      }

      // 4. 生成匹配结果
      setMatchingProgress(80);
      const matchResponse = await fetch(`/api/do-match/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rules: generatedRules.filter((rule) => rule.enabled),
          similarity_matrix: similarityData.similarity_matrix,
        }),
      });

      const matchData = await matchResponse.json();

      if (matchData.success) {
        setMatchingProgress(100);
        setMatchingGroups(matchData.groups || []);
        generateBubbleData(matchData.groups || []);
        setCurrentStep(4);
        Toast.show("匹配完成");
      } else {
        throw new Error(matchData.message || "匹配失败");
      }
    } catch (error) {
      console.error("Execute matching error:", error);
      Toast.show(error instanceof Error ? error.message : "匹配失败，请重试");
    } finally {
      setIsMatching(false);
      setMatchingProgress(0);
    }
  };

  // 生成气泡图数据
  const generateBubbleData = (groups: MatchingGroup[]) => {
    const bubbles: BubbleData[] = [];
    // 使用设计系统颜色
    const colors = [
      "var(--adm-color-primary)",
      "var(--adm-color-success)",
      "var(--adm-color-warning)",
      "var(--adm-color-danger)",
      "#722ed1", // purple (暂无对应CSS变量)
      "#13c2c2", // cyan (暂无对应CSS变量)
      "#eb2f96", // magenta (暂无对应CSS变量)
      "#fa8c16", // orange (暂无对应CSS变量)
    ];

    groups.forEach((group, groupIndex) => {
      const centerX = (groupIndex % 3) * 120 + 100;
      const centerY = Math.floor(groupIndex / 3) * 120 + 100;
      const groupColor = colors[groupIndex % colors.length];

      group.members.forEach((member, memberIndex) => {
        const angle = (memberIndex / group.members.length) * 2 * Math.PI;
        const radius = 30 + group.members.length * 5;

        bubbles.push({
          id: member.user_id,
          name: member.name,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          size: 20 + group.similarity_score * 10,
          color: groupColor,
          connections: group.members
            .filter((m) => m.user_id !== member.user_id)
            .map((m) => m.user_id),
        });
      });
    });

    setBubbleData(bubbles);
  };

  // 锁定/解锁分组
  const toggleGroupLock = (groupId: string) => {
    setMatchingGroups((prev) =>
      prev.map((group) =>
        group.group_id === groupId
          ? { ...group, is_locked: !group.is_locked }
          : group
      )
    );
  };

  // 交换成员
  const swapMembers = (
    fromGroupId: string,
    toGroupId: string,
    memberId: string
  ) => {
    setMatchingGroups((prev) => {
      const newGroups = [...prev];
      const fromGroup = newGroups.find((g) => g.group_id === fromGroupId);
      const toGroup = newGroups.find((g) => g.group_id === toGroupId);

      if (fromGroup && toGroup && !fromGroup.is_locked && !toGroup.is_locked) {
        const member = fromGroup.members.find((m) => m.user_id === memberId);
        if (member) {
          fromGroup.members = fromGroup.members.filter(
            (m) => m.user_id !== memberId
          );
          toGroup.members.push(member);
        }
      }

      return newGroups;
    });
  };

  // 更新规则权重
  const updateRuleWeight = (ruleId: string, weight: number) => {
    setGeneratedRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, weight } : rule))
    );
  };

  // 切换规则启用状态
  const toggleRuleEnabled = (ruleId: string) => {
    setGeneratedRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        back="返回"
        onBack={() => navigate(`/activity/${id}`)}
        style={{
          "--height": "48px",
          "--border-bottom": "1px solid var(--adm-border-color)",
        }}
      >
        匹配配置
      </NavBar>

      {/* 步骤指示器 */}
      <div className="bg-white p-4 border-b border-gray-100">
        <Steps current={currentStep} direction="horizontal">
          {steps.map((step, index) => (
            <Steps.Step
              key={index}
              title={step.title}
              description={step.description}
            />
          ))}
        </Steps>
      </div>

      <div className="p-4">
        {/* 步骤1: 自然语言输入 */}
        {currentStep === 0 && (
          <Card title="描述匹配需求" style={{ "--border-radius": "12px" }}>
            <div className="space-y-4">
              <TextArea
                placeholder="请用自然语言描述您的匹配需求，例如：&#10;- 希望按照兴趣爱好进行分组&#10;- 让有相似技能的人组成团队&#10;- 根据工作经验和专业背景匹配&#10;- 平衡各组的性别比例和年龄结构"
                value={naturalLanguageInput}
                onChange={setNaturalLanguageInput}
                maxLength={500}
                showCount
                rows={6}
                style={{ "--border-radius": "8px" }}
              />

              <div className="flex flex-wrap gap-2">
                <Tag
                  color="primary"
                  fill="outline"
                  onClick={() =>
                    setNaturalLanguageInput(
                      "希望按照兴趣爱好和专业技能进行分组，让有共同话题的人组成团队"
                    )
                  }
                >
                  兴趣匹配
                </Tag>
                <Tag
                  color="primary"
                  fill="outline"
                  onClick={() =>
                    setNaturalLanguageInput(
                      "根据工作经验和行业背景进行匹配，促进跨领域交流"
                    )
                  }
                >
                  经验匹配
                </Tag>
                <Tag
                  color="primary"
                  fill="outline"
                  onClick={() =>
                    setNaturalLanguageInput(
                      "平衡各组的性别比例、年龄结构和地域分布"
                    )
                  }
                >
                  平衡分组
                </Tag>
              </div>

              <Button
                color="primary"
                size="large"
                block
                loading={loading}
                onClick={generateMatchingRules}
                disabled={!naturalLanguageInput.trim()}
                style={{
                  "--border-radius": "12px",
                  height: "48px",
                }}
              >
                <StarOutline className="mr-2" />
                {loading ? "生成中..." : "生成匹配规则"}
              </Button>
            </div>
          </Card>
        )}

        {/* 步骤2-3: 规则调整 */}
        {(currentStep === 1 || currentStep === 2) && (
          <div className="space-y-4">
            <Card title="匹配规则" style={{ "--border-radius": "12px" }}>
              <div className="space-y-4">
                {generatedRules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {rule.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {rule.description}
                        </p>
                      </div>
                      <Switch
                        checked={rule.enabled}
                        onChange={() => toggleRuleEnabled(rule.id)}
                      />
                    </div>

                    {rule.enabled && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">权重</span>
                          <span className="text-sm font-medium">
                            {rule.weight}%
                          </span>
                        </div>
                        <Slider
                          value={rule.weight}
                          onChange={(value) => updateRuleWeight(rule.id, value)}
                          min={0}
                          max={100}
                          step={5}
                          style={{ "--fill-color": "var(--adm-color-primary)" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex space-x-3">
                <Button
                  fill="outline"
                  size="large"
                  onClick={() => setCurrentStep(0)}
                  style={{ "--border-radius": "12px", flex: 1 }}
                >
                  重新输入
                </Button>
                <Button
                  color="primary"
                  size="large"
                  onClick={() => setCurrentStep(3)}
                  style={{ "--border-radius": "12px", flex: 1 }}
                >
                  <PlayOutline className="mr-2" />
                  执行匹配
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* 步骤4: 执行匹配 */}
        {currentStep === 3 && (
          <Card title="执行智能匹配" style={{ "--border-radius": "12px" }}>
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TeamOutline className="text-2xl text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  准备执行匹配
                </h3>
                <p className="text-gray-600 mb-6">
                  将基于您设置的规则对 {participants.length}{" "}
                  位参与者进行智能匹配
                </p>

                {isMatching && (
                  <div className="mb-6">
                    <Progress percent={matchingProgress} />
                    <p className="text-sm text-gray-500 mt-2">
                      {matchingProgress < 20 && "正在分析参与者信息..."}
                      {matchingProgress >= 20 &&
                        matchingProgress < 40 &&
                        "正在提取关键词..."}
                      {matchingProgress >= 40 &&
                        matchingProgress < 60 &&
                        "正在计算词嵌入..."}
                      {matchingProgress >= 60 &&
                        matchingProgress < 80 &&
                        "正在计算相似度..."}
                      {matchingProgress >= 80 && "正在生成匹配结果..."}
                    </p>
                  </div>
                )}

                <Button
                  color="primary"
                  size="large"
                  block
                  loading={isMatching}
                  onClick={executeMatching}
                  disabled={
                    generatedRules.filter((r) => r.enabled).length === 0
                  }
                  style={{
                    "--border-radius": "12px",
                    height: "48px",
                  }}
                >
                  <PlayOutline className="mr-2" />
                  {isMatching ? "匹配中..." : "开始匹配"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 步骤5: 查看结果 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            {/* 结果概览 */}
            <Card title="匹配结果" style={{ "--border-radius": "12px" }}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {matchingGroups.length}
                  </div>
                  <div className="text-sm text-gray-600">分组数量</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {Math.round(
                      (matchingGroups.reduce(
                        (sum, group) => sum + group.similarity_score,
                        0
                      ) /
                        matchingGroups.length) *
                        100
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">平均匹配度</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    {matchingGroups.filter((g) => g.is_locked).length}
                  </div>
                  <div className="text-sm text-gray-600">已锁定组</div>
                </div>
              </div>
            </Card>

            {/* 可视化结果 */}
            <Card style={{ "--border-radius": "12px" }}>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                style={{ "--title-font-size": "14px" }}
              >
                <Tabs.Tab title="气泡图" key="bubble">
                  <div className="relative bg-gray-50 rounded-lg p-4 h-80 overflow-hidden">
                    <svg width="100%" height="100%" viewBox="0 0 400 300">
                      {/* 连接线 */}
                      {bubbleData.map((bubble) =>
                        bubble.connections.map((connectionId) => {
                          const target = bubbleData.find(
                            (b) => b.id === connectionId
                          );
                          if (!target) return null;
                          return (
                            <line
                              key={`${bubble.id}-${connectionId}`}
                              x1={bubble.x}
                              y1={bubble.y}
                              x2={target.x}
                              y2={target.y}
                              stroke="var(--adm-border-color)"
                              strokeWidth="1"
                              opacity="0.5"
                            />
                          );
                        })
                      )}

                      {/* 气泡 */}
                      {bubbleData.map((bubble) => (
                        <g key={bubble.id}>
                          <circle
                            cx={bubble.x}
                            cy={bubble.y}
                            r={bubble.size}
                            fill={bubble.color}
                            opacity="0.8"
                          />
                          <text
                            x={bubble.x}
                            y={bubble.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="10"
                            fill="white"
                            fontWeight="500"
                          >
                            {bubble.name.length > 4
                              ? bubble.name.substring(0, 3) + "..."
                              : bubble.name}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </Tabs.Tab>

                <Tabs.Tab title="组卡片视图" key="cards">
                  <div className="space-y-4">
                    {matchingGroups.length === 0 ? (
                      <Empty description="暂无匹配结果" />
                    ) : (
                      matchingGroups.map((group, groupIndex) => (
                        <Card
                          key={group.group_id}
                          className="relative"
                          style={{
                            "--border-radius": "12px",
                            "--body-padding": "16px",
                            border: group.is_locked
                              ? "2px solid var(--adm-color-primary)"
                              : "1px solid var(--adm-border-color)",
                          }}
                        >
                          {/* 锁定按钮 */}
                          <Button
                            fill="none"
                            size="mini"
                            onClick={() => toggleGroupLock(group.group_id)}
                            className="absolute top-2 right-2"
                          >
                            {group.is_locked ? (
                              <LockOutline className="text-blue-500" />
                            ) : (
                              <UnlockOutline className="text-gray-400" />
                            )}
                          </Button>

                          <div className="space-y-3">
                            {/* 组标题 */}
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">
                                第 {groupIndex + 1} 组
                              </h3>
                              <Badge
                                content={`${Math.round(
                                  group.similarity_score * 100
                                )}% 匹配`}
                                color="success"
                              />
                            </div>

                            {/* 成员头像 */}
                            <div className="flex flex-wrap gap-2">
                              {group.members.map((member) => (
                                <div
                                  key={member.user_id}
                                  className="text-center"
                                >
                                  <Avatar
                                    src={member.avatar}
                                    style={{ "--size": "48px" }}
                                    className="mb-1"
                                  >
                                    {member.name.charAt(0)}
                                  </Avatar>
                                  <div className="text-xs text-gray-600 max-w-12 truncate">
                                    {member.name}
                                  </div>

                                  {/* Top2 理由标签 */}
                                  <div className="flex flex-col gap-1 mt-1">
                                    {member.keywords
                                      ?.slice(0, 2)
                                      .map((keyword, index) => (
                                        <Tag
                                          key={index}
                                          color="primary"
                                          fill="outline"
                                          className="text-xs scale-75"
                                        >
                                          {keyword}
                                        </Tag>
                                      ))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* 匹配理由 */}
                            <div className="pt-2 border-t border-gray-100">
                              <div className="text-sm text-gray-600 mb-2">
                                匹配理由：
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {group.match_reasons.map((reason, index) => (
                                  <Tag
                                    key={index}
                                    color="blue"
                                    fill="outline"
                                    className="text-xs"
                                  >
                                    {reason}
                                  </Tag>
                                ))}
                              </div>
                            </div>

                            {/* 操作按钮 */}
                            {!group.is_locked && (
                              <div className="flex justify-end pt-2">
                                <Button
                                  size="mini"
                                  fill="outline"
                                  onClick={() => {
                                    // 这里可以实现拖拽交换成员的功能
                                    Toast.show("可拖拽成员头像进行交换");
                                  }}
                                >
                                  <RightOutline className="mr-1" />
                                  调整成员
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </Tabs.Tab>
              </Tabs>
            </Card>

            {/* 操作按钮 */}
            <div className="flex space-x-3">
              <Button
                fill="outline"
                size="large"
                onClick={() => setCurrentStep(2)}
                style={{ "--border-radius": "12px", flex: 1 }}
              >
                重新匹配
              </Button>
              <Button
                color="primary"
                size="large"
                onClick={() => {
                  Toast.show("匹配结果已发布");
                  navigate(`/activity/${id}`);
                }}
                style={{ "--border-radius": "12px", flex: 1 }}
              >
                发布结果
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingConfiguration;
