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
    type: 'radio' | 'select';
    total: number;
    answered: number;
    missing: number;
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
