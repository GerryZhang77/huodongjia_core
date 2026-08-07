import type { MatchingSchemaGroup } from '../types';
import type {
  MatchExportColumn,
  MatchExportFieldSource,
  MatchExportSide,
} from '../services/matchExportApi';

export interface MatchExportFieldOption {
  id: string;
  fieldKey: string;
  fieldType: string;
  label: string;
  typeNames: string[];
  sources: MatchExportFieldSource[];
  coveredTypeCount: number;
  totalTypeCount: number;
}

export const getMatchExportRelationKey = (
  sourceUserId: string,
  targetUserId: string,
): string => `${sourceUserId}::${targetUserId}`;

export const normalizeExportRegistrationTypeId = (
  group: MatchingSchemaGroup,
): string | null =>
  group.id && !String(group.id).startsWith('__default__')
    ? String(group.id)
    : null;

export function buildMatchExportFieldOptions(
  groups: MatchingSchemaGroup[],
): MatchExportFieldOption[] {
  const totalTypeCount = Math.max(1, groups.length);
  const grouped = new Map<string, MatchExportFieldOption>();

  for (const group of groups) {
    const registrationTypeId = normalizeExportRegistrationTypeId(group);
    for (const field of group.fields) {
      if (!field.key || field.type === 'image') continue;
      const identity = `${field.key}:${field.type}`;
      const current = grouped.get(identity);
      const source = { registrationTypeId, fieldKey: field.key };
      if (current) {
        if (!current.sources.some((item) =>
          item.registrationTypeId === source.registrationTypeId && item.fieldKey === source.fieldKey)) {
          current.sources.push(source);
          current.typeNames.push(group.name);
          current.coveredTypeCount += 1;
        }
        continue;
      }
      grouped.set(identity, {
        id: identity,
        fieldKey: field.key,
        fieldType: field.type,
        label: field.label,
        typeNames: [group.name],
        sources: [source],
        coveredTypeCount: 1,
        totalTypeCount,
      });
    }
  }

  return Array.from(grouped.values());
}

export function getDefaultMatchExportHeader(
  side: Exclude<MatchExportSide, 'system'>,
  option: MatchExportFieldOption,
): string {
  const prefix = side === 'source' ? '' : '匹配对象-';
  if (option.coveredTypeCount >= option.totalTypeCount) {
    return `${prefix}${option.label}`;
  }
  const scope = option.typeNames.length <= 2
    ? option.typeNames.join('、')
    : '部分报名类型';
  return `${prefix}${option.label}（${scope}）`;
}

export function createFieldExportColumn(
  side: Exclude<MatchExportSide, 'system'>,
  option: MatchExportFieldOption,
): MatchExportColumn {
  return {
    id: `${side}:${option.id}`,
    header: getDefaultMatchExportHeader(side, option),
    side,
    fieldSources: option.sources,
  };
}

export function createDefaultMatchExportColumns(
  options: MatchExportFieldOption[],
): MatchExportColumn[] {
  const preferred = options.filter((option) => ['name', 'phone'].includes(option.fieldKey));
  const selected = preferred.length > 0 ? preferred : options.slice(0, 2);
  return [
    ...selected.map((option) => createFieldExportColumn('source', option)),
    ...selected.map((option) => createFieldExportColumn('target', option)),
  ];
}
