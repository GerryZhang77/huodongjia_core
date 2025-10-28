/**
 * MatchingManageTab Component - 匹配管理 Tab
 *
 * 包含匹配结果展示、分组管理、发布等功能
 * 参考报名管理Tab的实现结构
 */

import { FC, useState, useEffect } from "react";
import {
  Button,
  Card,
  Empty,
  Tag,
  Toast,
  Badge,
  Tabs,
  SpinLoading,
  Dialog,
  Checkbox,
} from "antd-mobile";
import {
  TeamOutline,
  SendOutline,
  EyeOutline,
  LockOutline,
  UnlockOutline,
} from "antd-mobile-icons";
import { useMatchResult } from "../../hooks/useMatchResult";
import type { MatchGroup } from "../../types/matchResult";

/**
 * 组件 Props
 */
export interface MatchingManageTabProps {
  activityId: string;
}

/**
 * 匹配管理 Tab 组件
 */
export const MatchingManageTab: FC<MatchingManageTabProps> = ({
  activityId,
}) => {
  const {
    matchResult,
    loading,
    publishing,
    fetchMatchResult,
    publish,
    toggleGroupLock,
  } = useMatchResult(activityId);

  const [activeTab, setActiveTab] = useState<"bubble" | "groups">("groups");
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);

  // 组件加载时获取匹配结果
  useEffect(() => {
    fetchMatchResult();
  }, [fetchMatchResult]);

  /**
   * 处理发布匹配结果
   */
  const handlePublish = async () => {
    const success = await publish(sendNotification);
    if (success) {
      setShowPublishDialog(false);
      Toast.show({
        icon: "success",
        content: "匹配结果已成功发布",
      });
    }
  };

  /**
   * 打开发布确认弹窗
   */
  const openPublishDialog = () => {
    if (!matchResult) {
      Toast.show({
        icon: "fail",
        content: "没有可发布的匹配结果",
      });
      return;
    }
    setShowPublishDialog(true);
  };

  /**
   * 渲染统计摘要
   */
  const renderStatistics = () => {
    if (!matchResult) return null;

    const { statistics } = matchResult;

    return (
      <Card className="mb-4">
        <div className="text-sm text-gray-600 mb-3">匹配统计</div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-semibold text-primary-500">
              {statistics.totalGroups}
            </div>
            <div className="text-xs text-gray-500 mt-1">分组数</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-success-500">
              {statistics.totalMembers}
            </div>
            <div className="text-xs text-gray-500 mt-1">已分组</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-warning-500">
              {statistics.ungroupedCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">未分组</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">平均得分</span>
            <span className="font-medium">
              {statistics.averageScore.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-600">得分范围</span>
            <span className="font-medium">
              {statistics.minScore.toFixed(1)} -{" "}
              {statistics.maxScore.toFixed(1)}
            </span>
          </div>
        </div>
      </Card>
    );
  };

  /**
   * 渲染分组卡片
   */
  const renderGroupCard = (group: MatchGroup) => {
    return (
      <Card
        key={group.groupId}
        className="mb-3"
        style={{ borderRadius: "12px" }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">
              {group.groupName}
            </h3>
            {group.isLocked && (
              <Tag color="warning" fill="outline">
                <LockOutline className="mr-1" fontSize={12} />
                已锁定
              </Tag>
            )}
          </div>
          <div className="flex items-center gap-2">
            {group.score && (
              <div className="text-sm">
                <span className="text-gray-500">得分:</span>
                <span className="ml-1 font-semibold text-primary-500">
                  {group.score.toFixed(1)}
                </span>
              </div>
            )}
            <Button
              size="small"
              fill="none"
              onClick={() => toggleGroupLock(group.groupId)}
            >
              {group.isLocked ? (
                <UnlockOutline fontSize={18} />
              ) : (
                <LockOutline fontSize={18} />
              )}
            </Button>
          </div>
        </div>

        {/* 成员列表 */}
        <div className="space-y-2">
          {group.members.map((member, index) => (
            <div
              key={member.enrollmentId}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              <div className="text-sm text-gray-500 w-6">{index + 1}</div>
              {member.avatar && (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {member.name}
                </div>
                {member.tags && member.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.tags.slice(0, 3).map((tag, idx) => (
                      <Tag
                        key={idx}
                        color="primary"
                        fill="outline"
                        fontSize={10}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          共 {group.members.length} 人
        </div>
      </Card>
    );
  };

  /**
   * 渲染未分组成员
   */
  const renderUngroupedMembers = () => {
    if (!matchResult || matchResult.ungroupedMembers.length === 0) {
      return null;
    }

    return (
      <Card className="mb-4" style={{ borderRadius: "12px" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">未分组成员</h3>
          <Badge
            content={matchResult.ungroupedMembers.length}
            color="warning"
          />
        </div>

        <div className="space-y-2">
          {matchResult.ungroupedMembers.map((member) => (
            <div
              key={member.enrollmentId}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              {member.avatar && (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {member.name}
                </div>
                {member.tags && member.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.tags.slice(0, 3).map((tag, idx) => (
                      <Tag
                        key={idx}
                        color="default"
                        fill="outline"
                        fontSize={10}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  /**
   * 渲染空状态
   */
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Empty
          description={
            <div className="text-center">
              <div className="text-gray-900 font-medium mb-2">暂无匹配结果</div>
              <div className="text-sm text-gray-500">
                请先执行智能匹配生成分组
              </div>
            </div>
          }
        />
      </div>
    );
  };

  /**
   * 渲染发布确认弹窗
   */
  const renderPublishDialog = () => {
    if (!matchResult) return null;

    return (
      <Dialog
        visible={showPublishDialog}
        title="发布匹配结果"
        content={
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">即将发布以下匹配结果：</p>
              <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>分组数量</span>
                  <span className="font-medium">
                    {matchResult.statistics.totalGroups} 组
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>已分组成员</span>
                  <span className="font-medium">
                    {matchResult.statistics.totalMembers} 人
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>未分组成员</span>
                  <span className="font-medium">
                    {matchResult.statistics.ungroupedCount} 人
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>平均匹配得分</span>
                  <span className="font-medium">
                    {matchResult.statistics.averageScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <Checkbox
              checked={sendNotification}
              onChange={(checked) => setSendNotification(checked)}
            >
              <span className="text-sm">发布后立即通知成员（站内通知）</span>
            </Checkbox>

            <div className="text-xs text-gray-500">
              发布后，成员可在"我的活动/分组"中查看匹配结果
            </div>
          </div>
        }
        closeOnAction
        onClose={() => setShowPublishDialog(false)}
        actions={[
          {
            key: "cancel",
            text: "取消",
          },
          {
            key: "confirm",
            text: "确认发布",
            primary: true,
            loading: publishing,
            onClick: handlePublish,
          },
        ]}
      />
    );
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <SpinLoading color="primary" />
      </div>
    );
  }

  // 无匹配结果
  if (!matchResult) {
    return renderEmptyState();
  }

  return (
    <div className="px-5 md:px-8 py-5">
      {/* 统计摘要 */}
      {renderStatistics()}

      {/* 发布状态提示 */}
      {matchResult.isPublished && (
        <Card className="mb-4 bg-success-50 border-success-200">
          <div className="flex items-center gap-2 text-success-600">
            <EyeOutline fontSize={18} />
            <div>
              <div className="text-sm font-medium">已发布</div>
              <div className="text-xs mt-1">
                发布时间: {new Date(matchResult.matchedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 切换 */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as "bubble" | "groups")}
        className="mb-4"
      >
        <Tabs.Tab title="分组列表" key="groups" />
        <Tabs.Tab title="气泡视图" key="bubble" disabled />
      </Tabs>

      {/* 分组列表 */}
      {activeTab === "groups" && (
        <div className="space-y-4">
          {/* 未分组成员 */}
          {renderUngroupedMembers()}

          {/* 所有分组 */}
          {matchResult.groups.map((group) => renderGroupCard(group))}
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            fill="outline"
            size="large"
            onClick={() => fetchMatchResult()}
            disabled={loading}
            style={{ flex: 1 }}
          >
            重新获取
          </Button>
          <Button
            color="primary"
            size="large"
            onClick={openPublishDialog}
            disabled={publishing || matchResult.isPublished}
            loading={publishing}
            style={{ flex: 2 }}
          >
            <SendOutline className="mr-1" />
            {matchResult.isPublished ? "已发布" : "发布结果"}
          </Button>
        </div>
      </div>

      {/* 发布确认弹窗 */}
      {renderPublishDialog()}

      {/* 底部安全区域占位 */}
      <div className="h-24"></div>
    </div>
  );
};
