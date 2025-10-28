import React, { useState } from "react";
import { Dialog, Checkbox } from "antd-mobile";
import { MatchingGroup, Participant } from "./types";

interface PublishConfirmModalProps {
  visible: boolean;
  groups: MatchingGroup[];
  ungroupedParticipants: Participant[];
  onConfirm: (sendNotification: boolean) => Promise<void>;
  onCancel: () => void;
}

/**
 * 发布确认对话框
 * 功能：显示匹配结果摘要，确认是否发送通知
 */
const PublishConfirmModal: React.FC<PublishConfirmModalProps> = ({
  visible,
  groups,
  ungroupedParticipants,
  onConfirm,
  onCancel,
}) => {
  const [sendNotification, setSendNotification] = useState(true);
  const [loading, setLoading] = useState(false);

  // 计算统计数据
  const totalGroups = groups.length;
  const groupedCount = groups.reduce(
    (sum, group) => sum + group.members.length,
    0
  );
  const ungroupedCount = ungroupedParticipants.length;
  const totalParticipants = groupedCount + ungroupedCount;

  // 计算组大小范围
  const groupSizes = groups.map((g) => g.members.length);
  const minGroupSize = groupSizes.length > 0 ? Math.min(...groupSizes) : 0;
  const maxGroupSize = groupSizes.length > 0 ? Math.max(...groupSizes) : 0;

  // 计算性别分布（仅已分组成员）
  const allGroupedMembers = groups.flatMap((g) => g.members);
  const maleCount = allGroupedMembers.filter((m) => m.gender === "male").length;
  const femaleCount = allGroupedMembers.filter(
    (m) => m.gender === "female"
  ).length;
  const otherCount = allGroupedMembers.filter(
    (m) => m.gender !== "male" && m.gender !== "female"
  ).length;

  // 计算平均分数
  const validScores = groups.map((g) => g.score).filter((s) => s > 0);
  const avgScore =
    validScores.length > 0
      ? Math.round(
          validScores.reduce((sum, s) => sum + s, 0) / validScores.length
        )
      : 0;

  // 找出最高分和最低分组
  const maxScore = Math.max(...groups.map((g) => g.score), 0);
  const minScore = Math.min(
    ...groups.filter((g) => g.score > 0).map((g) => g.score),
    100
  );

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(sendNotification);
      onCancel(); // 成功后关闭弹窗
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Dialog
      visible={visible}
      title="确认发布匹配结果"
      content={
        <div className="space-y-4 py-2">
          {/* 基础统计摘要 */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              匹配概览
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">总人数</span>
              <span className="text-lg font-semibold text-gray-900">
                {totalParticipants} 人
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">分组数</span>
              <span className="text-lg font-semibold text-primary-500">
                {totalGroups} 组
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">已分组</span>
              <span className="text-lg font-semibold text-green-600">
                {groupedCount} 人
              </span>
            </div>
            {ungroupedCount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">未分组</span>
                <span className="text-lg font-semibold text-orange-600">
                  {ungroupedCount} 人
                </span>
              </div>
            )}
            {totalGroups > 0 && (
              <div className="flex justify-between items-center text-xs text-gray-500 pt-1 border-t border-blue-100">
                <span>组大小范围</span>
                <span className="font-medium">
                  {minGroupSize} - {maxGroupSize} 人/组
                </span>
              </div>
            )}
          </div>

          {/* 性别分布 */}
          {groupedCount > 0 && (
            <div className="bg-green-50 rounded-lg p-4 space-y-2">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                👥 性别分布（已分组）
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">男性</span>
                <span className="text-base font-semibold text-blue-600">
                  {maleCount} 人
                  {groupedCount > 0 && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({Math.round((maleCount / groupedCount) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">女性</span>
                <span className="text-base font-semibold text-pink-600">
                  {femaleCount} 人
                  {groupedCount > 0 && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({Math.round((femaleCount / groupedCount) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              {otherCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">其他</span>
                  <span className="text-base font-semibold text-gray-600">
                    {otherCount} 人
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 分数统计 */}
          {avgScore > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">平均分数</span>
                <span className="text-lg font-semibold text-purple-600">
                  {avgScore} 分
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>最高分: {maxScore} 分</span>
                <span>最低分: {minScore} 分</span>
              </div>
            </div>
          )}

          {/* 警告提示 */}
          {ungroupedCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-sm text-orange-800">
                ⚠️ 注意：还有 {ungroupedCount}{" "}
                人未分组，发布后他们将不会收到分组通知。
              </div>
            </div>
          )}

          {/* 通知选项 */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm font-semibold text-gray-700 mb-3">
              📬 通知设置
            </div>
            <Checkbox
              checked={sendNotification}
              onChange={(checked) => setSendNotification(checked)}
            >
              <span className="text-sm text-gray-700 font-medium">
                立即发送站内通知
              </span>
            </Checkbox>
            <div className="ml-6 mt-2 space-y-1">
              {sendNotification ? (
                <>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    ✓ 将向 <span className="font-semibold">{groupedCount}</span>{" "}
                    人发送分组通知
                  </div>
                  <div className="text-xs text-gray-500">
                    • 成员可在"我的活动"中查看分组详情
                  </div>
                  <div className="text-xs text-gray-500">
                    • 通知将即时送达，无延迟
                  </div>
                </>
              ) : (
                <div className="text-xs text-orange-600">
                  ⚠️ 不发送通知，成员需手动查看分组结果
                </div>
              )}
            </div>
          </div>

          {/* 确认提示 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 leading-relaxed">
              📌 发布后：
              <br />• 分组结果将对成员可见
              <br />• 已锁定的分组将保持不变
              <br />
              {sendNotification && "• 成员将收到站内通知"}
            </div>
          </div>
        </div>
      }
      actions={[
        [
          {
            key: "cancel",
            text: "取消",
            onClick: onCancel,
            disabled: loading,
          },
          {
            key: "confirm",
            text: loading ? "发布中..." : "确认发布",
            onClick: handleConfirm,
            disabled: loading,
            bold: true,
          },
        ],
      ]}
      closeOnMaskClick={!loading}
    />
  );
};

export default PublishConfirmModal;
