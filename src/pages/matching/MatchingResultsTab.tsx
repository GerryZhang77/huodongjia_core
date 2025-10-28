import React, { useState } from "react";
import { Card, Button, Tag, Switch } from "antd-mobile";
import { CheckOutline, AddOutline } from "antd-mobile-icons";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Participant, MatchingGroup } from "./types";
import PublishConfirmModal from "./PublishConfirmModal";
import DraggableMemberCard from "./DraggableMemberCard";
import DroppableGroupCard from "./DroppableGroupCard";
import { AddToGroupModal } from "./AddToGroupModal";

interface MatchingResultsTabProps {
  groups: MatchingGroup[];
  ungroupedParticipants: Participant[];
  onToggleGroupLock: (groupId: string) => void;
  onDragEnd: (
    activeMemberId: string,
    activeGroupId: string | undefined,
    targetGroupId: string
  ) => void;
  onAddMemberToGroup: (memberId: string, groupId: string) => void;
  onPublishResults: (sendNotification: boolean) => Promise<void>;
  isPublishing: boolean;
  hasPublished: boolean;
}

/**
 * Tab 3: 匹配结果展示
 * 功能：显示已分组成员 + 未分组成员 + 锁定/解锁 + 拖拽调整 + 发布结果
 */
const MatchingResultsTab: React.FC<MatchingResultsTabProps> = ({
  groups,
  ungroupedParticipants,
  onToggleGroupLock,
  onDragEnd,
  onAddMemberToGroup,
  onPublishResults,
  isPublishing,
  hasPublished,
}) => {
  // 发布确认对话框状态
  const [showPublishModal, setShowPublishModal] = useState(false);

  // 手动添加成员对话框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Participant | null>(
    null
  );

  // 拖拽状态
  const [activeMember, setActiveMember] = useState<Participant | null>(null);

  // 配置传感器（支持触摸和鼠标）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 拖动距离后才激活，避免误触
      },
    })
  );

  // 拖拽开始
  const handleDragStart = (event: DragEndEvent) => {
    const { active } = event;
    setActiveMember(active.data.current?.member as Participant);

    // 触觉反馈（移动端）
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(50); // 短震动 50ms
      } catch {
        // 忽略错误，某些浏览器可能不支持
        console.debug("Vibration not supported");
      }
    }
  };

  // 拖拽结束
  const handleDragEndLocal = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveMember(null);
      return;
    }

    const activeMemberId = active.id as string;
    const activeGroupId = active.data.current?.groupId as string | undefined;
    const targetGroupId = over.id as string;

    // 调用父组件的拖拽处理函数
    onDragEnd(activeMemberId, activeGroupId, targetGroupId);

    setActiveMember(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndLocal}
    >
      <div className="px-4 md:px-6 py-4 pb-32">
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* 统计摘要卡片 */}
          <Card
            title="匹配结果统计"
            style={{ borderRadius: "12px" } as React.CSSProperties}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-500">
                  {groups.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">分组数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {groups.reduce((sum, g) => sum + g.members.length, 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">已分组</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">
                  {ungroupedParticipants.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">未分组</div>
              </div>
            </div>
          </Card>

          {/* 已分组区域 */}
          {groups.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-base font-semibold text-gray-900">
                  ✅ 已分组成员
                </h3>
                <span className="text-sm text-gray-500">
                  {groups.length} 个分组
                </span>
              </div>

              {groups.map((group) => (
                <DroppableGroupCard key={group.id} group={group}>
                  {/* 分组标题栏 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-gray-900">
                        {group.name}
                      </span>
                      <Tag color="primary" fill="outline">
                        {group.members.length}人
                      </Tag>
                      {group.isLocked && (
                        <Tag color="danger" fill="outline">
                          🔒 已锁定
                        </Tag>
                      )}
                    </div>

                    {/* 锁定/解锁开关 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {group.isLocked ? "锁定" : "解锁"}
                      </span>
                      <Switch
                        checked={group.isLocked}
                        onChange={() => onToggleGroupLock(group.id)}
                        style={{
                          "--checked-color": "var(--adm-color-danger)",
                        }}
                      />
                    </div>
                  </div>

                  {/* 匹配得分 */}
                  <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded">
                    <span className="text-sm text-gray-600">匹配得分:</span>
                    <span className="text-base font-bold text-primary-500">
                      {Math.round(group.score * 100)}分
                    </span>
                  </div>

                  {/* 匹配理由 */}
                  {group.reasons.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">
                        匹配理由:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {group.reasons.map((reason, idx) => (
                          <Tag
                            key={idx}
                            color="success"
                            fill="outline"
                            style={{ fontSize: "11px" }}
                          >
                            {reason}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 成员列表 */}
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 mb-2">
                      成员 ({group.members.length}):
                    </div>
                    {group.members.map((member) => (
                      <DraggableMemberCard
                        key={member.id}
                        member={member}
                        groupId={group.id}
                        isInGroup={true}
                        topReasons={group.reasons}
                      />
                    ))}
                  </div>
                </DroppableGroupCard>
              ))}
            </div>
          )}

          {/* 未分组区域 */}
          {ungroupedParticipants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-base font-semibold text-gray-900">
                  ⏳ 未分组成员
                </h3>
                <span className="text-sm text-gray-500">
                  {ungroupedParticipants.length} 人
                </span>
              </div>

              <Card
                style={
                  {
                    borderRadius: "12px",
                    border: "2px dashed #E5E7EB",
                  } as React.CSSProperties
                }
              >
                <div className="space-y-3">
                  {ungroupedParticipants.map((member) => (
                    <div key={member.id}>
                      <DraggableMemberCard member={member} isInGroup={false} />
                      {/* 优化：按钮放在卡片下方，更明显 */}
                      <div className="mt-2">
                        <Button
                          size="small"
                          color="primary"
                          fill="outline"
                          block
                          onClick={() => {
                            setSelectedMember(member);
                            setShowAddModal(true);
                          }}
                          className="rounded-lg h-9"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <AddOutline fontSize={16} />
                            <span>添加到分组</span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-xs text-gray-600">
                    💡 拖拽成员到目标分组，或点击"添加到分组"按钮手动分配
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* 空状态 */}
          {groups.length === 0 && ungroupedParticipants.length === 0 && (
            <Card style={{ borderRadius: "12px" } as React.CSSProperties}>
              <div className="text-center py-8">
                <div className="text-6xl mb-3">🎲</div>
                <p className="text-gray-600 mb-2">暂无匹配结果</p>
                <p className="text-sm text-gray-400">
                  请先在「匹配控制台」中执行匹配
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* 底部操作栏 (固定) - 紧凑设计 */}
        {groups.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
              {/* 状态指示器 - 更紧凑 */}
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">
                    已锁定 {groups.filter((g) => g.isLocked).length}
                  </span>
                </div>
                <div className="w-px h-3 bg-gray-300"></div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">
                    未锁定 {groups.filter((g) => !g.isLocked).length}
                  </span>
                </div>
              </div>

              {/* 发布按钮 - 更突出 */}
              <Button
                color="primary"
                size="large"
                block
                loading={isPublishing}
                onClick={() => setShowPublishModal(true)}
                className="rounded-xl h-12 font-semibold shadow-md"
                style={
                  {
                    background: hasPublished
                      ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                      : "linear-gradient(135deg, #4A78FF 0%, #2563EB 100%)",
                  } as React.CSSProperties
                }
              >
                {hasPublished ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckOutline fontSize={20} />
                    <span>重新发布结果</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckOutline fontSize={20} />
                    <span>发布匹配结果</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 发布确认对话框 */}
        <PublishConfirmModal
          visible={showPublishModal}
          groups={groups}
          ungroupedParticipants={ungroupedParticipants}
          onConfirm={onPublishResults}
          onCancel={() => setShowPublishModal(false)}
        />

        {/* 手动添加成员对话框 */}
        <AddToGroupModal
          visible={showAddModal}
          member={selectedMember}
          groups={groups}
          onAddToGroup={onAddMemberToGroup}
          onClose={() => {
            setShowAddModal(false);
            setSelectedMember(null);
          }}
        />

        {/* 拖拽预览层 */}
        <DragOverlay>
          {activeMember ? (
            <div className="p-3 bg-white rounded-lg shadow-lg border-2 border-primary-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                  {activeMember.name.charAt(0)}
                </div>
                <span className="text-sm font-medium">{activeMember.name}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default MatchingResultsTab;
