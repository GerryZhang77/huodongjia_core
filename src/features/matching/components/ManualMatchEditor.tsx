import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  LoaderCircle,
  LockKeyhole,
  Plus,
  Search,
  Trash2,
  UnlockKeyhole,
  X,
} from "lucide-react";
import { Dialog } from "antd-mobile";
import { Button } from "@/components/ui";
import { Toast } from "@/components/ui/Toast";
import {
  searchMatchCandidates,
  setParticipantMatchesLock,
  updateParticipantMatches,
  type MatchCandidate,
} from "../services/matchingApi";
import type { MatchConstraints } from "../types";

type ParticipantBrief = {
  id: string;
  name: string;
  avatar?: string;
  gender?: string;
  age?: number;
  occupation?: string;
  registrationTypeId?: string | null;
  registrationTypeName?: string;
};

const getCandidateLoadErrorMessage = (error: unknown): string => {
  const apiError = error as {
    code?: string;
    message?: string;
    response?: { data?: { message?: string } };
  };
  if (apiError.response?.data?.message) {
    return apiError.response.data.message;
  }
  if (apiError.code === "ECONNABORTED") {
    return "候选人加载超时，请重试";
  }
  return "候选人加载失败，请检查网络后重试";
};

const ManualMatchEditor: React.FC<{
  open: boolean;
  activityId: string;
  source: ParticipantBrief;
  initialCandidateIds: string[];
  participants: ParticipantBrief[];
  constraints: MatchConstraints;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}> = ({
  open,
  activityId,
  source,
  initialCandidateIds,
  participants,
  constraints,
  onClose,
  onSaved,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialCandidateIds);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [registrationTypeId, setRegistrationTypeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [candidateLoadError, setCandidateLoadError] = useState<string | null>(
    null,
  );
  const [candidateReloadKey, setCandidateReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [overrideCandidateIds, setOverrideCandidateIds] = useState<Set<string>>(new Set());
  const [overrideReason, setOverrideReason] = useState("");
  const [effectiveConstraints, setEffectiveConstraints] = useState(constraints);

  const participantMap = useMemo(
    () => new Map(participants.map((participant) => [participant.id, participant])),
    [participants],
  );
  const registrationTypes = useMemo(
    () => Array.from(
      new Map(
        participants
          .filter((participant) => participant.registrationTypeId)
          .map((participant) => [
            participant.registrationTypeId!,
            participant.registrationTypeName || "未命名报名类型",
          ]),
      ),
    ),
    [participants],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedIds(initialCandidateIds);
    setOverrideCandidateIds(new Set());
    setOverrideReason("");
    setEffectiveConstraints(constraints);
  }, [constraints, initialCandidateIds, open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setCandidateLoadError(null);
      void searchMatchCandidates(activityId, source.id, {
        q: query,
        gender,
        minAge: minAge ? Number(minAge) : undefined,
        maxAge: maxAge ? Number(maxAge) : undefined,
        registrationTypeId,
        pageSize: 100,
      }, {
        signal: controller.signal,
      })
        .then((result) => {
          if (active) {
            setCandidates(result.candidates);
            setIsLocked(result.isLocked);
            if (result.config) setEffectiveConstraints(result.config);
          }
        })
        .catch((error) => {
          if (active && !controller.signal.aborted) {
            setCandidates([]);
            setCandidateLoadError(getCandidateLoadErrorMessage(error));
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    activityId,
    candidateReloadKey,
    gender,
    maxAge,
    minAge,
    open,
    query,
    registrationTypeId,
    source.id,
  ]);

  useEffect(() => {
    if (!open || candidates.length === 0) return;
    setOverrideCandidateIds((current) => {
      const next = new Set(
        Array.from(current).filter((candidateId) => selectedIds.includes(candidateId)),
      );
      for (const candidate of candidates) {
        if (!selectedIds.includes(candidate.id)) continue;
        if (candidate.hardRulePassed) next.delete(candidate.id);
        else next.add(candidate.id);
      }
      if (
        next.size === current.size &&
        Array.from(next).every((candidateId) => current.has(candidateId))
      ) {
        return current;
      }
      return next;
    });
  }, [candidates, open, selectedIds]);

  if (!open) return null;

  const hasUnsavedChanges =
    selectedIds.length !== initialCandidateIds.length ||
    selectedIds.some((candidateId, index) => candidateId !== initialCandidateIds[index]) ||
    Boolean(overrideReason.trim());

  const requestClose = async () => {
    if (!hasUnsavedChanges) {
      onClose();
      return;
    }
    const confirmed = await Dialog.confirm({
      title: "放弃本次调整？",
      content: "尚未保存的增删和排序会丢失。",
      confirmText: "放弃调整",
      cancelText: "继续编辑",
    });
    if (confirmed) onClose();
  };

  const addCandidate = (candidate: MatchCandidate) => {
    if (selectedIds.includes(candidate.id)) return;
    if (selectedIds.length >= effectiveConstraints.maxMatches) {
      Toast.show({ icon: "fail", content: `每人最多匹配 ${effectiveConstraints.maxMatches} 人` });
      return;
    }
    if (!candidate.hardRulePassed && !effectiveConstraints.allowManualOverride) {
      Toast.show({ icon: "fail", content: candidate.hardRuleViolations.join("、") });
      return;
    }
    setSelectedIds((current) => [...current, candidate.id]);
    if (!candidate.hardRulePassed) {
      setOverrideCandidateIds((current) => new Set(current).add(candidate.id));
    }
  };

  const removeCandidate = (candidateId: string) => {
    setSelectedIds((current) => current.filter((id) => id !== candidateId));
    setOverrideCandidateIds((current) => {
      const next = new Set(current);
      next.delete(candidateId);
      return next;
    });
  };

  const moveCandidate = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedIds.length) return;
    setSelectedIds((current) => {
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const save = async () => {
    if (isLocked) {
      Toast.show({ icon: "fail", content: "请先解锁这份名单再调整" });
      return;
    }
    if (overrideCandidateIds.size > 0 && !overrideReason.trim()) {
      Toast.show({ icon: "fail", content: "请填写违反硬规则的人工调整原因" });
      return;
    }
    setSaving(true);
    try {
      const result = await updateParticipantMatches(
        activityId,
        source.id,
        selectedIds,
        overrideCandidateIds.size > 0
          ? { allowOverride: true, reason: overrideReason.trim() }
          : undefined,
      );
      if (result.warning) Toast.show({ content: result.warning });
      else Toast.show({ icon: "success", content: "匹配结果已调整" });
      await onSaved();
      onClose();
    } catch (error: unknown) {
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "保存失败",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleLock = async () => {
    if (!isLocked && hasUnsavedChanges) {
      Toast.show({ icon: "fail", content: "请先保存调整，再锁定名单" });
      return;
    }
    setLocking(true);
    try {
      const result = await setParticipantMatchesLock(
        activityId,
        source.id,
        !isLocked,
      );
      setIsLocked(result.isLocked);
      Toast.show({
        icon: "success",
        content: result.isLocked ? "该名单已锁定" : "该名单已解锁",
      });
      await onSaved();
    } catch (error) {
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "锁定状态更新失败",
      });
    } finally {
      setLocking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/40" onClick={() => void requestClose()}>
      <div
        className="flex h-full w-full max-w-2xl flex-col bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="font-semibold text-gray-900">调整 {source.name} 的匹配结果</h3>
            <p className="mt-1 text-xs text-gray-500">
              当前 {selectedIds.length}/{effectiveConstraints.maxMatches} 人；顺序即用户侧展示顺序。
            </p>
            <p className="mt-1 text-xs text-gray-400">这里只调整该用户的名单，不会自动修改对方的匹配名单。</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={locking}
              onClick={() => void toggleLock()}
              className={`inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-50 ${
                isLocked
                  ? "bg-amber-50 text-amber-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {locking ? (
                <LoaderCircle size={14} className="shrink-0 animate-spin" />
              ) : isLocked ? (
                <LockKeyhole size={14} className="shrink-0" />
              ) : (
                <UnlockKeyhole size={14} className="shrink-0" />
              )}
              {isLocked ? "解锁名单" : "锁定名单"}
            </button>
            <button type="button" aria-label="关闭调整面板" onClick={() => void requestClose()} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
        </header>

        {isLocked && (
          <div className="border-b border-amber-100 bg-amber-50 px-5 py-2.5 text-xs text-amber-700">
            当前名单已锁定，避免后续人工误改；解锁后才能增删、替换或排序。
          </div>
        )}

        <div className={`flex-1 space-y-5 overflow-y-auto p-5 ${isLocked ? "pointer-events-none opacity-60" : ""}`}>
          <section>
            <h4 className="mb-2 text-sm font-semibold text-gray-800">已选匹配对象</h4>
            <div className="space-y-2">
              {selectedIds.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">暂未选择</div>
              )}
              {selectedIds.map((candidateId, index) => {
                const participant = participantMap.get(candidateId);
                return (
                  <div key={candidateId} className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900">{participant?.name || candidateId.slice(0, 8)}</div>
                      <div className="truncate text-xs text-gray-500">{[participant?.registrationTypeName, participant?.occupation].filter(Boolean).join(" · ")}</div>
                    </div>
                    <button type="button" disabled={index === 0} onClick={() => moveCandidate(index, -1)} className="p-1.5 text-gray-400 disabled:opacity-30"><ArrowUp size={15} /></button>
                    <button type="button" disabled={index === selectedIds.length - 1} onClick={() => moveCandidate(index, 1)} className="p-1.5 text-gray-400 disabled:opacity-30"><ArrowDown size={15} /></button>
                    <button type="button" onClick={() => removeCandidate(candidateId)} className="p-1.5 text-red-500"><Trash2 size={15} /></button>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold text-gray-800">从报名人员中添加</h4>
            <div className="grid gap-2 rounded-xl bg-gray-50 p-3 sm:grid-cols-2">
              <label className="relative sm:col-span-2">
                <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索姓名、账号或手机号" className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm" />
              </label>
              <select value={registrationTypeId} onChange={(event) => setRegistrationTypeId(event.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
                <option value="">全部报名类型</option>
                {registrationTypes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
              <select value={gender} onChange={(event) => setGender(event.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
                <option value="">全部性别</option><option value="male">男</option><option value="female">女</option>
              </select>
              <input type="number" min={0} max={120} value={minAge} onChange={(event) => setMinAge(event.target.value)} placeholder="最小年龄" className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" />
              <input type="number" min={0} max={120} value={maxAge} onChange={(event) => setMaxAge(event.target.value)} placeholder="最大年龄" className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" />
            </div>

            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {loading ? (
                <div aria-live="polite" className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500"><LoaderCircle size={17} className="animate-spin" />搜索中</div>
              ) : candidateLoadError ? (
                <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center">
                  <p className="text-sm text-red-600">{candidateLoadError}</p>
                  <button
                    type="button"
                    onClick={() => setCandidateReloadKey((key) => key + 1)}
                    className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    重新加载
                  </button>
                </div>
              ) : candidates.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">没有符合筛选条件的报名人员</div>
              ) : candidates.map((candidate) => {
                const selected = selectedIds.includes(candidate.id);
                const disabled = selected || (!candidate.hardRulePassed && !effectiveConstraints.allowManualOverride);
                return (
                  <div key={candidate.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${candidate.hardRulePassed ? "border-gray-200" : "border-orange-200 bg-orange-50"}`}>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                      <div className="text-xs text-gray-500">{[candidate.registrationTypeName, candidate.age != null ? `${candidate.age}岁` : "", candidate.occupation].filter(Boolean).join(" · ")}</div>
                      {!candidate.hardRulePassed && <div className="mt-1 text-xs text-orange-600">{candidate.hardRuleViolations.join("；")}{effectiveConstraints.allowManualOverride ? "（可人工例外）" : ""}</div>}
                    </div>
                    <button type="button" disabled={disabled} onClick={() => addCandidate(candidate)} className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap rounded-lg border border-primary-200 px-2.5 py-1.5 text-xs text-primary-600 disabled:border-gray-200 disabled:text-gray-400">
                      <Plus size={13} className="shrink-0" />{selected ? "已添加" : "添加"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {overrideCandidateIds.size > 0 && (
            <label className="block rounded-xl border border-orange-200 bg-orange-50 p-3">
              <span className="text-sm font-medium text-orange-800">人工例外原因 *</span>
              <textarea value={overrideReason} onChange={(event) => setOverrideReason(event.target.value)} rows={3} placeholder="说明为何需要覆盖硬规则，便于后续审计" className="mt-2 w-full rounded-lg border border-orange-200 bg-white p-3 text-sm" />
            </label>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <Button variant="outline" onClick={() => void requestClose()}>取消</Button>
          <Button disabled={isLocked} onClick={() => void save()} loading={saving}>
            {isLocked ? "名单已锁定" : "保存调整"}
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ManualMatchEditor;
