import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getEnrollmentStatistics } from '../services/enrollmentStatisticsApi';
import EnrollmentStatisticsDashboard from './EnrollmentStatisticsDashboard';

vi.mock('../services/enrollmentStatisticsApi', async () => {
  const actual = await vi.importActual<typeof import('../services/enrollmentStatisticsApi')>(
    '../services/enrollmentStatisticsApi',
  );
  return { ...actual, getEnrollmentStatistics: vi.fn() };
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
    options: [
      { value: '男', count: 4, percentage: 40, active: true, capacity: 4, remaining: 0, overLimit: false },
      { value: '女', count: 6, percentage: 60, active: true, capacity: 8, remaining: 2, overLimit: false },
    ],
  }],
};

describe('EnrollmentStatisticsDashboard', () => {
  beforeEach(() => {
    vi.mocked(getEnrollmentStatistics).mockResolvedValue(response);
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
});
