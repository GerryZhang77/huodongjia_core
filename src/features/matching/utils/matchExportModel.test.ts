import { describe, expect, it } from 'vitest';
import {
  buildMatchExportFieldOptions,
  createDefaultMatchExportColumns,
  getDefaultMatchExportHeader,
} from './matchExportModel';

describe('matchExportModel', () => {
  it('merges stable fields across registration types and marks type-specific fields', () => {
    const options = buildMatchExportFieldOptions([
      {
        id: 'regular',
        name: '普通报名',
        fields: [
          { key: 'name', label: '姓名', type: 'text', required: true, preset: true },
          { key: 'phone', label: '手机号', type: 'text', required: true, preset: true },
        ],
      },
      {
        id: 'guest',
        name: '嘉宾',
        fields: [
          { key: 'name', label: '姓名', type: 'text', required: true, preset: true },
          { key: 'phone', label: '手机号', type: 'text', required: true, preset: true },
          { key: 'company', label: '公司', type: 'text', required: false, preset: false },
          { key: 'photos', label: '照片', type: 'image', required: false, preset: false },
        ],
      },
    ]);

    const name = options.find((option) => option.fieldKey === 'name')!;
    const company = options.find((option) => option.fieldKey === 'company')!;
    expect(name.sources).toHaveLength(2);
    expect(getDefaultMatchExportHeader('source', name)).toBe('姓名');
    expect(getDefaultMatchExportHeader('target', company)).toBe('匹配对象-公司（嘉宾）');
    expect(options.some((option) => option.fieldKey === 'photos')).toBe(false);
  });

  it('defaults to explicit form fields without hidden matching metadata', () => {
    const options = buildMatchExportFieldOptions([{
      id: 'regular',
      name: '普通报名',
      fields: [
        { key: 'name', label: '姓名', type: 'text', required: true, preset: true },
        { key: 'phone', label: '手机号', type: 'text', required: true, preset: true },
      ],
    }]);
    const columns = createDefaultMatchExportColumns(options);
    expect(columns.map((column) => column.header)).toEqual([
      '姓名',
      '手机号',
      '匹配对象-姓名',
      '匹配对象-手机号',
    ]);
    expect(columns.some((column) => column.side === 'system')).toBe(false);
  });
});
