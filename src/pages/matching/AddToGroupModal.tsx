/**
 * AddToGroupModal - 手动添加成员到分组的弹窗
 * 作为拖拽功能的备选方案，适合移动端或拖拽失败时使用
 */

import React, { FC, useState } from "react";
import { Popup, List, Button, Empty, Tag } from "antd-mobile";
import { MatchingGroup, Participant } from "./types";

interface AddToGroupModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭弹窗的回调 */
  onClose: () => void;
  /** 待添加的成员 */
  member: Participant | null;
  /** 可用的分组列表 */
  groups: MatchingGroup[];
  /** 添加成员到分组的回调 */
  onAddToGroup: (memberId: string, groupId: string) => void;
}

export const AddToGroupModal: FC<AddToGroupModalProps> = ({
  visible,
  onClose,
  member,
  groups,
  onAddToGroup,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  // 过滤出未锁定的分组
  const availableGroups = groups.filter((g) => !g.isLocked);

  const handleConfirm = () => {
    if (!member || !selectedGroupId) return;
    onAddToGroup(member.id, selectedGroupId);
    setSelectedGroupId("");
    onClose();
  };

  const handleCancel = () => {
    setSelectedGroupId("");
    onClose();
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={handleCancel}
      onClose={handleCancel}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        minHeight: "40vh",
        maxHeight: "80vh",
      }}
    >
      <div className="p-4">
        {/* 标题 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            添加成员到分组
          </h3>
          {member && (
            <p className="text-sm text-gray-500">
              将{" "}
              <span className="font-medium text-gray-700">{member.name}</span>{" "}
              添加到...
            </p>
          )}
        </div>

        {/* 分组列表 */}
        {availableGroups.length === 0 ? (
          <Empty
            description="暂无可用分组"
            imageStyle={{ width: 80 }}
            style={{ padding: "32px 0" }}
          />
        ) : (
          <div className="mb-4 max-h-[50vh] overflow-y-auto">
            <List>
              {availableGroups.map((group) => (
                <List.Item
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`transition-colors duration-150 ${
                    selectedGroupId === group.id
                      ? "bg-primary-50 border-primary-500"
                      : "hover:bg-gray-50"
                  }`}
                  style={{
                    border:
                      selectedGroupId === group.id
                        ? "1px solid var(--adm-color-primary)"
                        : "1px solid transparent",
                    borderRadius: "8px",
                    marginBottom: "8px",
                  }}
                  prefix={
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-semibold">
                      {group.id}
                    </div>
                  }
                  description={
                    <div className="flex items-center gap-2 mt-1">
                      <Tag color="default" fill="outline">
                        {group.members.length} 人
                      </Tag>
                      {group.isLocked && (
                        <Tag color="warning" fill="outline">
                          🔒 已锁定
                        </Tag>
                      )}
                    </div>
                  }
                >
                  <div className="font-medium text-gray-900">{group.name}</div>
                </List.Item>
              ))}
            </List>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            block
            fill="outline"
            onClick={handleCancel}
            style={{ flex: 1 }}
          >
            取消
          </Button>
          <Button
            block
            color="primary"
            onClick={handleConfirm}
            disabled={!selectedGroupId || availableGroups.length === 0}
            style={{ flex: 1 }}
          >
            确认添加
          </Button>
        </div>
      </div>
    </Popup>
  );
};
