import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Columns3,
  Download,
  Info,
  Loader2,
  Search,
  Table2,
  Trash2,
  Users,
} from 'lucide-react';
import MerchantLayout from '@/components/layout/MerchantLayout';
import { Button } from '@/components/ui';
import { Toast } from '@/components/ui/Toast';
import { getActivityById } from '@/features/activities/services/api';
import {
  getMatchGroups,
  getParticipants,
} from '@/features/matching/services/matchingApi';
import {
  downloadMatchExport,
  getMatchExportFieldGroups,
  previewMatchExport,
  type MatchExportColumn,
  type MatchExportPreview,
  type MatchExportRelation,
  type MatchExportSystemField,
} from '@/features/matching/services/matchExportApi';
import type { ParticipantMatchResult } from '@/features/matching/types';
import {
  buildMatchExportFieldOptions,
  createDefaultMatchExportColumns,
  createFieldExportColumn,
  type MatchExportFieldOption,
} from '@/features/matching/utils/matchExportModel';
import {
  merchantCacheTimes,
  merchantQueryKeys,
} from '@/features/merchant/queryKeys';

type ExportStep = 1 | 2 | 3;
type RelationPreset = 'all' | 'top1' | 'top3' | 'top5' | 'custom';
type FieldSide = 'source' | 'target';

const relationKey = (sourceUserId: string, targetUserId: string) =>
  `${sourceUserId}::${targetUserId}`;

const SYSTEM_FIELDS: Array<{
  field: MatchExportSystemField;
  label: string;
  description: string;
}> = [
  { field: 'rank', label: '匹配顺序', description: '该对象在发起人的推荐名单中排第几位' },
  { field: 'score', label: '匹配分', description: '系统计算的匹配度百分比' },
  { field: 'reciprocal', label: '双方互荐', description: '两人是否都进入了对方的推荐名单' },
];

const STEP_META: Array<{ step: ExportStep; title: string; subtitle: string; icon: React.ElementType }> = [
  { step: 1, title: '选择匹配关系', subtitle: '确定要导出的发起人与匹配对象', icon: Users },
  { step: 2, title: '设置 Excel 表头', subtitle: '选择字段并调整最终列名和顺序', icon: Columns3 },
  { step: 3, title: '预览并导出', subtitle: '确认表格内容与实际 Excel 一致', icon: Table2 },
];

const getErrorMessage = async (error: any, fallback: string): Promise<{ message: string; code?: string }> => {
  let data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      data = JSON.parse(await data.text());
    } catch {
      data = null;
    }
  }
  return {
    message: data?.message || error?.message || fallback,
    code: data?.code,
  };
};

const MatchResultExportPage: React.FC = () => {
  const { id: activityId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<ExportStep>(1);
  const [relationPreset, setRelationPreset] = useState<RelationPreset>('all');
  const [selectedRelations, setSelectedRelations] = useState<Set<string>>(new Set());
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [sourceSearch, setSourceSearch] = useState('');
  const [registrationTypeFilter, setRegistrationTypeFilter] = useState('');
  const [fieldSide, setFieldSide] = useState<FieldSide>('source');
  const [fieldSearch, setFieldSearch] = useState('');
  const [columns, setColumns] = useState<MatchExportColumn[]>([]);
  const [preview, setPreview] = useState<MatchExportPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [initializedRun, setInitializedRun] = useState('');

  const activityQuery = useQuery({
    queryKey: merchantQueryKeys.activity(activityId),
    queryFn: () => getActivityById(activityId),
    enabled: Boolean(activityId),
    staleTime: merchantCacheTimes.activityStale,
  });
  const participantsQuery = useQuery({
    queryKey: merchantQueryKeys.matchingParticipants(activityId),
    queryFn: () => getParticipants(activityId),
    enabled: Boolean(activityId),
    staleTime: merchantCacheTimes.matchingParticipantsStale,
  });
  const resultsQuery = useQuery({
    queryKey: merchantQueryKeys.matchingResults(activityId),
    queryFn: () => getMatchGroups(activityId),
    enabled: Boolean(activityId),
    staleTime: merchantCacheTimes.matchingResultStale,
  });
  const exportFieldsQuery = useQuery({
    queryKey: ['merchant', 'match-export-fields', activityId],
    queryFn: () => getMatchExportFieldGroups(activityId),
    enabled: Boolean(activityId),
    staleTime: merchantCacheTimes.activityStale,
  });

  const matchResults = resultsQuery.data?.results || [];
  const participants = participantsQuery.data || [];
  const participantMap = useMemo(
    () => new Map(participants.map((participant) => [participant.id, participant])),
    [participants],
  );
  const schemaGroups = exportFieldsQuery.data || [];
  const fieldOptions = useMemo(() => buildMatchExportFieldOptions(schemaGroups), [schemaGroups]);
  const allRelationKeys = useMemo(() => matchResults.flatMap((result) =>
    result.bestMatchUserIds.map((targetId) => relationKey(result.userId, targetId))), [matchResults]);
  const currentRunKey = resultsQuery.data?.matchStatusId
    ? `${resultsQuery.data.matchStatusId}:${resultsQuery.data.revision || 1}`
    : '';

  useEffect(() => {
    if (!currentRunKey || activityQuery.isPending || exportFieldsQuery.isPending || initializedRun === currentRunKey) return;
    setSelectedRelations(new Set(allRelationKeys));
    setSelectedSourceId(matchResults[0]?.userId || '');
    setColumns(createDefaultMatchExportColumns(fieldOptions));
    setRelationPreset('all');
    setStep(1);
    setPreview(null);
    setInitializedRun(currentRunKey);
  }, [activityQuery.isPending, allRelationKeys, currentRunKey, exportFieldsQuery.isPending, fieldOptions, initializedRun, matchResults]);

  const orderedRelations = useMemo<MatchExportRelation[]>(() => matchResults.flatMap((result) =>
    result.bestMatchUserIds.flatMap((targetUserId) =>
      selectedRelations.has(relationKey(result.userId, targetUserId))
        ? [{ sourceUserId: result.userId, targetUserId }]
        : [])), [matchResults, selectedRelations]);

  const sourceRows = useMemo(() => matchResults.filter((result) => {
    const participant = participantMap.get(result.userId);
    const keyword = sourceSearch.trim().toLocaleLowerCase('zh-CN');
    if (registrationTypeFilter && String(participant?.registrationTypeId || '') !== registrationTypeFilter) {
      return false;
    }
    if (!keyword) return true;
    return [participant?.name, participant?.phone, participant?.registrationTypeName]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('zh-CN')
      .includes(keyword);
  }), [matchResults, participantMap, registrationTypeFilter, sourceSearch]);

  const activeResult = matchResults.find((result) => result.userId === selectedSourceId)
    || sourceRows[0]
    || matchResults[0];
  const selectedSourceCount = useMemo(() => matchResults.filter((result) =>
    result.bestMatchUserIds.some((targetId) => selectedRelations.has(relationKey(result.userId, targetId)))).length,
  [matchResults, selectedRelations]);

  const registrationTypes = useMemo(() => Array.from(new Map(participants
    .filter((participant) => participant.registrationTypeId)
    .map((participant) => [String(participant.registrationTypeId), participant.registrationTypeName || '未命名报名类型']))),
  [participants]);

  const invalidatePreview = () => setPreview(null);
  const replaceSelectedRelations = (next: Set<string>, preset: RelationPreset) => {
    setSelectedRelations(next);
    setRelationPreset(preset);
    invalidatePreview();
  };

  const applyTopN = (count: number | null) => {
    const next = new Set(matchResults.flatMap((result) =>
      result.bestMatchUserIds
        .slice(0, count ?? result.bestMatchUserIds.length)
        .map((targetId) => relationKey(result.userId, targetId))));
    const preset: RelationPreset = count === 1 ? 'top1' : count === 3 ? 'top3' : count === 5 ? 'top5' : 'all';
    replaceSelectedRelations(next, preset);
  };

  const toggleSource = (result: ParticipantMatchResult) => {
    const keys = result.bestMatchUserIds.map((targetId) => relationKey(result.userId, targetId));
    const allSelected = keys.length > 0 && keys.every((key) => selectedRelations.has(key));
    const next = new Set(selectedRelations);
    keys.forEach((key) => allSelected ? next.delete(key) : next.add(key));
    replaceSelectedRelations(next, 'custom');
  };

  const toggleTarget = (sourceUserId: string, targetUserId: string) => {
    const key = relationKey(sourceUserId, targetUserId);
    const next = new Set(selectedRelations);
    if (next.has(key)) next.delete(key); else next.add(key);
    replaceSelectedRelations(next, 'custom');
  };

  const toggleFilteredSources = () => {
    const keys = sourceRows.flatMap((result) =>
      result.bestMatchUserIds.map((targetId) => relationKey(result.userId, targetId)));
    const allSelected = keys.length > 0 && keys.every((key) => selectedRelations.has(key));
    const next = new Set(selectedRelations);
    keys.forEach((key) => allSelected ? next.delete(key) : next.add(key));
    replaceSelectedRelations(next, 'custom');
  };

  const insertColumn = (column: MatchExportColumn) => {
    setColumns((current) => {
      if (current.some((item) => item.id === column.id)) return current;
      if (column.side === 'source') {
        const firstNonSource = current.findIndex((item) => item.side !== 'source');
        const index = firstNonSource < 0 ? current.length : firstNonSource;
        return [...current.slice(0, index), column, ...current.slice(index)];
      }
      if (column.side === 'system') {
        const firstTarget = current.findIndex((item) => item.side === 'target');
        const index = firstTarget < 0 ? current.length : firstTarget;
        return [...current.slice(0, index), column, ...current.slice(index)];
      }
      return [...current, column];
    });
    invalidatePreview();
  };

  const toggleField = (side: FieldSide, option: MatchExportFieldOption) => {
    const id = `${side}:${option.id}`;
    if (columns.some((column) => column.id === id)) {
      setColumns((current) => current.filter((column) => column.id !== id));
      invalidatePreview();
      return;
    }
    insertColumn(createFieldExportColumn(side, option));
  };

  const toggleSystemField = (field: MatchExportSystemField) => {
    const id = `system:${field}`;
    if (columns.some((column) => column.id === id)) {
      setColumns((current) => current.filter((column) => column.id !== id));
      invalidatePreview();
      return;
    }
    const meta = SYSTEM_FIELDS.find((item) => item.field === field)!;
    insertColumn({ id, header: meta.label, side: 'system', systemField: field });
  };

  const applyBasicColumns = () => {
    setColumns(createDefaultMatchExportColumns(fieldOptions));
    invalidatePreview();
  };
  const applyAllFormColumns = () => {
    if (fieldOptions.length * 2 > 100) {
      Toast.show({ icon: 'fail', content: '全部报名字段超过 100 列，请手动选择所需字段' });
      return;
    }
    setColumns([
      ...fieldOptions.map((option) => createFieldExportColumn('source', option)),
      ...fieldOptions.map((option) => createFieldExportColumn('target', option)),
    ]);
    invalidatePreview();
  };
  const updateHeader = (id: string, header: string) => {
    setColumns((current) => current.map((column) => column.id === id ? { ...column, header } : column));
    invalidatePreview();
  };
  const removeColumn = (id: string) => {
    setColumns((current) => current.filter((column) => column.id !== id));
    invalidatePreview();
  };
  const moveColumn = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= columns.length) return;
    setColumns((current) => {
      const next = [...current];
      const [column] = next.splice(index, 1);
      next.splice(target, 0, column);
      return next;
    });
    invalidatePreview();
  };

  const duplicateHeaders = useMemo(() => {
    const counts = new Map<string, number>();
    columns.forEach((column) => {
      const key = column.header.trim().toLocaleLowerCase('zh-CN');
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });
    return new Set(Array.from(counts.entries()).filter(([, count]) => count > 1).map(([key]) => key));
  }, [columns]);
  const columnError = columns.length === 0
    ? '请至少选择一个导出字段'
    : columns.some((column) => !column.header.trim())
      ? 'Excel 表头不能为空'
      : duplicateHeaders.size > 0
        ? '存在重复的 Excel 表头，请修改后继续'
        : '';

  const requestPayload = () => ({
    matchStatusId: resultsQuery.data?.matchStatusId || '',
    expectedRevision: resultsQuery.data?.revision || 1,
    relations: orderedRelations,
    columns,
  });

  const handleGeneratePreview = async () => {
    if (orderedRelations.length === 0) {
      Toast.show({ icon: 'fail', content: '请至少选择一条匹配关系' });
      setStep(1);
      return;
    }
    if (columnError) {
      Toast.show({ icon: 'fail', content: columnError });
      setStep(2);
      return;
    }
    setPreviewing(true);
    try {
      const data = await previewMatchExport(activityId, requestPayload());
      setPreview(data);
      setStep(3);
    } catch (error) {
      const parsed = await getErrorMessage(error, '生成导出预览失败');
      Toast.show({ icon: 'fail', content: parsed.message });
    } finally {
      setPreviewing(false);
    }
  };

  const handleExport = async () => {
    if (!preview) return;
    setExporting(true);
    try {
      const blob = await downloadMatchExport(activityId, {
        ...requestPayload(),
        previewDigest: preview.previewDigest,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = preview.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      Toast.show({ icon: 'success', content: `已导出 ${preview.totalRows} 条匹配关系` });
    } catch (error) {
      const parsed = await getErrorMessage(error, '导出失败');
      if (parsed.code === 'MATCH_EXPORT_PREVIEW_STALE' || parsed.code === 'MATCH_RESULT_CHANGED') {
        setPreview(null);
        setStep(2);
      }
      Toast.show({ icon: 'fail', content: parsed.message });
    } finally {
      setExporting(false);
    }
  };

  const isLoading = activityQuery.isPending || participantsQuery.isPending || resultsQuery.isPending || exportFieldsQuery.isPending;
  const loadError = activityQuery.error || participantsQuery.error || resultsQuery.error || exportFieldsQuery.error;
  const filteredFieldOptions = fieldOptions.filter((option) =>
    !fieldSearch.trim() || [option.label, option.fieldKey, ...option.typeNames]
      .join(' ')
      .toLocaleLowerCase('zh-CN')
      .includes(fieldSearch.trim().toLocaleLowerCase('zh-CN')));

  const goBack = () => navigate(`/dashboard/activity/${activityId}/matching?step=results`);

  if (isLoading) {
    return (
      <MerchantLayout title="导出匹配关系" showBack onBack={goBack} fullWidth>
        <div className="flex min-h-[55vh] items-center justify-center text-sm text-gray-500">
          <Loader2 size={22} className="mr-2 animate-spin" /> 正在准备匹配结果…
        </div>
      </MerchantLayout>
    );
  }

  if (loadError || !resultsQuery.data?.matchStatusId || matchResults.length === 0) {
    return (
      <MerchantLayout title="导出匹配关系" showBack onBack={goBack} fullWidth>
        <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-gray-100 bg-white p-8 text-center">
          <AlertCircle size={34} className="mx-auto text-amber-400" />
          <h2 className="mt-3 font-semibold text-gray-900">当前没有可导出的匹配结果</h2>
          <p className="mt-1 text-sm text-gray-500">请返回匹配结果页刷新或重新执行匹配。</p>
          <Button className="mt-4" onClick={goBack}>返回匹配结果</Button>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout title="导出匹配关系" showBack onBack={goBack} fullWidth contentClassName="pb-24">
      <div className="mx-auto max-w-[1440px] space-y-5 px-2 py-4 md:px-6 md:py-6">
        <header className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{activityQuery.data?.title || '活动'} · 匹配关系导出</h1>
              <p className="mt-1 text-sm text-gray-500">一个匹配关系一行；Excel 只包含明确选择并预览过的列。</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">匹配版本 V{resultsQuery.data.version || 1}</span>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600">{orderedRelations.length} 行</span>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600">{columns.length} 列</span>
            </div>
          </div>
          <ol className="mt-5 grid gap-2 md:grid-cols-3" aria-label="匹配导出步骤">
            {STEP_META.map((item) => {
              const Icon = item.icon;
              const active = step === item.step;
              const completed = step > item.step;
              return (
                <li key={item.step}>
                  <button
                    type="button"
                    onClick={() => item.step < step && setStep(item.step)}
                    disabled={item.step > step}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${active ? 'border-primary-200 bg-primary-50' : completed ? 'border-emerald-100 bg-emerald-50/60' : 'border-gray-100 bg-gray-50'} disabled:cursor-default`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${active ? 'bg-primary-500 text-white' : completed ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {completed ? <Check size={16} /> : <Icon size={16} />}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm font-medium ${active ? 'text-primary-800' : 'text-gray-700'}`}>{item.step}. {item.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-gray-500">{item.subtitle}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </header>

        {step === 1 && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">选择要导出的匹配关系</h2>
                  <p className="mt-1 text-xs text-gray-500">可以先批量选择每人的 Top N，再单独调整某位发起人的匹配对象。</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: 'all', label: '全部关系', count: null },
                    { key: 'top1', label: '每人 Top 1', count: 1 },
                    { key: 'top3', label: '每人 Top 3', count: 3 },
                    { key: 'top5', label: '每人 Top 5', count: 5 },
                  ] as const).map((preset) => (
                    <button key={preset.key} type="button" onClick={() => applyTopN(preset.count)} className={`rounded-lg border px-3 py-2 text-xs font-medium ${relationPreset === preset.key ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid min-h-[520px] gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="relative flex-1">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input aria-label="搜索发起人" value={sourceSearch} onChange={(event) => setSourceSearch(event.target.value)} placeholder="搜索姓名、手机号" className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm focus:border-primary-400 focus:outline-none" />
                    </label>
                    <select aria-label="筛选报名类型" value={registrationTypeFilter} onChange={(event) => setRegistrationTypeFilter(event.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-primary-400 focus:outline-none">
                      <option value="">全部报名类型</option>
                      {registrationTypes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>已选 {selectedSourceCount}/{matchResults.length} 名发起人</span>
                    <button type="button" onClick={toggleFilteredSources} className="font-medium text-primary-600 hover:text-primary-700">全选/取消当前筛选</button>
                  </div>
                </div>
                <div className="max-h-[500px] divide-y divide-gray-100 overflow-y-auto">
                  {sourceRows.map((result) => {
                    const participant = participantMap.get(result.userId);
                    const selectedCount = result.bestMatchUserIds.filter((targetId) => selectedRelations.has(relationKey(result.userId, targetId))).length;
                    const allSelected = result.bestMatchUserIds.length > 0 && selectedCount === result.bestMatchUserIds.length;
                    return (
                      <div key={result.userId} className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${activeResult?.userId === result.userId ? 'bg-primary-50/70' : 'hover:bg-gray-50'}`} onClick={() => setSelectedSourceId(result.userId)}>
                        <input aria-label={`选择${participant?.name || '发起人'}的全部匹配对象`} type="checkbox" checked={allSelected} onChange={() => toggleSource(result)} onClick={(event) => event.stopPropagation()} />
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">{participant?.name?.slice(0, 1) || '?'}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-gray-900">{participant?.name || result.userId.slice(0, 8)}</span>
                            {participant?.registrationTypeName && <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{participant.registrationTypeName}</span>}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-gray-400">{participant?.phone || '未提供手机号'}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${selectedCount > 0 ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-400'}`}>已选 {selectedCount}/{result.bestMatchUserIds.length}</span>
                      </div>
                    );
                  })}
                  {sourceRows.length === 0 && <div className="py-16 text-center text-sm text-gray-400">没有符合筛选条件的发起人</div>}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-4">
                  <h3 className="font-semibold text-gray-900">{activeResult ? `${participantMap.get(activeResult.userId)?.name || '发起人'}的匹配对象` : '匹配对象'}</h3>
                  <p className="mt-1 text-xs text-gray-500">勾选后，每个“发起人 → 匹配对象”会单独占一行。</p>
                </div>
                <div className="max-h-[500px] divide-y divide-gray-100 overflow-y-auto">
                  {activeResult?.bestMatchUserIds.map((targetId, index) => {
                    const participant = participantMap.get(targetId);
                    const checked = selectedRelations.has(relationKey(activeResult.userId, targetId));
                    return (
                      <label key={targetId} className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50">
                        <input type="checkbox" checked={checked} onChange={() => toggleTarget(activeResult.userId, targetId)} />
                        <span className="flex h-7 min-w-14 items-center justify-center rounded-lg bg-blue-50 px-2 text-xs font-medium text-blue-700">Top {index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-gray-900">{participant?.name || targetId.slice(0, 8)}</span>
                            {participant?.registrationTypeName && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{participant.registrationTypeName}</span>}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-gray-400">{participant?.phone || '未提供手机号'}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="sticky bottom-3 flex items-center justify-between rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <p className="text-sm text-gray-600">已选 <strong className="text-gray-900">{orderedRelations.length}</strong> 条匹配关系</p>
              <Button disabled={orderedRelations.length === 0} onClick={() => setStep(2)}>下一步：设置表头</Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <div className="flex items-start gap-2"><Info size={17} className="mt-0.5 shrink-0" /><span>Excel 只包含右侧“已选列”中的内容，不会自动添加匹配顺序、匹配分或其他隐藏字段。</span></div>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <span className="mr-1 text-xs font-medium text-gray-500">快速方案</span>
              <button type="button" onClick={applyBasicColumns} className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700">基础联系方式</button>
              <button type="button" onClick={applyAllFormColumns} className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">全部报名字段</button>
              <button type="button" onClick={() => { setColumns([]); invalidatePreview(); }} className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">清空</button>
              <span className="ml-auto text-xs text-gray-400">可编辑表头，并使用上下按钮调整 Excel 列顺序</span>
            </div>

            <div className="grid min-h-[560px] gap-4 lg:grid-cols-[minmax(340px,0.78fr)_minmax(0,1.22fr)]">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-4">
                  <h2 className="font-semibold text-gray-900">可用字段</h2>
                  <div className="mt-3 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
                    {(['source', 'target'] as const).map((side) => <button key={side} type="button" onClick={() => setFieldSide(side)} className={`rounded-md px-3 py-2 text-xs font-medium ${fieldSide === side ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>{side === 'source' ? '发起人资料' : '匹配对象资料'}</button>)}
                  </div>
                  <label className="relative mt-3 block">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input aria-label="搜索报名字段" value={fieldSearch} onChange={(event) => setFieldSearch(event.target.value)} placeholder="搜索字段名称" className="h-9 w-full rounded-lg border border-gray-200 pl-8 pr-3 text-sm focus:border-primary-400 focus:outline-none" />
                  </label>
                </div>
                <div className="max-h-[355px] divide-y divide-gray-100 overflow-y-auto">
                  {filteredFieldOptions.map((option) => {
                    const checked = columns.some((column) => column.id === `${fieldSide}:${option.id}`);
                    return (
                      <label key={option.id} className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-gray-50">
                        <input className="mt-0.5" type="checkbox" checked={checked} onChange={() => toggleField(fieldSide, option)} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-gray-800">{option.label}</span>
                          <span className="mt-0.5 block text-xs text-gray-400">{option.coveredTypeCount === option.totalTypeCount ? `适用于全部 ${option.totalTypeCount} 个报名类型` : `仅适用于 ${option.typeNames.join('、')}`}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-700">匹配信息 <span className="font-normal text-gray-400">（默认不导出）</span></p>
                  <div className="mt-2 space-y-2">
                    {SYSTEM_FIELDS.map((item) => {
                      const checked = columns.some((column) => column.id === `system:${item.field}`);
                      return (
                        <label key={item.field} className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-100 p-2.5 hover:bg-gray-50">
                          <input className="mt-0.5" type="checkbox" checked={checked} onChange={() => toggleSystemField(item.field)} />
                          <span><span className="block text-xs font-medium text-gray-700">{item.label}</span><span className="mt-0.5 block text-[11px] text-gray-400">{item.description}</span></span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                  <div><h2 className="font-semibold text-gray-900">已选 Excel 列</h2><p className="mt-1 text-xs text-gray-500">从上到下对应 Excel 从左到右，共 {columns.length} 列。</p></div>
                  {columnError && <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-600">{columnError}</span>}
                </div>
                {columns.length === 0 ? (
                  <div className="flex min-h-[450px] flex-col items-center justify-center text-center text-sm text-gray-400"><Columns3 size={34} className="mb-3 text-gray-300" />从左侧选择要导出的报名字段</div>
                ) : (
                  <div className="max-h-[560px] divide-y divide-gray-100 overflow-auto">
                    {columns.map((column, index) => {
                      const normalizedHeader = column.header.trim().toLocaleLowerCase('zh-CN');
                      const headerInvalid = !normalizedHeader || duplicateHeaders.has(normalizedHeader);
                      const fieldOption = column.side === 'system'
                        ? null
                        : fieldOptions.find((option) => `${column.side}:${option.id}` === column.id);
                      const sourceDescription = column.side === 'system'
                        ? SYSTEM_FIELDS.find((item) => item.field === column.systemField)?.description
                        : fieldOption
                          ? `报名字段：${fieldOption.label} · 覆盖 ${fieldOption.coveredTypeCount}/${fieldOption.totalTypeCount} 个报名类型`
                          : '报名表字段';
                      return (
                        <div key={column.id} className="grid min-w-[540px] grid-cols-[36px_minmax(180px,1fr)_110px_92px] items-center gap-3 px-4 py-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">{index + 1}</span>
                          <label className="min-w-0"><span className="mb-1 block text-[11px] text-gray-400">Excel 表头</span><input aria-label={`第${index + 1}列表头`} value={column.header} maxLength={80} onChange={(event) => updateHeader(column.id, event.target.value)} className={`h-9 w-full rounded-lg border px-3 text-sm focus:outline-none ${headerInvalid ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-gray-200 focus:border-primary-400'}`} /><span className="mt-1 block truncate text-[11px] text-gray-400" title={sourceDescription}>{sourceDescription}</span></label>
                          <span className={`rounded-lg px-2 py-1.5 text-center text-xs ${column.side === 'source' ? 'bg-blue-50 text-blue-700' : column.side === 'target' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'}`}>{column.side === 'source' ? '发起人资料' : column.side === 'target' ? '匹配对象资料' : '匹配信息'}</span>
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" aria-label={`上移${column.header}`} disabled={index === 0} onClick={() => moveColumn(index, -1)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-25"><ChevronUp size={15} /></button>
                            <button type="button" aria-label={`下移${column.header}`} disabled={index === columns.length - 1} onClick={() => moveColumn(index, 1)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-25"><ChevronDown size={15} /></button>
                            <button type="button" aria-label={`删除${column.header}`} onClick={() => removeColumn(column.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-3 flex items-center justify-between rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <Button variant="light" onClick={() => setStep(1)}>上一步</Button>
              <div className="flex items-center gap-3"><span className="hidden text-sm text-gray-500 sm:inline">将预览 {orderedRelations.length} 行 × {columns.length} 列</span><Button loading={previewing} disabled={Boolean(columnError) || orderedRelations.length === 0} onClick={() => void handleGeneratePreview()}>生成 Excel 预览</Button></div>
            </div>
          </section>
        )}

        {step === 3 && preview && (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3"><CheckCircle2 size={22} className="mt-0.5 shrink-0 text-emerald-600" /><div><h2 className="font-semibold text-emerald-900">预览已生成</h2><p className="mt-1 text-sm text-emerald-700">将导出 {preview.totalRows} 行 × {preview.totalColumns} 列 · {preview.filename}</p></div></div>
              <button type="button" onClick={() => setStep(2)} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">修改表头</button>
            </div>

            {preview.columns.some((column) => column.emptyCount > 0) && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-800">部分列存在空值</p>
                <div className="mt-2 flex flex-wrap gap-2">{preview.columns.filter((column) => column.emptyCount > 0).map((column) => <span key={column.id} className="rounded-full bg-white px-2.5 py-1 text-xs text-amber-700">{column.header}：{column.emptyCount} 行为空</span>)}</div>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3"><div><h2 className="font-semibold text-gray-900">Excel 内容预览</h2><p className="mt-1 text-xs text-gray-500">下方表头、顺序和值与实际导出的“匹配关系”工作表一致。</p></div><span className="text-xs text-gray-400">显示前 {Math.min(preview.previewLimit, preview.totalRows)} 行</span></div>
              <div className="max-h-[560px] overflow-auto">
                <table className="min-w-max border-separate border-spacing-0 text-sm">
                  <thead><tr>{preview.columns.map((column, index) => <th key={column.id} className={`sticky top-0 z-10 min-w-[160px] border-b border-r border-indigo-400 bg-indigo-600 px-3 py-2.5 text-left text-xs font-semibold text-white ${index === 0 ? 'left-0 z-20' : ''}`}>{column.header}</th>)}</tr></thead>
                  <tbody>{preview.rows.map((row, rowIndex) => <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>{row.map((value, columnIndex) => <td key={`${rowIndex}-${columnIndex}`} className={`max-w-[260px] border-b border-r border-gray-100 px-3 py-2 text-xs text-gray-700 ${columnIndex === 0 ? `sticky left-0 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}` : ''}`} title={String(value)}>{value === '' ? <span className="text-gray-300">—</span> : String(value)}</td>)}</tr>)}</tbody>
                </table>
              </div>
              {preview.truncated && <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-center text-xs text-gray-500">预览只展示前 {preview.previewLimit} 行，Excel 将包含全部 {preview.totalRows} 行。</div>}
            </div>

            <div className="sticky bottom-3 flex items-center justify-between rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <div className="flex gap-2"><Button variant="light" onClick={() => setStep(1)}>修改人员</Button><Button variant="light" onClick={() => setStep(2)}>修改表头</Button></div>
              <Button icon={<Download size={16} />} loading={exporting} onClick={() => void handleExport()}>导出 Excel（{preview.totalRows} 行）</Button>
            </div>
          </section>
        )}
      </div>
    </MerchantLayout>
  );
};

export default MatchResultExportPage;
