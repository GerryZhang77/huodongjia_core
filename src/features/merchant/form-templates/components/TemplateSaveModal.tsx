import React, { useState } from "react";
import { Popup, Input, Button } from "antd-mobile";
import { X } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { useCreateFormTemplate } from "@/features/merchant/form-templates/hooks/useFormTemplates";
import {
  FORM_TEMPLATE_TYPE_LABELS,
  type FormTemplateType,
} from "@/features/merchant/form-templates/types";
import type { RegistrationFormField } from "@/features/activities/types";

interface TemplateSaveModalProps {
  visible: boolean;
  type: FormTemplateType;
  /** 当前要保存为模板的 schema 内容 */
  schema: RegistrationFormField[] | string | undefined;
  onClose: () => void;
  /** 保存成功后回调（可用来 Toast 引导用户去"我的模板"查看） */
  onSaved?: () => void;
}

const TemplateSaveModal: React.FC<TemplateSaveModalProps> = ({
  visible,
  type,
  schema,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState("");
  const create = useCreateFormTemplate();

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Toast.show({ content: "请输入模板名称", icon: "fail" });
      return;
    }
    if (schema === undefined || schema === null) {
      Toast.show({ content: "当前没有可保存的内容", icon: "fail" });
      return;
    }
    try {
      const res = await create.mutateAsync({ name: trimmed, type, schema });
      if (!res.success) {
        Toast.show({ content: res.message || "保存失败", icon: "fail" });
        return;
      }
      Toast.show({
        icon: "success",
        content: "已保存到「我的模板」，可在「个人中心 → 我的模板」查看",
        duration: 2500,
      });
      setName("");
      onSaved?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "保存失败";
      Toast.show({ content: msg, icon: "fail" });
    }
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">保存为模板</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            类型：{FORM_TEMPLATE_TYPE_LABELS[type]}
          </p>
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="px-5 py-5">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          模板名称
        </label>
        <Input
          placeholder="给模板起个好记的名字（例如：常规线下沙龙）"
          value={name}
          onChange={setName}
          maxLength={40}
          className="bg-gray-50 rounded-lg"
        />
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          下次创建活动时可在"从模板导入"快速复用，避免重复编辑。
          所有模板可在 <span className="text-primary-500">个人中心 → 我的模板</span> 中管理。
        </p>
      </div>

      <div className="px-5 pb-5 flex gap-3">
        <Button
          block
          fill="outline"
          onClick={onClose}
          style={{ "--border-radius": "12px" } as React.CSSProperties}
        >
          取消
        </Button>
        <Button
          block
          color="primary"
          loading={create.isPending}
          onClick={handleSave}
          style={{ "--border-radius": "12px" } as React.CSSProperties}
        >
          保存
        </Button>
      </div>
    </Popup>
  );
};

export default TemplateSaveModal;
