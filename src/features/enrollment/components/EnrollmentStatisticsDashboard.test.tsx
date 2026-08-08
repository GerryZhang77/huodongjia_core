import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  batchRequestEnrollmentUpdates,
  getAllEnrollmentStatisticParticipantIds,
  getEnrollmentStatisticParticipants,
  getEnrollmentStatistics,
} from '../services/enrollmentStatisticsApi';
import EnrollmentStatisticsDashboard from './EnrollmentStatisticsDashboard';

vi.mock('../services/enrollmentStatisticsApi', async () => {
  const actual = await vi.importActual<typeof import('../services/enrollmentStatisticsApi')>(
    '../services/enrollmentStatisticsApi',
  );
  return {
    ...actual,
    getEnrollmentStatistics: vi.fn(),
    getEnrollmentStatisticParticipants: vi.fn(),
    getAllEnrollmentStatisticParticipantIds: vi.fn(),
    batchRequestEnrollmentUpdates: vi.fn(),
  };
});

const response = {
  generatedAt: '2026-08-07T00:00:00.000Z',
  statusScope: 'occupying' as const,
  registrationTypeId: null,
  summary: {
    total: 12,
    scopedTotal: 10,
    pending: 4,
    approved: 6,
    rejected: 2,
    waitlist: 0,
    cancelled: 0,
    capacity: 50,
    globalOccupying: 10,
  },
  registrationTypes: [{ id: 'regular', name: '普通报名', active: true }],
  dimensions: [{
    registrationTypeId: 'regular',
    registrationTypeName: '普通报名',
    fieldKey: 'gender',
    label: '性别',
    type: 'radio' as const,
    total: 10,
    answered: 10,
    missing: 0,
    followUp: { actionRequired: 0, submitted: 0, reviewed: 0 },
    options: [
      { value: '男', count: 4, percentage: 40, active: true, capacity: 4, remaining: 0, overLimit: false },
      { value: '女', count: 6, percentage: 60, active: true, capacity: 8, remaining: 2, overLimit: false },
    ],
  }],
};

describe('EnrollmentStatisticsDashboard', () => {
  beforeEach(() => {
    vi.mocked(getEnrollmentStatistics).mockResolvedValue(response);
    vi.mocked(getEnrollmentStatisticParticipants).mockResolvedValue({
      generatedAt: '2026-08-08T00:00:00.000Z',
      total: 1,
      notifiableTotal: 1,
      externalTotal: 0,
      page: 1,
      pageSize: 30,
      items: [{
        enrollmentId: 'enrollment-1',
        userId: 'user-1',
        name: '张三',
        avatar: null,
        status: 'approved',
        registrationTypeId: 'regular',
        registrationTypeName: '普通报名',
        currentValue: '男',
        missing: false,
        isExternal: false,
        canNotify: true,
        lastParticipantUpdateAt: null,
        hasUnreviewedChanges: false,
        updateRequest: null,
        latestChange: null,
      }],
    });
    vi.mocked(getAllEnrollmentStatisticParticipantIds).mockResolvedValue(['enrollment-1']);
    vi.mocked(batchRequestEnrollmentUpdates).mockResolvedValue({
      selectedCount: 1,
      taskCreatedOrUpdatedCount: 1,
      notificationSentCount: 1,
      mutedCount: 0,
      externalUserCount: 0,
      skippedCount: 0,
      failedCount: 0,
      notificationFailedCount: 0,
      taskFailedCount: 0,
      results: [{ enrollmentId: 'enrollment-1', status: 'sent', requestId: 'request-1' }],
    });
  });

  it('defaults to pending plus approved and supports approved-only filtering', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <EnrollmentStatisticsDashboard activityId="event-1" />
      </QueryClientProvider>,
    );

    await screen.findByText('当前统计人数');
    expect(getEnrollmentStatistics).toHaveBeenCalledWith('event-1', {
      statusScope: 'occupying',
      registrationTypeId: undefined,
    });
    expect(screen.getByText('性别')).not.toBeNull();
    expect(screen.getByText('4 人 · 40% · 名额 4')).not.toBeNull();

    fireEvent.change(screen.getByLabelText('报名状态'), { target: { value: 'approved' } });
    await waitFor(() => {
      expect(getEnrollmentStatistics).toHaveBeenLastCalledWith('event-1', {
        statusScope: 'approved',
        registrationTypeId: undefined,
      });
    });
  });

  it('drills into an option, selects a participant, and creates a field update task', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <EnrollmentStatisticsDashboard activityId="event-1" />
      </QueryClientProvider>,
    );

    await screen.findByText('当前统计人数');
    fireEvent.click(screen.getByRole('button', { name: /男.*4 人/ }));
    await screen.findByText('张三');
    const participantItem = screen.getByRole('checkbox', { name: '选择张三' });
    expect(participantItem.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(participantItem);
    expect(participantItem.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: /要求选中的 1 人补充或确认此项/ }));
    fireEvent.click(screen.getByRole('button', { name: '确认发送' }));

    await waitFor(() => {
      expect(batchRequestEnrollmentUpdates).toHaveBeenCalledWith('event-1', {
        enrollmentIds: ['enrollment-1'],
        fieldKeys: ['gender'],
        note: undefined,
        target: {
          registrationTypeId: 'regular',
          fieldKey: 'gender',
          valueMode: 'option',
          optionValue: '男',
          followUpStatus: undefined,
        },
      });
    });
  });
});
