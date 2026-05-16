import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Input } from "antd-mobile";
import { ChevronLeft, FileText, Trash2, Pencil } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { MerchantLayout } from "@/components/layout";
import {
  useFormTemplates,
  useUpdateFormTemplate,
  useDeleteFormTemplate,
  FORM_TEMPLATE_TYPE_LABELS,
  type FormTemplate,
  type FormTemplateType,
} from "@/features/merchant/form-templates";

const TYPE_TABS: { key: FormTemplateType; label: string }[] = [
  { key: "registration_form", label: "报名信息收集" },
  { key: "requirements", label: "参与要求" },
];

const TemplateListPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<FormTemplateType>(
    "registration_form",
  );
  // 拉取全量，本地按 activeType 过滤；这样 tab 计数才能始终反映两类模板的真实数量
  const { data: allTemplates = [], isLoading } = useFormTemplates();
  const updateMutation = useUpdateFormTemplate();
  const deleteMutation = useDeleteFormTemplate();

  const templates = useMemo(
    () => allTemplates.filter((t) => t.type === activeType),
    [allTemplates, activeType],
  );

  const counts = useMemo(() => {
    const map = new Map<FormTemplateType, number>();
    map.set("registration_form", 0);
    map.set("requirements", 0);
    allTemplates.forEach((t) => map.set(t.type, (map.get(t.type) ?? 0) + 1));
    return map;
  }, [allTemplates]);

  const handleRename = (t: FormTemplate) => {
    Dialog.confirm({
      title: "重命名模板",
      content: (
        <Input
          defaultValue={t.name}
          maxLength={40}
          onChange={(v) => ((t as any).__pendingName = v)}
        />
      ),
      confirmText: "保存",
      cancelText: "取消",
      onConfirm: async () => {
        const next = ((t as any).__pendingName ?? t.name) as string;
        const trimmed = next.trim();
        if (!trimmed || trimmed === t.name) return;
        try {
          const res = await updateMutation.mutateAsync({
            id: t.id,
            patch: { name: trimmed },
          });
          if (!res.success) {
            Toast.show({
              icon: "fail",
              content: res.message || "重命名失败",
            });
            return;
          }
          Toast.show({ icon: "success", content: "已更新" });
        } catch (err: any) {
          Toast.show({
            icon: "fail",
            content: err?.message || "请求失败",
          });
        }
      },
    });
  };

  const handleDelete = (t: FormTemplate) => {
    Dialog.confirm({
      title: "删除模板？",
      content: `「${t.name}」删除后无法恢复，已经引用过它的活动不受影响。`,
      confirmText: "删除",
      cancelText: "取消",
      onConfirm: async () => {
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
        } catch (err: any) {
          Toast.show({
            icon: "fail",
            content: err?.message || "请求失败",
          });
        }
      },
    });
  };

  return (
    <MerchantLayout
      title="我的模板"
      showBack
      onBack={() => navigate("/dashboard/profile")}
      showTabBar={false}
    >
      <div className="p-4 lg:p-6 space-y-4">
        {/* 类型切换 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1 inline-flex">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveType(tab.key)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                activeType === tab.key
                  ? "bg-primary-50 text-primary-600 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-gray-400">
                ({counts.get(tab.key) ?? 0})
              </span>
            </button>
          ))}
        </div>

        {/* 列表 */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : templates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 py-16 text-center">
            <FileText
              size={36}
              className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
            />
            <p className="text-sm text-gray-400 mb-1">
              还没有「{FORM_TEMPLATE_TYPE_LABELS[activeType]}」模板
            </p>
            <p className="text-xs text-gray-400">
              在创建/编辑活动时点击对应区域的「保存为模板」即可
            </p>
            <button
              onClick={() => navigate("/dashboard/activity/create")}
              className="mt-4 text-sm text-primary-500 hover:text-primary-600 transition-colors"
            >
              去创建活动 →
            </button>
          </div>
        ) : (
          <ul className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
            {templates.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText
                    size={18}
                    className="text-primary-500 dark:text-primary-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {t.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {FORM_TEMPLATE_TYPE_LABELS[t.type]} · 更新于{" "}
                    {new Date(t.updated_at).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleRename(t)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="重命名"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-gray-400 px-1 leading-relaxed">
          模板用于在创建/编辑活动时一键应用「报名信息收集」或「参与要求」内容，避免重复填写。
        </p>
      </div>

      {/* 移动端无底部 Tab，手动加返回入口（可选） */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-800 dark:via-gray-800/95">
        <button
          onClick={() => navigate("/dashboard/profile")}
          className="w-full max-w-2xl mx-auto flex items-center justify-center gap-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={14} />
          返回个人中心
        </button>
      </div>
    </MerchantLayout>
  );
};

export default TemplateListPage;
