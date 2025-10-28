import React, { useState } from "react";
import { Dialog, Input, TextArea, Selector, Slider, Toast } from "antd-mobile";
import { MatchingRule } from "./types";

interface AddCustomRuleModalProps {
  visible: boolean;
  existingRules: MatchingRule[];
  onClose: () => void;
  onSubmit: (rule: MatchingRule) => void;
}

/**
 * 添加自定义规则弹窗
 */
const AddCustomRuleModal: React.FC<AddCustomRuleModalProps> = ({
  visible,
  existingRules,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<MatchingRule>>({
    name: "",
    description: "",
    type: "similarity",
    field: "tags",
    weight: 20,
    enabled: true,
  });

  // 规则类型选项
  const ruleTypeOptions = [
    { label: "相似度匹配", value: "similarity" },
    { label: "多样性匹配", value: "diversity" },
    { label: "约束条件", value: "constraint" },
  ];

  // 字段选项
  const fieldOptions = [
    { label: "兴趣标签", value: "tags" },
    { label: "年龄", value: "age" },
    { label: "职业", value: "occupation" },
    { label: "行业", value: "industry" },
    { label: "性别", value: "gender" },
    { label: "城市", value: "city" },
    { label: "院校", value: "school" },
  ];

  // 验证规则名称唯一性
  const validateName = (name: string): boolean => {
    if (!name.trim()) {
      Toast.show({ content: "请输入规则名称", icon: "fail" });
      return false;
    }

    const isDuplicate = existingRules.some((rule) => rule.name === name.trim());
    if (isDuplicate) {
      Toast.show({ content: "规则名称已存在，请使用其他名称", icon: "fail" });
      return false;
    }

    return true;
  };

  // 提交表单
  const handleSubmit = () => {
    if (!validateName(formData.name || "")) {
      return;
    }

    if (!formData.description?.trim()) {
      Toast.show({ content: "请输入规则描述", icon: "fail" });
      return;
    }

    const newRule: MatchingRule = {
      id: `temp-${Date.now()}`, // 临时 ID，保存后由后端分配
      name: formData.name!.trim(),
      description: formData.description!.trim(),
      type: formData.type as "similarity" | "diversity" | "constraint",
      field: formData.field || "tags",
      weight: formData.weight || 20,
      enabled: true,
    };

    onSubmit(newRule);
    onClose();

    // 重置表单
    setFormData({
      name: "",
      description: "",
      type: "similarity",
      field: "tags",
      weight: 20,
      enabled: true,
    });
  };

  return (
    <Dialog
      visible={visible}
      title="添加自定义规则"
      content={
        <div className="space-y-4 p-2">
          {/* 规则名称 */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              规则名称 <span className="text-red-500">*</span>
            </div>
            <Input
              placeholder="例如：同城优先"
              value={formData.name}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, name: val }))
              }
              maxLength={30}
            />
          </div>

          {/* 规则描述 */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              规则描述 <span className="text-red-500">*</span>
            </div>
            <TextArea
              placeholder="描述这个规则如何工作，例如：优先匹配来自同一城市的参与者"
              value={formData.description}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, description: val }))
              }
              rows={3}
              maxLength={200}
              showCount
            />
          </div>

          {/* 规则类型 */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              规则类型
            </div>
            <Selector
              options={ruleTypeOptions}
              value={[formData.type || "similarity"]}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  type: val[0] as "similarity" | "diversity" | "constraint",
                }))
              }
            />
            <div className="text-xs text-gray-500 mt-1">
              • 相似度：让相似的人匹配在一起
              <br />
              • 多样性：让不同的人匹配在一起
              <br />• 约束条件：设定必须满足的条件
            </div>
          </div>

          {/* 匹配字段 */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              匹配字段
            </div>
            <Selector
              options={fieldOptions}
              value={[formData.field || "tags"]}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, field: val[0] }))
              }
            />
          </div>

          {/* 权重 */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              权重: {formData.weight}%
            </div>
            <Slider
              value={formData.weight}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, weight: val as number }))
              }
              min={0}
              max={100}
              step={5}
              style={{ "--fill-color": "var(--adm-color-primary)" }}
            />
          </div>
        </div>
      }
      closeOnAction
      onClose={onClose}
      actions={[
        [
          {
            key: "cancel",
            text: "取消",
            onClick: onClose,
          },
          {
            key: "submit",
            text: "添加",
            bold: true,
            onClick: handleSubmit,
          },
        ],
      ]}
    />
  );
};

export default AddCustomRuleModal;
