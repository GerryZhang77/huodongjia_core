import React, { useDeferredValue, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Send,
  UserRound,
  X,
} from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { reviewEnrollmentChanges } from '@/services/enrollmentApi';
import {
  batchRequestEnrollmentUpdates,
  getAllEnrollmentStatisticParticipantIds,
  getEnrollmentStatisticParticipants,
  getEnrollmentStatistics,
  type EnrollmentStatisticFollowUpStatus,
  type EnrollmentStatisticParticipant,
  type EnrollmentStatisticParticipantParams,
  type EnrollmentStatisticsData,
  type EnrollmentStatisticsStatusScope,
} from '../services/enrollmentStatisticsApi';

const STATUS_OPTIONS: Array<{ value: EnrollmentStatisticsStatusScope; label: string }> = [
  { value: 'occupying', label: '待审核 + 已通过' },
  { value: 'approved', label: '仅已通过' },
  { value: 'pending', label: '仅待审核' },
  { value: 'rejected', label: '仅已拒绝' },
  { value: 'waitlist', label: '仅候补' },
  { value: 'cancelled', label: '仅已取消' },
  { value: 'all', label: '全部状态' },
];

const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  waitlist: '候补',
  cancelled: '已取消',
};

const FOLLOW_UP_LABELS: Record<EnrollmentStatisticFollowUpStatus, string> = {
  action_required: '待补充',
  submitted: '已补充待查看',
  reviewed: '已查看',
};

type Dimension = EnrollmentStatisticsData['dimensions'][number];

type DrilldownTarget = {
  dimension: Dimension;
  mode: 'option' | 'missing' | 'follow_up';
  optionValue?: string;
  followUpStatus?: EnrollmentStatisticFollowUpStatus;
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '未填写';
  if (Array.isArray(value)) return value.length > 0 ? value.join('、') : '未填写';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const formatTime = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTargetLabel = (target: DrilldownTarget): string => {
  if (target.mode === 'missing') return '未填写';
  if (target.mode === 'follow_up' && target.followUpStatus) {
    return FOLLOW_UP_LABELS[target.followUpStatus];
  }
  return target.optionValue || '选项名单';
};

const getRequestStatus = (participant: EnrollmentStatisticParticipant) => {
  if (participant.updateRequest?.status === 'action_required') {
    return { label: '待补充', className: 'bg-orange-100 text-orange-700' };
  }
  if (participant.updateRequest?.status === 'submitted' || participant.hasUnreviewedChanges) {
    return { label: '已补充待查看', className: 'bg-blue-100 text-blue-700' };
  }
  if (participant.updateRequest?.status === 'reviewed') {
    return { label: '已查看', className: 'bg-green-100 text-green-700' };
  }
  return null;
};

const StatisticParticipantDrawer: React.FC<{
  activityId: string;
  statusScope: EnrollmentStatisticsStatusScope;
  target: DrilldownTarget;
  onClose: () => void;
  onChanged: () => void;
}> = ({ activityId, statusScope, target, onClose, onChanged }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const deferredKeyword = useDeferredValue(keyword.trim());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectingAll, setSelectingAll] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState('');
  const pageSize = 30;

  const baseParams = useMemo<Omit<EnrollmentStatisticParticipantParams, 'page' | 'pageSize' | 'idsOnly'>>(() => ({
    statusScope,
    registrationTypeId: target.dimension.registrationTypeId || undefined,
    fieldKey: target.dimension.fieldKey,
    valueMode: target.mode,
    optionValue: target.optionValue,
    followUpStatus: target.followUpStatus,
    keyword: deferredKeyword || undefined,
  }), [deferredKeyword, statusScope, target]);

  const participantsQuery = useQuery({
    queryKey: [
      'merchant',
      'enrollment-statistic-participants',
      activityId,
      baseParams,
      page,
    ],
    queryFn: () => getEnrollmentStatisticParticipants(activityId, {
      ...baseParams,
      page,
      pageSize,
    }),
    refetchInterval: 30_000,
  });
  const data = participantsQuery.data;
  const participants = (data?.items || []) as EnrollmentStatisticParticipant[];
  const pageCount = Math.max(1, Math.ceil((data?.total || 0) / pageSize));

  const refreshAll = async () => {
    await Promise.all([
      participantsQuery.refetch(),
      queryClient.invalidateQueries({ queryKey: ['merchant', 'enrollment-statistics', activityId] }),
    ]);
    onChanged();
  };

  const batchMutation = useMutation({
    mutationFn: () => batchRequestEnrollmentUpdates(activityId, {
      enrollmentIds: Array.from(selectedIds),
      fieldKeys: [target.dimension.fieldKey],
      note: note.trim() || undefined,
      target: {
        registrationTypeId: target.dimension.registrationTypeId || undefined,
        fieldKey: target.dimension.fieldKey,
        valueMode: target.mode,
        optionValue: target.optionValue,
        followUpStatus: target.followUpStatus,
      },
    }),
    onSuccess: async (result) => {
      const details = [
        `任务 ${result.taskCreatedOrUpdatedCount} 人`,
        `通知已投递 ${result.notificationSentCount} 人`,
      ];
      if (result.mutedCount > 0) details.push(`免打扰 ${result.mutedCount} 人`);
      if (result.externalUserCount > 0) details.push(`外部用户 ${result.externalUserCount} 人`);
      if (result.skippedCount > 0) details.push(`资料已变化，跳过 ${result.skippedCount} 人`);
      if (result.failedCount > 0) details.push(`失败 ${result.failedCount} 人`);
      Toast.show({ icon: result.failedCount > 0 ? 'fail' : 'success', content: details.join('，') });
      setConfirming(false);
      setSelectedIds(new Set());
      setNote('');
      await refreshAll();
    },
    onError: (error) => {
      Toast.show({
        icon: 'fail',
        content: error instanceof Error ? error.message : '批量创建补充任务失败',
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (enrollmentId: string) => reviewEnrollmentChanges(activityId, enrollmentId),
    onSuccess: async () => {
      Toast.show({ icon: 'success', content: '已标记为查看' });
      await refreshAll();
    },
    onError: (error) => {
      Toast.show({ icon: 'fail', content: error instanceof Error ? error.message : '操作失败' });
    },
  });

  const toggleSelected = (enrollmentId: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(enrollmentId)) next.delete(enrollmentId);
      else next.add(enrollmentId);
      return next;
    });
  };

  const selectCurrentPage = () => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      participants.filter((item) => item.canNotify).forEach((item) => next.add(item.enrollmentId));
      return next;
    });
  };

  const selectAllResults = async () => {
    setSelectingAll(true);
    try {
      const ids = await getAllEnrollmentStatisticParticipantIds(activityId, baseParams);
      setSelectedIds(new Set(ids));
    } catch (error) {
      Toast.show({ icon: 'fail', content: error instanceof Error ? error.message : '全选失败' });
    } finally {
      setSelectingAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="统计人员名单">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="关闭人员名单" onClick={onClose} />
      <div className="relative flex h-full max-h-[100dvh] w-full flex-col bg-white shadow-xl sm:max-w-xl">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{target.dimension.registrationTypeName} · {target.dimension.label}</p>
              <h3 className="mt-1 truncate text-lg font-semibold text-gray-900">{getTargetLabel(target)}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void participantsQuery.refetch()}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                aria-label="刷新人员名单"
              >
                <RefreshCw size={17} className={participantsQuery.isFetching ? 'animate-spin' : ''} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                aria-label="关闭"
              >
                <X size={19} />
              </button>
            </div>
          </div>
          <div className="relative mt-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="搜索姓名"
              className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-primary-400"
            />
          </div>
        </div>

        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-gray-600">
              共 <strong className="text-gray-900">{data?.total || 0}</strong> 人
              <span className="mx-1.5 text-gray-300">·</span>
              可站内通知 {data?.notifiableTotal || 0} 人
              {(data?.externalTotal || 0) > 0 && ` · 外部用户 ${data?.externalTotal} 人`}
            </span>
            <span className="text-gray-400">{data?.generatedAt ? `更新于 ${formatTime(data.generatedAt)}` : ''}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-medium text-primary-600">已选 {selectedIds.size} 人</span>
            <button type="button" className="text-primary-500 hover:underline" onClick={selectCurrentPage}>全选本页</button>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-primary-500 hover:underline disabled:opacity-50"
              onClick={() => void selectAllResults()}
              disabled={selectingAll || !data?.notifiableTotal}
            >
              {selectingAll && <Loader2 size={11} className="animate-spin" />}
              全选全部可通知用户
            </button>
            {selectedIds.size > 0 && (
              <button type="button" className="text-gray-500 hover:underline" onClick={() => setSelectedIds(new Set())}>清空</button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5">
          {participantsQuery.isPending ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-500">
              <Loader2 size={19} className="mr-2 animate-spin" /> 正在加载人员…
            </div>
          ) : participantsQuery.isError ? (
            <div className="py-16 text-center text-sm text-red-500">人员名单加载失败，请重试</div>
          ) : participants.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">当前条件下暂无人员</div>
          ) : (
            <div className="space-y-2">
              {participants.map((participant) => {
                const requestStatus = getRequestStatus(participant);
                const selected = selectedIds.has(participant.enrollmentId);
                return (
                  <div
                    key={participant.enrollmentId}
                    role="checkbox"
                    aria-checked={selected}
                    aria-disabled={!participant.canNotify}
                    aria-label={`${selected ? '取消选择' : '选择'}${participant.name}`}
                    tabIndex={participant.canNotify ? 0 : -1}
                    onClick={() => {
                      if (participant.canNotify) toggleSelected(participant.enrollmentId);
                    }}
                    onKeyDown={(event) => {
                      if (!participant.canNotify || (event.key !== 'Enter' && event.key !== ' ')) return;
                      event.preventDefault();
                      toggleSelected(participant.enrollmentId);
                    }}
                    className={`rounded-xl border p-3 transition-colors ${
                      participant.canNotify ? 'cursor-pointer' : 'cursor-not-allowed'
                    } ${
                      selected
                        ? 'border-primary-300 bg-primary-50/40 ring-1 ring-primary-100'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                          selected
                            ? 'border-primary-500 bg-primary-500 text-white'
                            : participant.canNotify
                              ? 'border-gray-400 bg-white'
                              : 'border-gray-200 bg-gray-100'
                        }`}
                      >
                        {selected && <Check size={13} />}
                      </span>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-sm font-medium text-primary-600">
                        {participant.avatar ? <img src={participant.avatar} alt="" className="h-full w-full object-cover" /> : participant.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium text-gray-900">{participant.name}</span>
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                            {ENROLLMENT_STATUS_LABELS[participant.status] || participant.status}
                          </span>
                          {participant.isExternal && (
                            <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[11px] text-orange-700">外部用户 · 无法站内通知</span>
                          )}
                          {requestStatus && (
                            <span className={`rounded px-1.5 py-0.5 text-[11px] ${requestStatus.className}`}>{requestStatus.label}</span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          当前填写：<span className="text-gray-700">{formatValue(participant.currentValue)}</span>
                        </p>
                        {participant.latestChange && (
                          <div className="mt-2 rounded-lg bg-blue-50 px-2.5 py-2 text-xs text-blue-800">
                            {participant.latestChange.confirmedOnly ? (
                              <span>参与者确认原内容无误</span>
                            ) : (
                              <span>{formatValue(participant.latestChange.before)} → <strong>{formatValue(participant.latestChange.after)}</strong></span>
                            )}
                            <span className="ml-2 text-blue-500">{formatTime(participant.latestChange.createdAt)}</span>
                          </div>
                        )}
                        {participant.updateRequest?.status === 'submitted' && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              reviewMutation.mutate(participant.enrollmentId);
                            }}
                            disabled={reviewMutation.isPending}
                            className="mt-2 text-xs font-medium text-primary-600 hover:underline disabled:opacity-50"
                          >
                            标记该用户更新已查看
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs text-gray-600 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> 上一页
              </button>
              <span className="text-xs text-gray-500">{page} / {pageCount}</span>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs text-gray-600 disabled:opacity-40"
              >
                下一页 <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="safe-area-pb border-t border-gray-100 bg-white px-4 pt-3 sm:px-5">
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => setConfirming(true)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 text-sm font-medium text-white disabled:opacity-40"
          >
            <Send size={16} /> 要求选中的 {selectedIds.size} 人补充或确认此项
          </button>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-label="确认补充任务">
            <h4 className="text-base font-semibold text-gray-900">发送报名资料补充任务</h4>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              将要求 {selectedIds.size} 位平台用户补充或确认“{target.dimension.label}”。通知会直达该活动的报名编辑页。
            </p>
            <label className="mt-4 block text-sm font-medium text-gray-700">
              补充说明（选填）
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder={`请补充或确认「${target.dimension.label}」`}
                className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">本操作创建站内补充任务；免打扰用户会单独统计，不会被误报为已投递。</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100" onClick={() => setConfirming(false)}>取消</button>
              <button
                type="button"
                disabled={batchMutation.isPending}
                onClick={() => batchMutation.mutate()}
                className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {batchMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                确认发送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const EnrollmentStatisticsDashboard: React.FC<{ activityId: string }> = ({ activityId }) => {
  const [statusScope, setStatusScope] = useState<EnrollmentStatisticsStatusScope>('occupying');
  const [registrationTypeId, setRegistrationTypeId] = useState('');
  const [drilldown, setDrilldown] = useState<DrilldownTarget | null>(null);
  const query = useQuery({
    queryKey: ['merchant', 'enrollment-statistics', activityId, statusScope, registrationTypeId],
    queryFn: () => getEnrollmentStatistics(activityId, {
      statusScope,
      registrationTypeId: registrationTypeId || undefined,
    }),
    enabled: Boolean(activityId),
    refetchInterval: 30_000,
  });
  const data = query.data;

  return (
    <section className="space-y-4" aria-label="报名信息统计">
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <BarChart3 size={18} className="text-primary-500" /> 报名选项分布
            </h2>
            <p className="mt-1 text-xs text-gray-500">点击任一选项查看人员；支持单选、下拉和多选字段。</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <label className="text-xs text-gray-500">
              报名状态
              <select
                value={statusScope}
                onChange={(event) => {
                  setStatusScope(event.target.value as EnrollmentStatisticsStatusScope);
                  setDrilldown(null);
                }}
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-primary-400 focus:outline-none"
              >
                {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="text-xs text-gray-500">
              报名类型
              <select
                value={registrationTypeId}
                onChange={(event) => {
                  setRegistrationTypeId(event.target.value);
                  setDrilldown(null);
                }}
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-primary-400 focus:outline-none"
              >
                <option value="">全部报名类型</option>
                {(data?.registrationTypes || []).map((type) => (
                  <option key={type.id || 'default'} value={type.id || ''}>
                    {type.name}{type.active ? '' : '（已停用）'}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="mt-4 flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw size={14} className={query.isFetching ? 'animate-spin' : ''} /> 刷新
            </button>
          </div>
        </div>
        {data?.generatedAt && <p className="mt-2 text-right text-[11px] text-gray-400">数据更新于 {formatTime(data.generatedAt)}</p>}
      </div>

      {query.isPending ? (
        <div className="flex items-center justify-center rounded-xl bg-white py-16 text-sm text-gray-500">
          <Loader2 size={20} className="mr-2 animate-spin" /> 正在统计报名信息…
        </div>
      ) : query.isError || !data ? (
        <div className="flex items-center justify-center rounded-xl bg-white py-16 text-sm text-red-500">
          <AlertCircle size={18} className="mr-2" /> 统计加载失败，请稍后重试
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
              <p className="text-2xl font-bold text-primary-700">{data.summary.scopedTotal}</p>
              <p className="mt-1 text-xs text-primary-600">当前统计人数</p>
            </div>
            <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
              <p className="text-2xl font-bold text-yellow-700">{data.summary.pending}</p>
              <p className="mt-1 text-xs text-yellow-700">待审核</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-2xl font-bold text-green-700">{data.summary.approved}</p>
              <p className="mt-1 text-xs text-green-700">已通过</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.capacity > 0 ? `${data.summary.globalOccupying}/${data.summary.capacity}` : '不限'}
              </p>
              <p className="mt-1 text-xs text-gray-500">总名额占用</p>
            </div>
          </div>

          {data.dimensions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center">
              <BarChart3 size={36} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">当前范围内没有可统计的选项字段</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.dimensions.map((dimension) => (
                <article key={`${dimension.registrationTypeId || 'default'}:${dimension.fieldKey}`} className="rounded-xl border border-gray-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{dimension.label}</h3>
                      <p className="mt-1 text-xs text-gray-500">{dimension.registrationTypeName} · 共 {dimension.total} 人</p>
                    </div>
                    {dimension.missing > 0 && <span className="rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-600">未填写 {dimension.missing}</span>}
                  </div>

                  {(dimension.followUp.actionRequired > 0 || dimension.followUp.submitted > 0 || dimension.followUp.reviewed > 0) && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-b border-gray-100 pb-3">
                      {([
                        ['action_required', dimension.followUp.actionRequired],
                        ['submitted', dimension.followUp.submitted],
                        ['reviewed', dimension.followUp.reviewed],
                      ] as Array<[EnrollmentStatisticFollowUpStatus, number]>).filter(([, count]) => count > 0).map(([followUpStatus, count]) => (
                        <button
                          type="button"
                          key={followUpStatus}
                          onClick={() => setDrilldown({ dimension, mode: 'follow_up', followUpStatus })}
                          className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] text-blue-700 hover:bg-blue-100"
                        >
                          {FOLLOW_UP_LABELS[followUpStatus]} {count}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 space-y-2">
                    {dimension.options.map((option) => (
                      <button
                        type="button"
                        key={`${option.missing ? 'missing' : 'value'}:${option.value}`}
                        onClick={() => setDrilldown({
                          dimension,
                          mode: option.missing ? 'missing' : 'option',
                          optionValue: option.missing ? undefined : option.value,
                        })}
                        className={`group block w-full rounded-lg p-2 text-left transition-colors ${option.missing ? 'bg-orange-50/70 hover:bg-orange-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                          <span className={`min-w-0 truncate ${option.missing ? 'font-medium text-orange-700' : 'text-gray-700'}`}>
                            {option.value}{!option.active ? '（历史选项）' : ''}
                          </span>
                          <span className="flex shrink-0 items-center gap-2 tabular-nums text-gray-500">
                            {option.count} 人 · {option.percentage}%
                            {option.capacity !== null && ` · 名额 ${option.capacity}`}
                            <ChevronRight size={14} className="text-gray-300 group-hover:text-primary-500" />
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${option.overLimit ? 'bg-amber-500' : option.missing ? 'bg-orange-300' : 'bg-primary-400'}`}
                            style={{ width: `${Math.min(100, Math.max(0, option.percentage))}%` }}
                          />
                        </div>
                        {option.missing && option.count > 0 && (
                          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-orange-600"><UserRound size={12} /> 查看并提醒未填写用户</p>
                        )}
                        {option.overLimit && <p className="mt-1 text-[11px] text-amber-600">历史报名已超过当前名额；不会影响已报名人员，新报名已停止。</p>}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {drilldown && (
        <StatisticParticipantDrawer
          key={`${drilldown.dimension.registrationTypeId || 'default'}:${drilldown.dimension.fieldKey}:${drilldown.mode}:${drilldown.optionValue || drilldown.followUpStatus || ''}`}
          activityId={activityId}
          statusScope={statusScope}
          target={drilldown}
          onClose={() => setDrilldown(null)}
          onChanged={() => void query.refetch()}
        />
      )}
    </section>
  );
};

export default EnrollmentStatisticsDashboard;
