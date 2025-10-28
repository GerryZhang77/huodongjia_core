import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Tag } from "antd-mobile";
import { Participant } from "./types";

interface DraggableMemberCardProps {
  member: Participant;
  groupId?: string;
  isInGroup?: boolean;
  topReasons?: string[]; // Top2 匹配理由（已分组成员显示）
}

/**
 * 可拖拽的成员卡片组件
 * 支持 4 种拖拽场景：
 * 1. 未分组 → 已分组
 * 2. 组 A → 组 B
 * 3. 已分组 → 未分组
 * 4. 组内排序
 */
const DraggableMemberCard: React.FC<DraggableMemberCardProps> = ({
  member,
  groupId,
  isInGroup = false,
  topReasons = [],
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: member.id,
      data: { member, groupId },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }
    : { cursor: "move" };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-3 p-3 rounded-lg transition-all duration-150
        min-h-[44px]
        ${
          isInGroup
            ? "bg-gray-50 hover:bg-gray-100"
            : "bg-yellow-50 border border-yellow-200 hover:bg-yellow-100"
        }
        ${isDragging ? "shadow-lg ring-2 ring-primary-500" : ""}
      `}
    >
      {/* 头像 */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0
          ${
            isInGroup
              ? "bg-primary-100 text-primary-600"
              : "bg-yellow-200 text-yellow-700"
          }
        `}
      >
        {member.avatar ? (
          <img
            src={member.avatar}
            alt={member.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          member.name.charAt(0)
        )}
      </div>

      {/* 成员信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">
            {member.name}
          </span>
          {member.gender && (
            <Tag
              color={member.gender === "male" ? "primary" : "danger"}
              fill="outline"
              style={{ fontSize: "10px", padding: "0 4px" }}
            >
              {member.gender === "male" ? "👨" : "👩"}
            </Tag>
          )}
        </div>

        <div className="text-xs text-gray-500">
          {member.occupation && `${member.occupation} · `}
          {member.industry && `${member.industry}`}
        </div>

        {/* Top2 匹配理由标签（仅已分组成员） */}
        {isInGroup && topReasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {topReasons.slice(0, 2).map((reason, idx) => (
              <Tag
                key={idx}
                color="success"
                fill="outline"
                style={{ fontSize: "10px", padding: "2px 6px" }}
              >
                ✓ {reason}
              </Tag>
            ))}
          </div>
        )}

        {/* 个人标签 */}
        {member.tags && member.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {member.tags.slice(0, 3).map((tag, idx) => (
              <Tag
                key={idx}
                color="default"
                style={{ fontSize: "10px", padding: "0 4px" }}
              >
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* 拖拽指示图标 */}
      <div className="text-gray-400 flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="6" cy="4" r="1" />
          <circle cx="10" cy="4" r="1" />
          <circle cx="6" cy="8" r="1" />
          <circle cx="10" cy="8" r="1" />
          <circle cx="6" cy="12" r="1" />
          <circle cx="10" cy="12" r="1" />
        </svg>
      </div>
    </div>
  );
};

export default DraggableMemberCard;
