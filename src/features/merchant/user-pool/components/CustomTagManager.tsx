/**
 * CustomTagManager - 自定义标签管理组件
 *
 * 嵌入页面或弹窗中使用，支持：
 * 1. 查看所有自定义标签
 * 2. 创建新标签（名称 + 颜色选择）
 * 3. 删除标签
 * 4. 查看标签使用人数
 */

import React, { useState } from "react";
import {
  Popup,
  Dialog,
} from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import { X, Plus, Trash2, Tag as TagIcon, Settings } from "lucide-react";
import type { CustomTag } from "@/features/merchant/user-pool/types";
import { TAG_COLORS } from "@/features/merchant/user-pool/types";
import {
  TAG_COLOR_OPTIONS as COLOR_OPTIONS,
  getTagColorOption as getColorOption,
} from "@/features/merchant/user-pool/utils/tagColors";

// ========================================
// 类型定义
// ========================================

export interface CustomTagManagerProps {
  /** 是否显示 */
  visible: boolean;
  /** 已有标签列表 */
  tags: CustomTag[];
  /** 创建标签回调 */
  onCreate: (name: string, color: string) => void;
  /** 删除标签回调 */
  onDelete: (tagId: string) => void;
  /** 关闭回调 */
  onClose: () => void;
}

// ========================================
// 主组件
// ========================================

const CustomTagManager: React.FC<CustomTagManagerProps> = ({
  visible,
  tags,
  onCreate,
  onDelete,
  onClose,
}) => {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState<string>(TAG_COLORS[0]);

  // 创建标签
  const handleCreate = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) {
      Toast.show({ content: "请输入标签名称", position: "bottom" });
      return;
    }
    if (tags.some((t) => t.name === trimmed)) {
      Toast.show({ content: "标签已存在", position: "bottom" });
      return;
    }
    onCreate(trimmed, newTagColor);
    setNewTagName("");
    Toast.show({ content: "标签已创建", position: "bottom" });
  };

  // 删除标签 (带确认)
  const handleDelete = (tag: CustomTag) => {
    Dialog.confirm({
      content: (
        <div className="text-center">
          <p>
            确认删除标签 <strong>「{tag.name}」</strong> ?
          </p>
          {tag.userCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              该标签已关联 {tag.userCount} 位用户
            </p>
          )}
        </div>
      ),
      confirmText: "删除",
      cancelText: "取消",
      onConfirm: () => {
        onDelete(tag.id);
        Toast.show({ content: "标签已删除", position: "bottom" });
      },
    });
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        maxHeight: "80vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">标签管理</h3>
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* 创建新标签 */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">创建新标签</h4>

          {/* 标签名输入 */}
          <input
            type="text"
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 transition-all"
            placeholder="输入标签名称"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            maxLength={20}
          />

          {/* 颜色选择 */}
          <div>
            <div className="text-xs text-gray-500 mb-2">选择颜色</div>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.key}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${color.dotClass} ${
                    newTagColor === color.key
                      ? "ring-2 ring-offset-2 ring-primary-300 scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  onClick={() => setNewTagColor(color.key)}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* 预览 */}
          {newTagName.trim() && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">预览:</span>
              <span
            className={`max-w-full truncate whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${getColorOption(newTagColor).bgClass} ${getColorOption(newTagColor).textClass}`}
              >
                {newTagName.trim()}
              </span>
            </div>
          )}

          {/* 创建按钮 */}
          <button
          className="flex w-full flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap rounded-[22px] bg-gradient-to-br from-accent-400 to-accent-500 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:shrink-0"
            onClick={handleCreate}
            disabled={!newTagName.trim()}
          >
            <Plus size={16} />
            创建标签
          </button>
        </div>

        {/* 已有标签列表 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            已有标签 ({tags.length})
          </h4>

          {tags.length > 0 ? (
            <div className="space-y-2">
              {tags.map((tag) => {
                const colorOption = getColorOption(tag.color);
                return (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span
                  className={`max-w-full truncate whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${colorOption.bgClass} ${colorOption.textClass}`}
                      >
                        {tag.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {tag.userCount} 人使用
                      </span>
                    </div>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => handleDelete(tag)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <TagIcon size={32} strokeWidth={1.2} className="mb-2" />
              <p className="text-sm">暂无自定义标签</p>
              <p className="text-xs mt-0.5">创建标签来更好地管理用户</p>
            </div>
          )}
        </div>
      </div>
    </Popup>
  );
};

export default CustomTagManager;
