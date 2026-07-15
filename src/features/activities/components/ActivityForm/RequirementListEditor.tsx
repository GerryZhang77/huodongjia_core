/**
 * 参与要求列表编辑器
 * 逐条添加要求项，每条最多50字，最多10条
 * 存储为 JSON 数组字符串，兼容旧纯文本数据
 */

import React, { useState, useEffect } from "react";
import { Plus, X, GripVertical } from "lucide-react";

interface RequirementListEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

/** 尝试解析 JSON 数组，失败则将纯文本按行拆分 */
export const parseRequirements = (raw?: string): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((s: string) => typeof s === "string" && s.trim());
  } catch {
    // 旧数据：纯文本按换行拆分
    return raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const MAX_ITEMS = 10;
const MAX_ITEM_LENGTH = 50;

export const RequirementListEditor: React.FC<RequirementListEditorProps> = ({
  value,
  onChange,
}) => {
  const [items, setItems] = useState<string[]>(() => parseRequirements(value));
  const [inputValue, setInputValue] = useState("");

  // 编辑模式：异步加载的 value 到达时同步内部 state
  useEffect(() => {
    const parsed = parseRequirements(value);
    if (parsed.length > 0 && items.length === 0) {
      setItems(parsed);
    }
  }, [value]);

  const syncToForm = (newItems: string[]) => {
    setItems(newItems);
    onChange?.(newItems.length > 0 ? JSON.stringify(newItems) : "");
  };

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || items.length >= MAX_ITEMS) return;
    syncToForm([...items, trimmed]);
    setInputValue("");
  };

  const removeItem = (index: number) => {
    syncToForm(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, newValue: string) => {
    if (newValue.length > MAX_ITEM_LENGTH) return;
    const newItems = [...items];
    newItems[index] = newValue;
    syncToForm(newItems);
  };

  return (
    <div className="space-y-2">
      {/* 已有项列表 */}
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 group"
        >
          <GripVertical
            size={14}
            className="text-gray-300 dark:text-gray-600 flex-shrink-0"
          />
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <span className="w-5 h-5 flex items-center justify-center text-xs font-medium text-primary-500 bg-primary-50 dark:bg-primary-900/30 rounded-full flex-shrink-0">
              {index + 1}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
              maxLength={MAX_ITEM_LENGTH}
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* 添加新项 */}
      {items.length < MAX_ITEMS && (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                if (e.target.value.length <= MAX_ITEM_LENGTH) {
                  setInputValue(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
              className="flex-1 px-3 py-2 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-400 transition-colors"
              placeholder="输入一条参与要求，按回车添加"
              maxLength={MAX_ITEM_LENGTH}
            />
          </div>
          <button
            type="button"
            onClick={addItem}
            disabled={!inputValue.trim()}
          className="flex flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs text-primary-500 transition-colors hover:bg-primary-50 disabled:opacity-40 dark:hover:bg-primary-900/30 [&>svg]:shrink-0"
          >
            <Plus size={14} />
            添加
          </button>
        </div>
      )}

      {/* 提示 */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {items.length}/{MAX_ITEMS} 条 · 每条最多 {MAX_ITEM_LENGTH} 字
      </p>
    </div>
  );
};
