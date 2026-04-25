/**
 * BatchTagModal - 批量打标签弹窗
 *
 * 支持：
 * 1. 从已有自定义标签中选择
 * 2. 快速创建新标签
 * 3. 预览将应用标签的用户
 */

import React, { useState, useMemo } from "react";
import {
  Popup,
} from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import { X, Plus, Tag as TagIcon, Check } from "lucide-react";
import type { CustomTag } from "@/features/merchant/user-pool/types";
import { TAG_COLORS } from "@/features/merchant/user-pool/types";

// ========================================
// 类型定义
// ========================================

export interface BatchTagModalProps {
  /** 是否显示 */
  visible: boolean;
  /** 选中的用户数量 */
  selectedCount: number;
  /** 已有的自定义标签 */
  existingTags: CustomTag[];
  /** 确认回调 */
  onConfirm: (tagNames: string[]) => void;
  /** 关闭回调 */
  onClose: () => void;
}

// ========================================
// 预设标签颜色 CSS 映射
// ========================================

const TAG_COLOR_CSS: Record<string, string> = {
  primary: "bg-primary-100 text-primary-600 border-primary-200",
  secondary: "bg-orange-100 text-orange-600 border-orange-200",
  accent: "bg-purple-100 text-purple-600 border-purple-200",
  success: "bg-green-100 text-green-600 border-green-200",
  warning: "bg-yellow-100 text-yellow-600 border-yellow-200",
  error: "bg-red-100 text-red-600 border-red-200",
};

function getTagColorCSS(color: string): string {
  return TAG_COLOR_CSS[color] || "bg-gray-100 text-gray-600 border-gray-200";
}

// ========================================
// 主组件
// ========================================

const BatchTagModal: React.FC<BatchTagModalProps> = ({
  visible,
  selectedCount,
  existingTags,
  onConfirm,
  onClose,
}) => {
  // 已选中要添加的标签名
  const [selectedTagNames, setSelectedTagNames] = useState<Set<string>>(
    new Set(),
  );
  // 新建标签输入
  const [newTagName, setNewTagName] = useState("");
  // 新创建的临时标签列表
  const [newTags, setNewTags] = useState<string[]>([]);

  // 所有可选标签
  const allTags = useMemo(() => {
    const existing = existingTags.map((t) => ({
      name: t.name,
      color: t.color,
      isNew: false,
    }));
    const created = newTags.map((name, idx) => ({
      name,
      color: TAG_COLORS[idx % TAG_COLORS.length],
      isNew: true,
    }));
    return [...existing, ...created];
  }, [existingTags, newTags]);

  // 切换标签选中状态
  const toggleTag = (tagName: string) => {
    setSelectedTagNames((prev) => {
      const next = new Set(prev);
      if (next.has(tagName)) {
        next.delete(tagName);
      } else {
        next.add(tagName);
      }
      return next;
    });
  };

  // 创建新标签
  const handleCreateTag = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    // 检查是否已存在
    const exists =
      existingTags.some((t) => t.name === trimmed) || newTags.includes(trimmed);
    if (exists) {
      Toast.show({ content: "标签已存在", position: "bottom" });
      return;
    }

    setNewTags((prev) => [...prev, trimmed]);
    setSelectedTagNames((prev) => new Set([...prev, trimmed]));
    setNewTagName("");
  };

  // 确认
  const handleConfirm = () => {
    if (selectedTagNames.size === 0) {
      Toast.show({ content: "请至少选择一个标签", position: "bottom" });
      return;
    }
    onConfirm(Array.from(selectedTagNames));
    // 重置状态
    setSelectedTagNames(new Set());
    setNewTags([]);
    setNewTagName("");
  };

  // 关闭并重置
  const handleClose = () => {
    setSelectedTagNames(new Set());
    setNewTags([]);
    setNewTagName("");
    onClose();
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={handleClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        maxHeight: "70vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">批量打标签</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            为 {selectedCount} 位用户添加标签
          </p>
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={handleClose}
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* 已有标签 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">选择标签</h4>
          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = selectedTagNames.has(tag.name);
                return (
                  <button
                    key={tag.name}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                      isSelected
                        ? `${getTagColorCSS(tag.color)} ring-2 ring-offset-1 ring-primary-300`
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => toggleTag(tag.name)}
                  >
                    {isSelected && <Check size={14} />}
                    {tag.name}
                    {tag.isNew && (
                      <span className="text-[10px] text-gray-400 ml-0.5">
                        (新)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">暂无标签，请创建新标签</p>
          )}
        </div>

        {/* 创建新标签 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">创建新标签</h4>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 transition-all"
              placeholder="输入标签名称"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateTag();
              }}
              maxLength={20}
            />
            <button
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-accent-50 text-accent-600 text-sm font-medium hover:bg-accent-100 transition-colors flex-shrink-0"
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
            >
              <Plus size={16} />
              添加
            </button>
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
        <button
          className="flex-1 py-3 rounded-[22px] border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
          onClick={handleClose}
        >
          取消
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[22px] font-medium text-sm transition-all ${
            selectedTagNames.size > 0
              ? "bg-gradient-to-br from-accent-400 to-accent-500 text-white shadow-sm hover:shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          onClick={handleConfirm}
          disabled={selectedTagNames.size === 0}
        >
          <TagIcon size={16} />
          确认添加 ({selectedTagNames.size})
        </button>
      </div>
    </Popup>
  );
};

export default BatchTagModal;
