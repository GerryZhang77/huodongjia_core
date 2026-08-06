/**
 * 报名信息收集 编辑器组件
 * 商家创建活动时，用于自定义用户报名时需要填写的内容
 * 以 Drawer 弹窗形式编辑，主表单中只显示入口摘要
 */

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  ClipboardList,
  Settings2,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Toast } from "@/components/ui/Toast";
import type {
  RegistrationFormField,
  FormFieldType,
} from "../../types";
import { ensureRequiredPhoneField } from "../ActivityForm/registrationTypeDefaults";
import {
  findInvalidRegistrationFieldIndex,
  normalizeRegistrationFieldForMerchant,
} from "../../utils/registrationFormFields";

// 完全锁定（不可展开编辑）的预设项
const LOCKED_PRESET_KEYS: string[] = ["phone"];
const DEFAULT_PRESET_FIELDS: RegistrationFormField[] = [
  {
    key: "name",
    label: "姓名",
    type: "text",
    required: false,
    preset: true,
    deletable: true,
    placeholder: "请输入姓名",
  },
  {
    key: "phone",
    label: "手机号",
    type: "text",
    required: true,
    preset: true,
    deletable: false,
    placeholder: "请输入手机号",
  },
  {
    key: "gender",
    label: "性别",
    type: "radio",
    required: false,
    preset: true,
    deletable: true,
    options: ["男", "女"],
  },
];

// 类型配置
const FIELD_TYPE_OPTIONS: { value: FormFieldType; label: string }[] = [
  { value: "text", label: "单行输入" },
  { value: "textarea", label: "多行输入" },
  { value: "radio", label: "单选" },
  { value: "select", label: "下拉选择" },
  { value: "multi-select", label: "多选" },
  { value: "image", label: "图片上传" },
];

const TYPE_LABEL_MAP: Record<FormFieldType, string> = {
  text: "单行输入",
  textarea: "多行输入",
  radio: "单选",
  select: "下拉选择",
  "multi-select": "多选",
  image: "图片上传",
};

interface RegistrationFormBuilderProps {
  value?: RegistrationFormField[];
  onChange?: (fields: RegistrationFormField[]) => void;
}

/**
 * 单个编辑项卡片
 */
const FieldEditCard: React.FC<{
  field: RegistrationFormField;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (field: RegistrationFormField) => void;
  onRemove: () => void;
  onAddAfter: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({
  field,
  isExpanded,
  onToggleExpand,
  onChange,
  onRemove,
  onAddAfter,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const [newOption, setNewOption] = useState("");
  const needsOptions = ["select", "multi-select", "radio"].includes(field.type);
  const isLocked = LOCKED_PRESET_KEYS.includes(field.key);
  // 未命名的自定义项不允许折叠（强制展开编辑），锁定项不允许展开
  const canExpand = !isLocked;
  const isEditingCustomField = isExpanded && !field.preset;
  const hasMissingLabel = !field.label.trim();

  const addOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed || field.options?.includes(trimmed)) return;
    onChange({ ...field, options: [...(field.options || []), trimmed] });
    setNewOption("");
  };

  const removeOption = (idx: number) => {
    const opts = [...(field.options || [])];
    opts.splice(idx, 1);
    onChange({ ...field, options: opts });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
      {/* 折叠头部 */}
      <div
        className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${canExpand ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750" : "cursor-default opacity-70"}`}
        onClick={() => canExpand && onToggleExpand()}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {isEditingCustomField ? "收集项设置" : field.label || "未命名"}
            </span>
            {field.required && !isEditingCustomField && (
              <span className="text-[10px] text-red-500 font-medium">必填</span>
            )}
            {field.preset && (
              <span className="text-[10px] px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400 rounded">
                预设
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {TYPE_LABEL_MAP[field.type]}
            {needsOptions && field.options?.length
              ? ` · ${field.options.length}个选项`
              : ""}
          </span>
        </div>
        {isLocked ? (
          <Lock size={14} className="text-gray-300 flex-shrink-0" />
        ) : (
          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onAddAfter}
              className="p-1 text-gray-300 hover:text-primary-500 transition-colors"
              title="在下方添加"
            >
              <Plus size={14} />
            </button>
            {(!field.preset || field.deletable) && (
              <button
                type="button"
                onClick={onRemove}
                className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                title="删除"
              >
                <Trash2 size={14} />
              </button>
            )}
            {isExpanded ? (
              <ChevronUp size={16} className="text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
          {/* 预设字段：只显示必填开关 */}
          {field.preset ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">必须填写</span>
              <Switch
                checked={field.required}
                onChange={(checked) => onChange({ ...field, required: checked })}
                size="small"
              />
            </div>
          ) : (
            <>
              {/* 名称 */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">名称</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => onChange({ ...field, label: e.target.value })}
                  aria-invalid={hasMissingLabel}
                  aria-describedby={hasMissingLabel ? `field-${field.key}-label-error` : undefined}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:outline-none dark:bg-gray-800 dark:text-gray-100 ${
                    hasMissingLabel
                      ? "border-error-400 focus:border-error-500 focus:ring-2 focus:ring-error-100 dark:border-error-600 dark:focus:ring-error-900/30"
                      : "border-gray-200 focus:border-primary-400 dark:border-gray-600"
                  }`}
                  placeholder="输入名称"
                />
                {hasMissingLabel && (
                  <p
                    id={`field-${field.key}-label-error`}
                    role="alert"
                    className="mt-1 text-xs text-error-500"
                  >
                    请填写字段名称，或删除此收集项
                  </p>
                )}
              </div>

              {/* 类型 */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">填写方式</label>
                <div className="flex flex-wrap gap-1.5">
                  {FIELD_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        const updated: RegistrationFormField = { ...field, type: opt.value };
                        if (["select", "multi-select", "radio"].includes(opt.value) && !updated.options?.length) {
                          updated.options = [];
                        }
                        if (opt.value === "image") {
                          updated.maxImages = updated.maxImages || 1;
                          delete updated.options;
                        }
                        onChange(updated);
                      }}
                      className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                        field.type === opt.value
                          ? "border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                          : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 提示文字 */}
              {(field.type === "text" || field.type === "textarea") && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">提示文字</label>
                  <input
                    type="text"
                    value={field.placeholder || ""}
                    onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-400 transition-colors"
                    placeholder="用户看到的输入提示"
                  />
                </div>
              )}

              {/* 选项编辑 */}
              {needsOptions && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">可选项</label>
                  <div className="space-y-1.5">
                    {(field.options || []).map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">{opt}</span>
                        <button type="button" onClick={() => removeOption(idx)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(); } }}
                        className="flex-1 px-3 py-1.5 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-400 transition-colors"
                        placeholder="输入选项名，按回车添加"
                      />
                      <button type="button" onClick={addOption} className="px-2.5 py-1.5 text-xs text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
                        添加
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {field.type === "image" && (
                <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900/50 dark:bg-blue-900/20">
                  <label className="text-xs text-gray-600 dark:text-gray-300 block">
                    最多上传张数
                  </label>
                  <select
                    value={field.maxImages || 1}
                    onChange={(event) =>
                      onChange({ ...field, maxImages: Number(event.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count}>{count} 张</option>
                    ))}
                  </select>
                  <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-300">
                    图片仅用于本次报名，只有本活动主办方可查看，不会进入用户个人资料或公开页面。
                  </p>
                </div>
              )}

              {/* 是否必填 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">必须填写</span>
                <Switch
                  checked={field.required}
                  onChange={(checked) => onChange({ ...field, required: checked })}
                  size="small"
                />
              </div>

              {/* 上移/下移 */}
              <div className="flex items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-1">
                  <button type="button" onClick={onMoveUp} disabled={isFirst} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors" title="上移">
                    <ChevronUp size={14} />
                  </button>
                  <button type="button" onClick={onMoveDown} disabled={isLast} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors" title="下移">
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 报名信息收集 编辑器主组件
 */
export const RegistrationFormBuilder: React.FC<RegistrationFormBuilderProps> = ({
  value,
  onChange,
}) => {
  const fields = ensureRequiredPhoneField(
    value && value.length > 0 ? value : DEFAULT_PRESET_FIELDS,
  ).map(normalizeRegistrationFieldForMerchant);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const updateFields = (newFields: RegistrationFormField[]) => {
    onChange?.(newFields);
  };

  const createEmptyField = (): RegistrationFormField => ({
      key: `custom_${
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      }`,
      label: "",
      type: "text",
      required: false,
      preset: false,
      placeholder: "",
  });

  const addField = () => {
    const newField = createEmptyField();
    const newFields = [...fields, newField];
    updateFields(newFields);
    setExpandedIndex(newFields.length - 1);
  };

  const insertFieldAfter = (index: number) => {
    const newField = createEmptyField();
    const newFields = [...fields];
    newFields.splice(index + 1, 0, newField);
    updateFields(newFields);
    setExpandedIndex(index + 1);
  };

  const updateField = (index: number, field: RegistrationFormField) => {
    const newFields = [...fields];
    newFields[index] = field;
    updateFields(newFields);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    updateFields(newFields);
    setExpandedIndex(null);
  };

  const moveField = (from: number, to: number) => {
    if (to < 0 || to >= fields.length) return;
    const newFields = [...fields];
    const [moved] = newFields.splice(from, 1);
    newFields.splice(to, 0, moved);
    updateFields(newFields);
    setExpandedIndex(to);
  };

  const closeDrawerIfValid = () => {
    const invalidIndex = findInvalidRegistrationFieldIndex(fields);
    if (invalidIndex >= 0) {
      setExpandedIndex(invalidIndex);
      Toast.show({
        icon: "fail",
        content: `第 ${invalidIndex + 1} 个收集项尚未填写名称`,
      });
      return;
    }
    setDrawerOpen(false);
  };

  // 摘要信息
  const requiredCount = fields.filter((f) => f.required).length;
  const optionalCount = fields.length - requiredCount;

  return (
    <>
      {/* 入口卡片 */}
      <div
        onClick={() => setDrawerOpen(true)}
        className="flex items-center gap-3 p-3 border border-dashed border-primary-200 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
      >
        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
          <ClipboardList size={20} className="text-primary-500 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-primary-700 dark:text-primary-300">
            配置报名收集信息
          </div>
          <div className="text-xs text-primary-400 dark:text-primary-500 mt-0.5">
            已设置 {fields.length} 项（{requiredCount} 必填
            {optionalCount > 0 && `，${optionalCount} 选填`}）· 点击编辑
          </div>
        </div>
        <Settings2
          size={16}
          className="text-primary-300 group-hover:text-primary-500 transition-colors flex-shrink-0"
        />
      </div>

      {/* 编辑抽屉 */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawerIfValid}
        title="报名信息收集"
        placement="bottom"
        size="85vh"
        footer={
          <div className="px-4 py-3">
            <Button
              variant="primary"
              block
              onClick={closeDrawerIfValid}
            >
              完成设置
            </Button>
          </div>
        }
      >
        <div className="px-4 py-4 space-y-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            设置用户报名活动时需要填写的内容，拖动可调整顺序
          </p>
          <div className="flex items-start gap-2 px-3 py-2 bg-warning-50 dark:bg-warning-900/20 border border-warning-100 dark:border-warning-900/40 rounded-lg">
            <AlertCircle
              size={14}
              className="text-warning-500 dark:text-warning-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-warning-700 dark:text-warning-300 leading-relaxed">
              手机号用于账号识别和验证码登录，固定为必填且不会公开展示；其他隐私字段请按活动需要收集
            </p>
          </div>

          {/* 列表 */}
          <div className="space-y-2">
            {fields.map((field, index) => (
              <FieldEditCard
                key={field.key}
                field={field}
                isExpanded={expandedIndex === index}
                onToggleExpand={() => {
                  // 未命名的自定义项允许重新展开，但不通过点击折叠。
                  if (!field.preset && !field.label.trim()) {
                    setExpandedIndex(index);
                    return;
                  }
                  setExpandedIndex(expandedIndex === index ? null : index);
                }}
                onChange={(f) => updateField(index, f)}
                onRemove={() => removeField(index)}
                onAddAfter={() => insertFieldAfter(index)}
                onMoveUp={() => moveField(index, index - 1)}
                onMoveDown={() => moveField(index, index + 1)}
                isFirst={index === 0}
                isLast={index === fields.length - 1}
              />
            ))}
          </div>

          {/* 添加按钮 */}
          <button
            type="button"
            onClick={addField}
          className="flex w-full flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 transition-colors hover:border-primary-300 hover:text-primary-500 dark:border-gray-600 dark:text-gray-400 [&>svg]:shrink-0"
          >
            <Plus size={16} />
            添加收集项
          </button>
        </div>
      </Drawer>
    </>
  );
};

export default RegistrationFormBuilder;
