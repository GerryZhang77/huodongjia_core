import { api } from '@/services/api';

export type EnrollmentStatisticsStatusScope =
  | 'occupying'
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'waitlist'
  | 'cancelled'
  | 'all';

export interface EnrollmentStatisticsData {
  generatedAt: string;
  statusScope: EnrollmentStatisticsStatusScope;
  registrationTypeId: string | null;
  summary: {
    total: number;
    scopedTotal: number;
    pending: number;
    approved: number;
    rejected: number;
    waitlist: number;
    cancelled: number;
    capacity: number;
    globalOccupying: number;
  };
  registrationTypes: Array<{ id: string | null; name: string; active: boolean }>;
  dimensions: Array<{
    registrationTypeId: string | null;
    registrationTypeName: string;
    fieldKey: string;
    label: string;
    type: 'radio' | 'select' | 'multi-select';
    total: number;
    answered: number;
    missing: number;
    followUp: {
      actionRequired: number;
      submitted: number;
      reviewed: number;
    };
    options: Array<{
      value: string;
      count: number;
      percentage: number;
      active: boolean;
      capacity: number | null;
      remaining: number | null;
      overLimit: boolean;
      missing?: boolean;
    }>;
  }>;
}

export type EnrollmentStatisticValueMode = 'option' | 'missing' | 'follow_up';
export type EnrollmentStatisticFollowUpStatus = 'action_required' | 'submitted' | 'reviewed';

export interface EnrollmentStatisticParticipant {
  enrollmentId: string;
  userId: string | null;
  name: string;
  avatar: string | null;
  status: string;
  registrationTypeId: string | null;
  registrationTypeName: string;
  currentValue: string | string[] | null;
  missing: boolean;
  isExternal: boolean;
  canNotify: boolean;
  lastParticipantUpdateAt: string | null;
  hasUnreviewedChanges: boolean;
  updateRequest: {
    id: string;
    status: string;
    note: string | null;
    requestedAt: string;
    submittedAt: string | null;
    reviewedAt: string | null;
  } | null;
  latestChange: {
    before: unknown;
    after: unknown;
    confirmedOnly?: boolean;
    createdAt: string;
  } | null;
}

export interface EnrollmentStatisticParticipantParams {
  statusScope: EnrollmentStatisticsStatusScope;
  registrationTypeId?: string;
  fieldKey: string;
  valueMode: EnrollmentStatisticValueMode;
  optionValue?: string;
  followUpStatus?: EnrollmentStatisticFollowUpStatus;
  keyword?: string;
  page?: number;
  pageSize?: number;
  idsOnly?: boolean;
}

export interface EnrollmentStatisticParticipantsData {
  generatedAt: string;
  total: number;
  notifiableTotal: number;
  externalTotal: number;
  page: number;
  pageSize: number;
  items: Array<EnrollmentStatisticParticipant | { enrollmentId: string; canNotify: boolean }>;
}

export interface BatchEnrollmentUpdateRequestResult {
  selectedCount: number;
  taskCreatedOrUpdatedCount: number;
  notificationSentCount: number;
  mutedCount: number;
  externalUserCount: number;
  skippedCount: number;
  failedCount: number;
  notificationFailedCount: number;
  taskFailedCount: number;
  results: Array<{
    enrollmentId: string;
    status: 'sent' | 'muted' | 'external' | 'skipped' | 'failed';
    requestId?: string;
    message?: string;
  }>;
}

export async function getEnrollmentStatistics(
  eventId: string,
  params: {
    statusScope: EnrollmentStatisticsStatusScope;
    registrationTypeId?: string;
  },
): Promise<EnrollmentStatisticsData> {
  const response = await api.get<{ success: boolean; data: EnrollmentStatisticsData }>(
    `/api/enrollments/${eventId}/statistics`,
    { params },
  );
  return response.data;
}

export async function getEnrollmentStatisticParticipants(
  eventId: string,
  params: EnrollmentStatisticParticipantParams,
): Promise<EnrollmentStatisticParticipantsData> {
  const response = await api.get<{ success: boolean; data: EnrollmentStatisticParticipantsData }>(
    `/api/enrollments/${eventId}/statistics/participants`,
    { params },
  );
  return response.data;
}

export async function getAllEnrollmentStatisticParticipantIds(
  eventId: string,
  params: Omit<EnrollmentStatisticParticipantParams, 'page' | 'pageSize' | 'idsOnly'>,
): Promise<string[]> {
  const ids: string[] = [];
  let page = 1;
  while (true) {
    const result = await getEnrollmentStatisticParticipants(eventId, {
      ...params,
      page,
      pageSize: 500,
      idsOnly: true,
    });
    for (const item of result.items) {
      if (item.canNotify) ids.push(item.enrollmentId);
    }
    if (page * result.pageSize >= result.total) break;
    page += 1;
  }
  return Array.from(new Set(ids));
}

export async function batchRequestEnrollmentUpdates(
  eventId: string,
  data: {
    enrollmentIds: string[];
    fieldKeys: string[];
    note?: string;
    target?: {
      registrationTypeId?: string;
      fieldKey: string;
      valueMode: EnrollmentStatisticValueMode;
      optionValue?: string;
      followUpStatus?: EnrollmentStatisticFollowUpStatus;
    };
  },
): Promise<BatchEnrollmentUpdateRequestResult> {
  const response = await api.post<{
    success: boolean;
    data: BatchEnrollmentUpdateRequestResult;
  }>(`/api/enrollments/${eventId}/update-requests/batch`, data);
  return response.data;
}
