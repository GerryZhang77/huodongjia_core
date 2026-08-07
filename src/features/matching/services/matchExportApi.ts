import { api } from '@/services/api';
import type { MatchingSchemaGroup } from '../types';

export type MatchExportSide = 'source' | 'target' | 'system';
export type MatchExportSystemField = 'rank' | 'score' | 'reciprocal';

export interface MatchExportRelation {
  sourceUserId: string;
  targetUserId: string;
}

export interface MatchExportFieldSource {
  registrationTypeId: string | null;
  fieldKey: string;
}

export interface MatchExportColumn {
  id: string;
  header: string;
  side: MatchExportSide;
  fieldSources?: MatchExportFieldSource[];
  systemField?: MatchExportSystemField;
}

export interface MatchExportRequest {
  matchStatusId: string;
  expectedRevision: number;
  relations: MatchExportRelation[];
  columns: MatchExportColumn[];
  previewDigest?: string;
}

export interface MatchExportPreview {
  generatedAt: string;
  filename: string;
  totalRows: number;
  totalColumns: number;
  previewLimit: number;
  truncated: boolean;
  previewDigest: string;
  resultVersion: number;
  resultRevision: number;
  columns: Array<{
    id: string;
    header: string;
    side: MatchExportSide;
    format: 'text' | 'integer' | 'percentage';
    emptyCount: number;
  }>;
  rows: Array<Array<string | number>>;
}

export async function getMatchExportFieldGroups(
  activityId: string,
): Promise<MatchingSchemaGroup[]> {
  const response = await api.get<{
    success: boolean;
    data: { groups: MatchingSchemaGroup[] };
  }>(`/api/match/${activityId}/results/export/fields`);
  return response.data.groups || [];
}

export async function previewMatchExport(
  activityId: string,
  request: MatchExportRequest,
): Promise<MatchExportPreview> {
  const response = await api.post<{ success: boolean; data: MatchExportPreview }>(
    `/api/match/${activityId}/results/export/preview`,
    request,
    { timeout: 60_000 },
  );
  return response.data;
}

export async function downloadMatchExport(
  activityId: string,
  request: MatchExportRequest,
): Promise<Blob> {
  return api.post<Blob>(
    `/api/match/${activityId}/results/export`,
    request,
    { responseType: 'blob', timeout: 60_000 },
  );
}
