import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getActivityById } from '@/features/activities/services/api';
import { getMatchGroups, getParticipants } from '@/features/matching/services/matchingApi';
import {
  downloadMatchExport,
  getMatchExportFieldGroups,
  previewMatchExport,
} from '@/features/matching/services/matchExportApi';
import MatchResultExportPage from './MatchResultExport';

vi.mock('@/components/layout/MerchantLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock('@/features/activities/services/api', () => ({ getActivityById: vi.fn() }));
vi.mock('@/features/matching/services/matchingApi', () => ({
  getMatchGroups: vi.fn(),
  getParticipants: vi.fn(),
}));
vi.mock('@/features/matching/services/matchExportApi', async () => {
  const actual = await vi.importActual<typeof import('@/features/matching/services/matchExportApi')>(
    '@/features/matching/services/matchExportApi',
  );
  return {
    ...actual,
    getMatchExportFieldGroups: vi.fn(),
    previewMatchExport: vi.fn(),
    downloadMatchExport: vi.fn(),
  };
});

const schema = [
  { key: 'name', label: '姓名', type: 'text' as const, required: true, preset: true },
  { key: 'phone', label: '手机号', type: 'text' as const, required: true, preset: true },
];

describe('MatchResultExportPage', () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:match-export'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    vi.mocked(getActivityById).mockResolvedValue({
      id: 'event-1',
      title: '测试活动',
      registrationTypes: [{
        id: 'regular',
        name: '普通报名',
        formSchema: schema,
        eligibilityMode: 'public',
        isDefault: true,
        matchEnabled: true,
        sortOrder: 0,
        members: [],
      }],
    } as never);
    vi.mocked(getParticipants).mockResolvedValue([
      { id: 'owner', name: '张三', phone: '13800000000', registrationTypeId: 'regular', registrationTypeName: '普通报名' },
      { id: 'target', name: '李四', phone: '13900000000', registrationTypeId: 'regular', registrationTypeName: '普通报名' },
    ]);
    vi.mocked(getMatchExportFieldGroups).mockResolvedValue([{
      id: 'regular',
      name: '普通报名',
      fields: schema,
    }]);
    vi.mocked(getMatchGroups).mockResolvedValue({
      results: [{
        id: 'edge-owner',
        userId: 'owner',
        matchId: 'run-1',
        bestMatchUserIds: ['target'],
        scores: null,
        createdAt: '2026-08-07T00:00:00.000Z',
        isLocked: false,
      }],
      stats: null,
      matchStatusId: 'run-1',
      version: 2,
      revision: 3,
      participantUserIds: ['owner', 'target'],
    });
    vi.mocked(previewMatchExport).mockResolvedValue({
      generatedAt: '2026-08-07T00:00:00.000Z',
      filename: '测试活动_匹配结果_V2.xlsx',
      totalRows: 1,
      totalColumns: 4,
      previewLimit: 50,
      truncated: false,
      previewDigest: 'digest-1',
      resultVersion: 2,
      resultRevision: 3,
      columns: [
        { id: 'source:name:text', header: '发起人-姓名', side: 'source', format: 'text', emptyCount: 0 },
        { id: 'source:phone:text', header: '发起人-手机号', side: 'source', format: 'text', emptyCount: 0 },
        { id: 'target:name:text', header: '匹配对象-姓名', side: 'target', format: 'text', emptyCount: 0 },
        { id: 'target:phone:text', header: '匹配对象-手机号', side: 'target', format: 'text', emptyCount: 0 },
      ],
      rows: [['张三', '13800000000', '李四', '13900000000']],
    });
    vi.mocked(downloadMatchExport).mockResolvedValue(new Blob(['excel']));
  });

  it('requires an exact preview and never adds hidden matching metadata', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard/activity/event-1/matching/export']}>
          <Routes>
            <Route path="/dashboard/activity/:id/matching/export" element={<MatchResultExportPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole('heading', { name: '选择要导出的匹配关系' });
    fireEvent.click(screen.getByRole('button', { name: '下一步：设置表头' }));

    expect(screen.getByText(/不会自动添加匹配顺序、匹配分或其他隐藏字段/)).not.toBeNull();
    expect((screen.getByRole('checkbox', { name: /匹配分/ }) as HTMLInputElement).checked).toBe(false);
    expect((screen.getByLabelText('第1列表头') as HTMLInputElement).value).toBe('发起人-姓名');

    fireEvent.click(screen.getByRole('button', { name: '生成 Excel 预览' }));
    await screen.findByText('Excel 内容预览');
    expect(screen.getByText('将导出 1 行 × 4 列 · 测试活动_匹配结果_V2.xlsx')).not.toBeNull();
    expect(screen.getByText('张三')).not.toBeNull();
    expect(previewMatchExport).toHaveBeenCalledWith('event-1', expect.objectContaining({
      matchStatusId: 'run-1',
      expectedRevision: 3,
      relations: [{ sourceUserId: 'owner', targetUserId: 'target' }],
      columns: expect.not.arrayContaining([expect.objectContaining({ side: 'system' })]),
    }));

    fireEvent.click(screen.getByRole('button', { name: '导出 Excel（1 行）' }));
    await waitFor(() => expect(downloadMatchExport).toHaveBeenCalledWith(
      'event-1',
      expect.objectContaining({ previewDigest: 'digest-1' }),
    ));
  });
});
