/**
 * ActivitySelector - 活动选择器
 *
 * 切换 "全部用户" / 某个具体活动 的用户池视图
 * 下拉列表展示商家所有活动
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Users, CalendarDays, Check, Search } from "lucide-react";

// ========================================
// 类型定义
// ========================================

export interface ActivityOption {
  id: string;
  title: string;
  participantCount: number;
  status: string;
  eventStartTime?: string;
}

export interface ActivitySelectorProps {
  /** 当前选中的活动 ID，null 表示全部用户 */
  selectedActivityId: string | null;
  /** 活动列表 */
  activities: ActivityOption[];
  /** 总用户数（全部用户池） */
  totalUserCount: number;
  /** 选择回调 */
  onSelect: (activityId: string | null) => void;
}

// ========================================
// 辅助
// ========================================

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    registration: { label: "报名中", className: "bg-green-100 text-green-600" },
    ongoing: { label: "进行中", className: "bg-blue-100 text-blue-600" },
    completed: { label: "已结束", className: "bg-gray-100 text-gray-500" },
    published: {
      label: "已发布",
      className: "bg-primary-100 text-primary-600",
    },
    draft: { label: "草稿", className: "bg-yellow-100 text-yellow-600" },
    cancelled: { label: "已取消", className: "bg-red-100 text-red-500" },
  };
  return (
    map[status] || { label: status, className: "bg-gray-100 text-gray-500" }
  );
}

// ========================================
// 组件
// ========================================

const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  selectedActivityId,
  activities,
  totalUserCount,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // 当前选中项的展示文字
  const selectedLabel = selectedActivityId
    ? activities.find((a) => a.id === selectedActivityId)?.title || "未知活动"
    : "全部用户";

  // 搜索过滤
  const filteredActivities = activities.filter((a) =>
    a.title.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <button
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 hover:border-primary-300 transition-colors w-full sm:w-auto"
        onClick={() => {
          setOpen(!open);
          setSearchKeyword("");
        }}
      >
        {selectedActivityId ? (
          <CalendarDays size={16} className="text-primary-400 flex-shrink-0" />
        ) : (
          <Users size={16} className="text-primary-400 flex-shrink-0" />
        )}
        <span className="truncate max-w-[200px]">{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* 下拉面板 */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-[320px] bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          {/* 搜索框 */}
          {activities.length > 4 && (
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Search size={14} className="text-gray-400" />
                <input
                  type="text"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  placeholder="搜索活动..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-[300px] overflow-y-auto">
            {/* 全部用户选项 */}
            <button
              className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm transition-colors ${
                selectedActivityId === null
                  ? "bg-primary-50 text-primary-600"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            >
              <Users
                size={16}
                className={
                  selectedActivityId === null
                    ? "text-primary-400"
                    : "text-gray-400"
                }
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium">全部用户</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  所有活动参与者的汇总
                </div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">
                {totalUserCount}人
              </span>
              <span className="w-4 flex-shrink-0 flex justify-end">
                {selectedActivityId === null && (
                  <Check size={14} className="text-primary-400" />
                )}
              </span>
            </button>

            {/* 分割线 */}
            <div className="h-px bg-gray-100 mx-4" />

            {/* 活动列表 */}
            <div className="py-1">
              {filteredActivities.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  没有找到匹配的活动
                </div>
              ) : (
                filteredActivities.map((activity) => {
                  const badge = getStatusBadge(activity.status);
                  const isSelected = selectedActivityId === activity.id;

                  return (
                    <button
                      key={activity.id}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-primary-50 text-primary-600"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                      onClick={() => {
                        onSelect(activity.id);
                        setOpen(false);
                      }}
                    >
                      <CalendarDays
                        size={16}
                        className={
                          isSelected ? "text-primary-400" : "text-gray-400"
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {activity.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] rounded-full ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">
                        {activity.participantCount}人
                      </span>
                      <span className="w-4 flex-shrink-0 flex justify-end">
                        {isSelected && (
                          <Check size={14} className="text-primary-400" />
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitySelector;
