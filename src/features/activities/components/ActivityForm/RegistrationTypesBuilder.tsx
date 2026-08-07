import React, { useMemo, useState } from "react";
import { Dialog } from "antd-mobile";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  FileText,
  Globe2,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { Switch } from "@/components/ui/Switch";
import { api } from "@/services/api";
import type {
  ActivityRegistrationType,
  RegistrationTypeMember,
} from "../../types";
import { RegistrationFormBuilder } from "../RegistrationFormBuilder";
import {
  createDefaultFormSchema,
  createDefaultRegistrationTypes,
} from "./registrationTypeDefaults";

interface SearchUserResponse {
  success: boolean;
  data?: { users: RegistrationTypeMember[] };
}

interface RegistrationTypesBuilderProps {
  value?: ActivityRegistrationType[];
  onChange?: (types: ActivityRegistrationType[]) => void;
  onImportTemplate?: (typeIndex: number) => void;
  onSaveTemplate?: (typeIndex: number) => void;
}

function normalizeTypes(
  types?: ActivityRegistrationType[],
): ActivityRegistrationType[] {
  if (!types || types.length === 0) return createDefaultRegistrationTypes();
  const defaultIndex = types.findIndex((item) => item.isDefault);
  return types.map((item, index) => ({
    ...item,
    formSchema: item.formSchema?.length
      ? item.formSchema
      : createDefaultFormSchema(),
    // 空的限制名单仍然是限制名单，不能根据 members 数量反推为公开报名。
    eligibilityMode:
      item.eligibilityMode || (item.members?.length ? "allowlist" : "public"),
    isDefault: defaultIndex >= 0 ? index === defaultIndex : index === 0,
    matchEnabled: item.matchEnabled !== false,
    sortOrder: item.sortOrder ?? index,
    quotaFieldKey: item.quotaFieldKey || null,
    quotaRules: item.quotaRules || [],
    members: item.members || [],
  }));
}

const cloneRegistrationType = (
  source: ActivityRegistrationType,
): ActivityRegistrationType => ({
  ...source,
  id: undefined,
  name: `${source.name || "未命名报名类型"} 副本`,
  isDefault: false,
  formSchema: source.formSchema.map((field) => ({
    ...field,
    options: field.options ? [...field.options] : undefined,
  })),
  members: source.members.map((member) => ({ ...member })),
  quotaRules: (source.quotaRules || []).map((rule) => ({ ...rule })),
});

export const RegistrationTypesBuilder: React.FC<
  RegistrationTypesBuilderProps
> = ({ value, onChange, onImportTemplate, onSaveTemplate }) => {
  const registrationTypes = useMemo(() => normalizeTypes(value), [value]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RegistrationTypeMember[]>(
    [],
  );

  const activeSafeIndex = Math.min(activeIndex, registrationTypes.length - 1);
  const activeType = registrationTypes[activeSafeIndex];

  const emit = (next: ActivityRegistrationType[]) => {
    onChange?.(
      normalizeTypes(next).map((item, index) => ({
        ...item,
        sortOrder: index,
      })),
    );
  };

  const updateActive = (patch: Partial<ActivityRegistrationType>) => {
    emit(
      registrationTypes.map((item, index) =>
        index === activeSafeIndex ? { ...item, ...patch } : item,
      ),
    );
  };

  const addType = () => {
    emit([
      ...registrationTypes,
      {
        name: "",
        description: "",
        formSchema: createDefaultFormSchema(),
        eligibilityMode: "public",
        isDefault: false,
        matchEnabled: true,
        sortOrder: registrationTypes.length,
        quotaFieldKey: null,
        quotaRules: [],
        members: [],
      },
    ]);
    setActiveIndex(registrationTypes.length);
  };

  const copyActiveType = () => {
    const next = [...registrationTypes];
    next.splice(activeSafeIndex + 1, 0, cloneRegistrationType(activeType));
    emit(next);
    setActiveIndex(activeSafeIndex + 1);
    Toast.show({ icon: "success", content: "报名表单已复制" });
  };

  const moveActiveType = (direction: -1 | 1) => {
    const targetIndex = activeSafeIndex + direction;
    if (targetIndex < 0 || targetIndex >= registrationTypes.length) return;
    const next = [...registrationTypes];
    [next[activeSafeIndex], next[targetIndex]] = [
      next[targetIndex],
      next[activeSafeIndex],
    ];
    emit(next);
    setActiveIndex(targetIndex);
  };

  const removeActiveType = async () => {
    if (activeType.isDefault) return;
    const confirmed = await Dialog.confirm({
      title: `删除“${activeType.name || "未命名报名类型"}”？`,
      content: "该报名类型的资格设置和问卷字段会一起删除，此操作尚未提交前可取消编辑页面。",
      confirmText: "删除",
      cancelText: "保留",
    });
    if (!confirmed) return;
    emit(
      registrationTypes.filter((_, index) => index !== activeSafeIndex),
    );
    setActiveIndex(Math.max(0, activeSafeIndex - 1));
  };

  const searchUsers = async () => {
    const q = keyword.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await api.get<SearchUserResponse>(
        "/api/merchant/platform-users/search",
        { params: { keyword: q } },
      );
      setSearchResults(res.data?.users || []);
      if ((res.data?.users || []).length === 0) {
        Toast.show({ content: "未找到用户" });
      }
    } catch (error) {
      console.error("搜索用户失败:", error);
      Toast.show({ content: "搜索用户失败" });
    } finally {
      setSearching(false);
    }
  };

  const addMember = (member: RegistrationTypeMember) => {
    if (activeType.members.some((item) => item.userId === member.userId)) {
      Toast.show({ content: "该用户已在名单中" });
      return;
    }
    updateActive({ members: [...activeType.members, member] });
  };

  const removeMember = (userId: string) => {
    updateActive({
      members: activeType.members.filter((member) => member.userId !== userId),
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">报名表单与报名类型</p>
            <p className="mt-0.5 text-xs text-gray-500">
              每个类型拥有独立资格、匹配设置和问卷；一个活动可配置多个类型。
            </p>
          </div>
          <button
            type="button"
            onClick={addType}
            className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg border border-dashed border-primary-300 bg-white px-3 py-2 text-sm text-primary-600 [&>svg]:shrink-0"
          >
            <Plus size={14} /> 新增表单
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {registrationTypes.map((type, index) => (
            <button
              key={type.id || `${type.name}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`min-w-40 shrink-0 rounded-lg border px-3 py-2 text-left transition-colors ${
                index === activeSafeIndex
                  ? "border-primary-400 bg-white shadow-sm"
                  : "border-transparent bg-gray-100 hover:border-gray-200"
              }`}
            >
              <span className="block truncate text-sm font-medium text-gray-900">
                {index + 1}. {type.name || "未命名报名类型"}
              </span>
              <span className="mt-1 block truncate text-xs text-gray-500">
                {type.eligibilityMode === "allowlist" ? "限指定用户" : "公开报名"}
                {type.matchEnabled ? " · 参与匹配" : " · 不参与匹配"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <header className="border-b border-gray-100 bg-white p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-400">
                  表单 {activeSafeIndex + 1}/{registrationTypes.length}
                </span>
                {activeType.isDefault && (
                  <span className="whitespace-nowrap rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-600">默认</span>
                )}
                <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {activeType.eligibilityMode === "allowlist" ? "限制报名" : "公开报名"}
                </span>
                <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${activeType.matchEnabled ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                  {activeType.matchEnabled ? "参与匹配" : "不参与匹配"}
                </span>
              </div>
              <label className="block">
                <span className="sr-only">报名类型名称</span>
                <input
                  value={activeType.name}
                  onChange={(event) => updateActive({ name: event.target.value })}
                  placeholder="报名类型名称，例如：普通参与者、嘉宾、媒体"
                  className="h-11 w-full max-w-xl rounded-lg border border-gray-200 px-3 text-base font-semibold text-gray-900 focus:border-primary-400 focus:outline-none"
                />
              </label>
              <input
                value={activeType.description || ""}
                onChange={(event) => updateActive({ description: event.target.value })}
                placeholder="选填：向报名者说明该类型适用对象"
                className="mt-2 h-9 w-full max-w-xl rounded-lg border border-transparent bg-gray-50 px-3 text-sm text-gray-600 focus:border-primary-300 focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2" aria-label="当前报名表单操作">
              <button type="button" disabled={activeSafeIndex === 0} onClick={() => moveActiveType(-1)} className="inline-flex h-9 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg border border-gray-200 px-2.5 text-xs text-gray-600 disabled:opacity-35 [&>svg]:shrink-0" title="向前排序">
                <ArrowLeft size={14} /> 前移
              </button>
              <button type="button" disabled={activeSafeIndex === registrationTypes.length - 1} onClick={() => moveActiveType(1)} className="inline-flex h-9 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg border border-gray-200 px-2.5 text-xs text-gray-600 disabled:opacity-35 [&>svg]:shrink-0" title="向后排序">
                后移 <ArrowRight size={14} />
              </button>
              <button type="button" onClick={copyActiveType} className="inline-flex h-9 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg border border-gray-200 px-2.5 text-xs text-gray-600 [&>svg]:shrink-0">
                <Copy size={14} /> 复制
              </button>
              {!activeType.isDefault && (
                <button type="button" onClick={() => void removeActiveType()} className="inline-flex h-9 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg border border-red-100 px-2.5 text-xs text-red-600 [&>svg]:shrink-0">
                  <Trash2 size={14} /> 删除
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="space-y-6 p-4 md:p-5">
          <section aria-labelledby="eligibility-heading">
            <div className="mb-3">
              <h3 id="eligibility-heading" className="text-sm font-semibold text-gray-900">1. 报名资格</h3>
              <p className="mt-1 text-xs text-gray-500">决定谁能使用这个报名入口，不影响其他报名类型。</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => updateActive({ eligibilityMode: "public" })}
                className={`rounded-xl border p-4 text-left ${activeType.eligibilityMode === "public" ? "border-primary-400 bg-primary-50" : "border-gray-200"}`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-gray-900"><Globe2 size={16} />公开报名</span>
                <span className="mt-1 block text-xs text-gray-500">获得此入口的用户都可以提交报名。</span>
              </button>
              <button
                type="button"
                onClick={() => updateActive({ eligibilityMode: "allowlist" })}
                className={`rounded-xl border p-4 text-left ${activeType.eligibilityMode === "allowlist" ? "border-primary-400 bg-primary-50" : "border-gray-200"}`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-gray-900"><ShieldCheck size={16} />仅指定用户</span>
                <span className="mt-1 block text-xs text-gray-500">仅名单内的平台账号可使用此报名入口。</span>
              </button>
            </div>

            {activeType.eligibilityMode === "allowlist" && (
              <div className="mt-3 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800"><Users size={15} />允许报名的用户</div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void searchUsers();
                      }
                    }}
                    placeholder="输入用户 ID、手机号或账号搜索"
                    className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-primary-400 focus:outline-none"
                  />
                  <button type="button" onClick={() => void searchUsers()} disabled={searching} className="inline-flex h-10 flex-nowrap items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-primary-50 px-4 text-sm text-primary-600 disabled:opacity-50 [&>svg]:shrink-0">
                    <Search size={14} />{searching ? "搜索中" : "搜索"}
                  </button>
                </div>
                {searchResults.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {searchResults.map((user) => (
                      <div key={user.userId} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm text-gray-800">{user.name || user.account || user.phone || user.userId}</div>
                          <div className="truncate text-xs text-gray-400">{user.account || "-"} · {user.phone || user.userId}</div>
                        </div>
                        <button type="button" onClick={() => addMember(user)} className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap text-xs text-primary-600 [&>svg]:shrink-0"><UserPlus size={13} />添加</button>
                      </div>
                    ))}
                  </div>
                )}
                {activeType.members.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeType.members.map((member) => (
                      <span key={member.userId} className="inline-flex max-w-full flex-nowrap items-center gap-1 whitespace-nowrap rounded-full bg-primary-50 px-2.5 py-1 text-xs text-primary-600">
                        {member.name || member.account || member.phone || member.userId}
                        <button type="button" aria-label={`移除 ${member.name || member.userId}`} onClick={() => removeMember(member.userId)} className="text-primary-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-medium text-amber-600">名单为空时，没有用户能通过这个限制报名入口。</p>
                )}
              </div>
            )}
          </section>

          <section aria-labelledby="matching-heading" className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
              <div>
                <h3 id="matching-heading" className="text-sm font-semibold text-gray-900">2. 匹配资格</h3>
                <p className="mt-1 text-xs text-gray-500">开启后，此类型中审核通过的用户才会进入智能匹配候选池。</p>
              </div>
              <Switch checked={activeType.matchEnabled} onChange={(checked) => updateActive({ matchEnabled: checked })} size="small" />
            </div>
          </section>

          <section aria-labelledby="questionnaire-heading" className="border-t border-gray-100 pt-5">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 id="questionnaire-heading" className="text-sm font-semibold text-gray-900">3. 报名问卷</h3>
                <p className="mt-1 text-xs text-gray-500">以下字段只属于“{activeType.name || "未命名报名类型"}”。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {onImportTemplate && (
                  <button type="button" onClick={() => onImportTemplate(activeSafeIndex)} className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-primary-600 [&>svg]:shrink-0"><FileText size={13} />从模板导入</button>
                )}
                {onSaveTemplate && (
                  <button type="button" onClick={() => onSaveTemplate(activeSafeIndex)} className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 [&>svg]:shrink-0"><Save size={13} />保存为模板</button>
                )}
              </div>
            </div>
            <RegistrationFormBuilder
              value={activeType.formSchema}
              quotaFieldKey={activeType.quotaFieldKey}
              quotaRules={activeType.quotaRules}
              onChange={(formSchema) => updateActive({ formSchema })}
              onQuotaChange={(quotaFieldKey, quotaRules, formSchema) =>
                updateActive({
                  quotaFieldKey,
                  quotaRules,
                  ...(formSchema ? { formSchema } : {}),
                })
              }
            />
          </section>
        </div>
      </section>
    </div>
  );
};

export default RegistrationTypesBuilder;
