/**
 * 用户端 - 我的信息库
 *
 * 展示用户报名表里曾保存过的字段（key/value），
 * 可编辑值、切换是否对外公开、删除。
 */

import { FC, useState } from "react";
import { Database, Pencil, Trash2, Eye, EyeOff, Sparkles } from "lucide-react";
import { Dialog, Input } from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import { UserLayout } from "@/components/layout/UserLayout";
import {
  useFieldLibrary,
  usePatchFieldLibrary,
  useDeleteFieldLibrary,
  type FieldLibraryItem,
} from "@/features/user/field-library";

const formatLabel = (item: FieldLibraryItem): string =>
  item.field_label?.trim() || item.field_key;

const UserFieldLibrary: FC = () => {
  const { data: items = [], isLoading } = useFieldLibrary();
  const patchMutation = usePatchFieldLibrary();
  const deleteMutation = useDeleteFieldLibrary();

  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const handleEdit = (item: FieldLibraryItem) => {
    let nextValue = item.field_value;
    Dialog.confirm({
      title: `修改「${formatLabel(item)}」`,
      content: (
        <div className="pt-2">
          <Input
            defaultValue={item.field_value}
            placeholder="请输入新的值"
            maxLength={500}
            onChange={(v) => (nextValue = v)}
          />
        </div>
      ),
      confirmText: "保存",
      cancelText: "取消",
      onConfirm: async () => {
        const trimmed = nextValue.trim();
        if (!trimmed || trimmed === item.field_value) return;
        try {
          const res = await patchMutation.mutateAsync({
            fieldKey: item.field_key,
            patch: { field_value: trimmed },
          });
          if (!res.success) {
            Toast.show({ icon: "fail", content: res.message || "保存失败" });
            return;
          }
          Toast.show({ icon: "success", content: "已更新" });
        } catch (err: any) {
          Toast.show({ icon: "fail", content: err?.message || "保存失败" });
        }
      },
    });
  };

  const handleTogglePublic = async (item: FieldLibraryItem) => {
    setTogglingKey(item.field_key);
    try {
      const res = await patchMutation.mutateAsync({
        fieldKey: item.field_key,
        patch: { is_public: !item.is_public },
      });
      if (!res.success) {
        Toast.show({ icon: "fail", content: res.message || "操作失败" });
        return;
      }
      Toast.show({
        content: !item.is_public ? "已设为公开" : "已设为仅自己可见",
      });
    } catch (err: any) {
      Toast.show({ icon: "fail", content: err?.message || "操作失败" });
    } finally {
      setTogglingKey(null);
    }
  };

  const handleDelete = (item: FieldLibraryItem) => {
    Dialog.confirm({
      title: "删除字段？",
      content: `「${formatLabel(item)}」删除后将不再用于报名表预填。`,
      confirmText: "删除",
      cancelText: "取消",
      onConfirm: async () => {
        try {
          const res = await deleteMutation.mutateAsync(item.field_key);
          if (!res.success) {
            Toast.show({ icon: "fail", content: res.message || "删除失败" });
            return;
          }
          Toast.show({ icon: "success", content: "已删除" });
        } catch (err: any) {
          Toast.show({ icon: "fail", content: err?.message || "删除失败" });
        }
      },
    });
  };

  return (
    <UserLayout
      showTabBar={false}
      showTopBar
      showBreadcrumb
      breadcrumbItems={[
        { label: "我的", path: "/u/profile" },
        { label: "我的信息库" },
      ]}
      bgColor="bg-gray-50 dark:bg-gray-900"
    >
      <div className="px-4 md:px-6 py-4 space-y-4 pb-20">
        {/* 顶部说明 */}
        <div className="flex items-start gap-2 px-3 py-2.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-lg text-xs text-primary-700 dark:text-primary-300">
          <Sparkles size={14} className="flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            报名活动时，系统会用这里保存的资料自动预填表单。每条信息都是仅自己可见的，可单独切换是否对外展示。
          </span>
        </div>

        {/* 列表 */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-12 text-sm">
            加载中...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 py-16 text-center">
            <Database
              size={36}
              className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
            />
            <p className="text-sm text-gray-400 mb-1">还没有保存任何字段</p>
            <p className="text-xs text-gray-400">
              下次报名活动后，可选择把这次填写的信息保存到这里
            </p>
          </div>
        ) : (
          <ul className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
            {items.map((item) => {
              const isToggling = togglingKey === item.field_key;
              return (
                <li
                  key={item.id}
                  className="p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {formatLabel(item)}
                      </span>
                      <span
                        className={`flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          item.is_public
                            ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {item.is_public ? (
                          <>
                            <Eye size={10} /> 公开
                          </>
                        ) : (
                          <>
                            <EyeOff size={10} /> 仅自己
                          </>
                        )}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 break-words">
                      {item.field_value}
                    </div>
                    {item.last_used_at && (
                      <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                        最近用于{" "}
                        {new Date(item.last_used_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* 操作区 */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleTogglePublic(item)}
                      disabled={isToggling}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      title={item.is_public ? "切换为仅自己可见" : "切换为公开"}
                    >
                      {item.is_public ? (
                        <Eye size={16} />
                      ) : (
                        <EyeOff size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="修改值"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </UserLayout>
  );
};

export default UserFieldLibrary;
