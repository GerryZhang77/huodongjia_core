/**
 * 支持自定义选项的 Selector 组件
 * 在预设选项基础上，允许用户添加自定义选项（限制字数）
 */

import React, { useEffect, useMemo, useState } from "react";
import { Selector } from "antd-mobile";
import { Plus, X } from "lucide-react";

interface CustomSelectorProps {
  options: { label: string; value: string }[];
  value?: string | string[];
  onChange?: (value: string[]) => void;
  multiple?: boolean;
  maxCustomLength?: number;
  placeholder?: string;
}

export const CustomSelector: React.FC<CustomSelectorProps> = ({
  options,
  value = [],
  onChange,
  multiple = false,
  maxCustomLength = 7,
  placeholder = "输入自定义选项",
}) => {
  const selectedValues = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value],
  );
  const selectedValueKey = selectedValues.join("\u0000");
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [customOptions, setCustomOptions] = useState<
    { label: string; value: string }[]
  >(() => {
    // 从 value 中找出不在预设选项中的值，恢复为自定义选项
    const presetValues = new Set(options.map((o) => o.value));
    return selectedValues
      .filter((v) => !presetValues.has(v))
      .map((v) => ({ label: v.startsWith("custom_") ? v.slice(7) : v, value: v }));
  });

  const allOptions = [...options, ...customOptions];

  const countChars = (value: string) => Array.from(value).length;
  const limitChars = (value: string) =>
    Array.from(value).slice(0, maxCustomLength).join("");

  useEffect(() => {
    const presetValues = new Set(options.map((o) => o.value));
    const customValues = selectedValues.filter((v) => !presetValues.has(v));
    if (customValues.length === 0) return;

    setCustomOptions((prev) => {
      const existingValues = new Set(prev.map((o) => o.value));
      const additions = customValues
        .filter((v) => !existingValues.has(v))
        .map((v) => ({ label: v.startsWith("custom_") ? v.slice(7) : v, value: v }));
      return additions.length > 0 ? [...prev, ...additions] : prev;
    });
  }, [options, selectedValueKey, selectedValues]);

  const addCustomOption = () => {
    const trimmed = limitChars(inputValue.trim());
    if (!trimmed) return;
    if (allOptions.some((o) => o.value === trimmed || o.label === trimmed))
      return;

    const newOption = { label: trimmed, value: `custom_${trimmed}` };
    const newCustomOptions = [...customOptions, newOption];
    setCustomOptions(newCustomOptions);

    // 自动选中新添加的选项
    if (multiple) {
      onChange?.([...selectedValues, newOption.value]);
    } else {
      onChange?.([newOption.value]);
    }

    setInputValue("");
    setShowInput(false);
  };

  const removeCustomOption = (optValue: string) => {
    setCustomOptions((prev) => prev.filter((o) => o.value !== optValue));
    onChange?.(selectedValues.filter((v) => v !== optValue));
  };

  return (
    <div>
      <Selector
        options={allOptions}
        value={selectedValues}
        onChange={(v) => onChange?.(v as string[])}
        {...(multiple ? { multiple: true } : {})}
        style={{ "--border-radius": "8px" } as any}
      />

      {/* 自定义选项标签（显示删除按钮） */}
      {customOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {customOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex max-w-full flex-nowrap items-center gap-1 whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {opt.label}
              <button
                type="button"
                onClick={() => removeCustomOption(opt.value)}
                className="p-0.5 hover:text-red-500 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 添加自定义选项 */}
      {showInput ? (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              const nextValue = e.target.value;
              const composing =
                isComposing ||
                Boolean((e.nativeEvent as InputEvent).isComposing);
              setInputValue(composing ? nextValue : limitChars(nextValue));
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(e) => {
              setIsComposing(false);
              setInputValue(limitChars(e.currentTarget.value));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomOption();
              }
            }}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-400 transition-colors"
            placeholder={placeholder}
            autoFocus
          />
          <span
            className={`text-xs whitespace-nowrap ${
              countChars(inputValue) > maxCustomLength
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {Math.min(countChars(inputValue), maxCustomLength)}/{maxCustomLength}
          </span>
          <button
            type="button"
            onClick={addCustomOption}
            className="px-3 py-1.5 text-xs text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
          >
            添加
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInput(false);
              setInputValue("");
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="mt-2 flex flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-primary-300 hover:text-primary-500 dark:border-gray-600 dark:text-gray-400 [&>svg]:shrink-0"
        >
          <Plus size={12} />
          自定义
        </button>
      )}
    </div>
  );
};
