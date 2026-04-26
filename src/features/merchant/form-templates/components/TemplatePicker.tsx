import React, { useState } from "react";
import { Popup, Button, Empty } from "antd-mobile";
import { X, FileText, Trash2 } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import {
  useFormTemplates,
  useDeleteFormTemplate,
} from "@/features/merchant/form-templates/hooks/useFormTemplates";
import {
  FORM_TEMPLATE_TYPE_LABELS,
  type FormTemplate,
  type FormTemplateType,
} from "@/features/merchant/form-templates/types";

interface TemplatePickerProps {
  visible: boolean;
  type: FormTemplateType;
  onClose: () => void;
  /** 选中后回调；schema 已是后端原样字段，调用方自行解释 */
  onPick: (template: FormTemplate) => void;
}

const TemplatePicker: React.FC<TemplatePickerProps> = ({
  visible,
  type,
  onClose,
  onPick,
}) => {
  const { data: templates = [], isLoading } = useFormTemplates(type);
  const deleteMutation = useDeleteFormTemplate();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, t: FormTemplate) => {
    e.stopPropagation();
    if (pendingDeleteId !== t.id) {
      // 二次确认：再点一次才真的删
      setPendingDeleteId(t.id);
      window.setTimeout(() => setPendingDeleteId(null), 2500);
      return;
    }
    try {
      const res = await deleteMutation.mutateAsync(t.id);
      if (!res.success) {
        Toast.show({
          icon: "fail",
          content: res.message || "删除失败",
        });
        return;
      }
      Toast.show({ icon: "success", content: "已删除" });
    } catch (err) {
      Toast.show({
        icon: "fail",
        content: err instanceof Error ? err.message : "删除失败",
      });
    } finally {
      setPendingDeleteId(null);
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
        maxHeight: "70vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">从模板导入</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            选择已保存的"{FORM_TEMPLATE_TYPE_LABELS[type]}"模板
          </p>
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : templates.length === 0 ? (
          <Empty
            description={
              <div className="text-sm text-gray-400">
                还没有该类型的模板
                <div className="text-xs mt-1 text-gray-400">
                  在编辑活动时点击"保存为模板"即可创建
                </div>
              </div>
            }
          />
        ) : (
          <ul className="space-y-2">
            {templates.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
                onClick={() => {
                  onPick(t);
                  onClose();
                }}
              >
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {t.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {FORM_TEMPLATE_TYPE_LABELS[t.type]} · 更新于{" "}
                    {new Date(t.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, t)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${
                    pendingDeleteId === t.id
                      ? "bg-red-100 text-red-600"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                  title={pendingDeleteId === t.id ? "再次点击确认删除" : "删除模板"}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
        <Button
          block
          fill="outline"
          onClick={onClose}
          style={{ "--border-radius": "12px" } as React.CSSProperties}
        >
          取消
        </Button>
      </div>
    </Popup>
  );
};

export default TemplatePicker;
