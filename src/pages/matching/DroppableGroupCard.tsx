import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { MatchingGroup } from "./types";

interface DroppableGroupCardProps {
  group: MatchingGroup;
  children: React.ReactNode;
}

/**
 * 可放置的分组卡片组件
 * 接收拖拽的成员并添加到组中
 * 锁定的组不能接收拖拽
 */
const DroppableGroupCard: React.FC<DroppableGroupCardProps> = ({
  group,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: group.id,
    data: { group },
    disabled: group.isLocked, // 锁定的组不能接收拖拽
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        border-2 p-4 rounded-lg transition-all duration-150
        ${
          isOver && !group.isLocked
            ? "border-primary-500 bg-primary-50 shadow-md"
            : "border-gray-200 bg-white"
        }
        ${group.isLocked ? "opacity-60" : ""}
      `}
    >
      {children}
    </div>
  );
};

export default DroppableGroupCard;
