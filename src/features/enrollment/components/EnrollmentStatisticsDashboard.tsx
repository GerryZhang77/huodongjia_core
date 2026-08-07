import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, BarChart3, Loader2 } from 'lucide-react';
import {
  getEnrollmentStatistics,
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

export const EnrollmentStatisticsDashboard: React.FC<{ activityId: string }> = ({ activityId }) => {
  const [statusScope, setStatusScope] = useState<EnrollmentStatisticsStatusScope>('occupying');
  const [registrationTypeId, setRegistrationTypeId] = useState('');
  const query = useQuery({
    queryKey: ['merchant', 'enrollment-statistics', activityId, statusScope, registrationTypeId],
    queryFn: () => getEnrollmentStatistics(activityId, {
      statusScope,
      registrationTypeId: registrationTypeId || undefined,
    }),
    enabled: Boolean(activityId),
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
            <p className="mt-1 text-xs text-gray-500">统计单选与下拉字段；文字填写内容不做可视化。</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-gray-500">
              报名状态
              <select
                value={statusScope}
                onChange={(event) => setStatusScope(event.target.value as EnrollmentStatisticsStatusScope)}
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-primary-400 focus:outline-none"
              >
                {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="text-xs text-gray-500">
              报名类型
              <select
                value={registrationTypeId}
                onChange={(event) => setRegistrationTypeId(event.target.value)}
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
          </div>
        </div>
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
              <p className="mt-3 text-sm text-gray-500">当前范围内没有可统计的单选字段</p>
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
                    {dimension.missing > 0 && <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">未填写 {dimension.missing}</span>}
                  </div>
                  <div className="mt-4 space-y-3">
                    {dimension.options.map((option) => (
                      <div key={option.value}>
                        <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                          <span className="min-w-0 truncate text-gray-700">
                            {option.value}{!option.active ? '（历史选项）' : ''}
                          </span>
                          <span className="shrink-0 tabular-nums text-gray-500">
                            {option.count} 人 · {option.percentage}%
                            {option.capacity !== null && ` · 名额 ${option.capacity}`}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${option.overLimit ? 'bg-amber-500' : option.missing ? 'bg-gray-300' : 'bg-primary-400'}`}
                            style={{ width: `${Math.min(100, Math.max(0, option.percentage))}%` }}
                          />
                        </div>
                        {option.overLimit && <p className="mt-1 text-[11px] text-amber-600">历史报名已超过当前名额；不会影响已报名人员，新报名已停止。</p>}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default EnrollmentStatisticsDashboard;
