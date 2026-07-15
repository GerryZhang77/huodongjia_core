/**
 * 用户端 - 我的信息库
 *
 * 展示用户报名表里曾保存过的字段（key/value），
 * 可编辑值、切换是否对外公开、删除。
 */

import { FC, useState } from "react";
import {
  Database,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Dialog, Input } from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import { UserLayout } from "@/components/layout/UserLayout";
import {
  useFieldLibrary,
  useUpsertFieldLibrary,
  usePatchFieldLibrary,
  useDeleteFieldLibrary,
  type FieldLibraryItem,
} from "@/features/user/field-library";

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "文本" },
  { value: "phone", label: "手机号" },
  { value: "email", label: "邮箱" },
  { value: "number", label: "数字" },
  { value: "date", label: "日期" },
  { value: "select", label: "单选" },
  { value: "multiselect", label: "多选" },
  { value: "textarea", label: "长文本" },
];

const formatLabel = (item: FieldLibraryItem): string =>
  item.field_label?.trim() || item.field_key;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "加载信息库失败";
};

const UserFieldLibrary: FC = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useFieldLibrary();
  const items = data ?? [];
  const upsertMutation = useUpsertFieldLibrary();
  const patchMutation = usePatchFieldLibrary();
  const deleteMutation = useDeleteFieldLibrary();

  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const handleAdd = () => {
    let label = "";
    let value = "";
    let fieldType = "text";
    let isPublic = false;

    Dialog.confirm({
      title: "新增资料",
      content: (
        <div className="pt-2 space-y-3 text-left">
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">名称</span>
            <Input
              placeholder="例如：公司、行业、兴趣爱好"
              maxLength={120}
              onChange={(v) => (label = v)}
            />
          </label>
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">内容</span>
            <Input
              placeholder="请输入资料内容"
              maxLength={500}
              onChange={(v) => (value = v)}
            />
          </label>
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">类型</span>
            <select
              defaultValue={fieldType}
              className="w-full h-9 px-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
              onChange={(event) => (fieldType = event.target.value)}
            >
              {FIELD_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="w-4 h-4"
              onChange={(event) => (isPublic = event.target.checked)}
            />
            对外公开
          </label>
        </div>
      ),
      confirmText: "保存",
      cancelText: "取消",
      onConfirm: async () => {
        const trimmedLabel = label.trim();
        const trimmedValue = value.trim();
        if (!trimmedLabel || !trimmedValue) {
          Toast.show({ icon: "fail", content: "请填写名称和内容" });
          return;
        }

        try {
          const res = await upsertMutation.mutateAsync([
            {
              field_key: trimmedLabel,
              field_label: trimmedLabel,
              field_value: trimmedValue,
              field_type: fieldType,
              is_public: isPublic,
            },
          ]);
          if (!res.success) {
            Toast.show({ icon: "fail", content: res.message || "保存失败" });
            return;
          }
          Toast.show({ icon: "success", content: "已保存" });
        } catch (err: any) {
          Toast.show({ icon: "fail", content: err?.message || "保存失败" });
        }
      },
    });
  };

  const handleEdit = (item: FieldLibraryItem) => {
    let nextLabel = formatLabel(item);
    let nextValue = item.field_value;
    let nextPublic = item.is_public;

    Dialog.confirm({
      title: `修改「${formatLabel(item)}」`,
      content: (
        <div className="pt-2 space-y-3 text-left">
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">名称</span>
            <Input
              defaultValue={nextLabel}
              placeholder="请输入名称"
              maxLength={120}
              onChange={(v) => (nextLabel = v)}
            />
          </label>
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">内容</span>
          <Input
            defaultValue={item.field_value}
            placeholder="请输入新的值"
            maxLength={500}
            onChange={(v) => (nextValue = v)}
          />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="w-4 h-4"
              defaultChecked={nextPublic}
              onChange={(event) => (nextPublic = event.target.checked)}
            />
            对外公开
          </label>
        </div>
      ),
      confirmText: "保存",
      cancelText: "取消",
      onConfirm: async () => {
        const trimmedLabel = nextLabel.trim();
        const trimmed = nextValue.trim();
        if (!trimmedLabel || !trimmed) {
          Toast.show({ icon: "fail", content: "请填写名称和内容" });
          return;
        }
        const patch = {
          field_value: trimmed,
          field_label: trimmedLabel,
          is_public: nextPublic,
        };
        if (
          patch.field_value === item.field_value &&
          patch.field_label === formatLabel(item) &&
          patch.is_public === item.is_public
        ) {
          return;
        }

        try {
          const res = await patchMutation.mutateAsync({
            fieldKey: item.field_key,
            patch,
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              我的信息库
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              管理报名表常用资料
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={upsertMutation.isPending}
          className="inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 [&>svg]:shrink-0"
          >
            <Plus size={15} />
            新增资料
          </button>
        </div>

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
        ) : isError ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-900/40 py-12 px-4 text-center">
            <AlertCircle
              size={34}
              className="text-red-300 dark:text-red-500 mx-auto mb-3"
            />
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
              信息库加载失败
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {getErrorMessage(error)}
            </p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
            className="inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 [&>svg]:shrink-0"
            >
              <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
              重试
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 py-16 px-4 text-center">
            <Database
              size={36}
              className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
            />
            <p className="text-sm text-gray-400 mb-1">还没有保存任何字段</p>
            <p className="text-xs text-gray-400 mb-5">
              下次报名活动后，可选择把这次填写的信息保存到这里
            </p>
            <button
              onClick={handleAdd}
            className="inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white [&>svg]:shrink-0"
            >
              <Plus size={15} />
              新增资料
            </button>
          </div>
        ) : (
          <ul className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
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
                      <span className="flex-shrink-0 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-300">
                        {FIELD_TYPE_OPTIONS.find((option) => option.value === item.field_type)?.label ||
                          item.field_type}
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
