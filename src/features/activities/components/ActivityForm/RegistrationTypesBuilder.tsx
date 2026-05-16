import React, { useMemo, useState } from "react";
import { FileText, Plus, Save, Search, Trash2, UserPlus, Users } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { Switch } from "@/components/ui/Switch";
import { api } from "@/services/api";
import type {
  ActivityRegistrationType,
  RegistrationTypeMember,
} from "../../types";
import { RegistrationFormBuilder } from "../RegistrationFormBuilder";
import { createDefaultFormSchema, createDefaultRegistrationTypes } from "./registrationTypeDefaults";

interface SearchUserResponse {
  success: boolean;
  data?: {
    users: RegistrationTypeMember[];
  };
}

interface RegistrationTypesBuilderProps {
  value?: ActivityRegistrationType[];
  onChange?: (types: ActivityRegistrationType[]) => void;
  onImportTemplate?: (typeIndex: number) => void;
  onSaveTemplate?: (typeIndex: number) => void;
}

function normalizeTypes(types?: ActivityRegistrationType[]): ActivityRegistrationType[] {
  if (!types || types.length === 0) return createDefaultRegistrationTypes();
  const defaultIndex = types.findIndex((item) => item.isDefault);
  return types.map((item, index) => ({
    ...item,
    formSchema: item.formSchema?.length ? item.formSchema : createDefaultFormSchema(),
    eligibilityMode: item.isDefault ? "public" : item.eligibilityMode || "allowlist",
    isDefault: defaultIndex >= 0 ? index === defaultIndex : index === 0,
    matchEnabled: item.matchEnabled !== false,
    sortOrder: item.sortOrder ?? index,
    members: item.members || [],
  }));
}

export const RegistrationTypesBuilder: React.FC<RegistrationTypesBuilderProps> = ({
  value,
  onChange,
  onImportTemplate,
  onSaveTemplate,
}) => {
  const registrationTypes = useMemo(() => normalizeTypes(value), [value]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RegistrationTypeMember[]>([]);

  const activeSafeIndex = Math.min(activeIndex, registrationTypes.length - 1);
  const activeType = registrationTypes[activeSafeIndex];

  const emit = (next: ActivityRegistrationType[]) => {
    const normalized = normalizeTypes(next).map((item, index) => ({
      ...item,
      sortOrder: index,
    }));
    onChange?.(normalized);
  };

  const updateActive = (patch: Partial<ActivityRegistrationType>) => {
    const next = registrationTypes.map((item, index) =>
      index === activeSafeIndex ? { ...item, ...patch } : item,
    );
    emit(next);
  };

  const addType = () => {
    emit([
      ...registrationTypes,
      {
        name: `报名类型${registrationTypes.length + 1}`,
        formSchema: createDefaultFormSchema(),
        eligibilityMode: "allowlist",
        isDefault: false,
        matchEnabled: true,
        sortOrder: registrationTypes.length,
        members: [],
      },
    ]);
    setActiveIndex(registrationTypes.length);
  };

  const removeActiveType = () => {
    if (activeType.isDefault) return;
    const next = registrationTypes.filter((_, index) => index !== activeSafeIndex);
    emit(next);
    setActiveIndex(Math.max(0, activeSafeIndex - 1));
  };

  const searchUsers = async () => {
    const q = keyword.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await api.get<SearchUserResponse>("/api/merchant/platform-users/search", {
        params: { keyword: q },
      });
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
      <div className="flex gap-2 overflow-x-auto pb-1">
        {registrationTypes.map((type, index) => (
          <button
            key={type.id || `${type.name}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm border transition-colors ${
              index === activeIndex
                ? "border-primary-400 bg-primary-50 text-primary-600"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {type.name}
          </button>
        ))}
        <button
          type="button"
          onClick={addType}
          className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm border border-dashed border-gray-300 text-gray-500 hover:text-primary-500 hover:border-primary-300"
        >
          <Plus size={14} />
          添加类型
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">报名类型名称</label>
            <input
              value={activeType.name}
              disabled={activeType.isDefault}
              onChange={(e) => updateActive({ name: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:border-primary-400"
            />
          </div>
          {!activeType.isDefault && (
            <button
              type="button"
              onClick={removeActiveType}
              className="mt-5 w-10 h-10 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center"
              title="删除报名类型"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
          <div>
            <div className="text-sm font-medium text-gray-800">参与智能匹配</div>
            <div className="text-xs text-gray-400 mt-0.5">
              关闭后，该报名类型用户不进入匹配计算
            </div>
          </div>
          <Switch
            checked={activeType.matchEnabled}
            onChange={(checked) => updateActive({ matchEnabled: checked })}
            size="small"
          />
        </div>

        {!activeType.isDefault && (
          <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <Users size={15} />
              可报名用户名单
            </div>
            <div className="flex gap-2">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    searchUsers();
                  }
                }}
                placeholder="输入用户ID、手机号或账号搜索"
                className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400"
              />
              <button
                type="button"
                onClick={searchUsers}
                disabled={searching}
                className="h-9 px-3 rounded-lg bg-primary-50 text-primary-600 text-sm inline-flex items-center gap-1 disabled:opacity-50"
              >
                <Search size={14} />
                搜索
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-1.5">
                {searchResults.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-50"
                  >
                    <div className="min-w-0">
                      <div className="text-sm text-gray-800 truncate">
                        {user.name || user.account || user.phone || user.userId}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {user.account || "-"} · {user.phone || user.userId}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addMember(user)}
                      className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-primary-600"
                    >
                      <UserPlus size={13} />
                      添加
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeType.members.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeType.members.map((member) => (
                  <span
                    key={member.userId}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-50 text-primary-600 text-xs"
                  >
                    {member.name || member.account || member.phone || member.userId}
                    <button
                      type="button"
                      onClick={() => removeMember(member.userId)}
                      className="text-primary-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">名单为空时，没有用户会命中该报名类型。</p>
            )}
          </div>
        )}

        <div>
          <div className="text-sm font-medium text-gray-800 mb-2">
            {activeType.name}问卷
          </div>
          {(onImportTemplate || onSaveTemplate) && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {onImportTemplate && (
                <button
                  type="button"
                  onClick={() => onImportTemplate(activeSafeIndex)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-gray-100 text-xs text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors"
                  title="从已保存的报名问卷模板中导入"
                >
                  <FileText size={13} />
                  从模板导入
                </button>
              )}
              {onSaveTemplate && (
                <button
                  type="button"
                  onClick={() => onSaveTemplate(activeSafeIndex)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-gray-100 text-xs text-gray-600 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                  title="把当前问卷保存为可复用模板"
                >
                  <Save size={13} />
                  保存为模板
                </button>
              )}
            </div>
          )}
          <RegistrationFormBuilder
            value={activeType.formSchema}
            onChange={(formSchema) => updateActive({ formSchema })}
          />
        </div>
      </div>
    </div>
  );
};

export default RegistrationTypesBuilder;
