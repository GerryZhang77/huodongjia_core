import React, { useMemo } from "react";
import type {
  MatchExportColumn,
  MatchExportSystemField,
} from "@/features/matching/services/matchExportApi";
import type { MatchExportFieldOption } from "@/features/matching/utils/matchExportModel";

interface SystemInformationOption {
  field: MatchExportSystemField;
  label: string;
}

interface MatchExportContentOptionsProps {
  columns: MatchExportColumn[];
  fieldOptions: MatchExportFieldOption[];
  systemOptions: SystemInformationOption[];
  duplicateHeaders: Set<string>;
  onToggleField: (
    side: "source" | "target",
    option: MatchExportFieldOption,
  ) => void;
  onToggleSystemField: (field: MatchExportSystemField) => void;
  onUpdateHeader: (columnId: string, header: string) => void;
}

interface OptionRowProps {
  checked: boolean;
  checkboxLabel: string;
  label: string;
  scope?: string;
  header?: string;
  headerLabel: string;
  headerInvalid?: boolean;
  onToggle: () => void;
  onUpdateHeader: (header: string) => void;
}

const OptionRow: React.FC<OptionRowProps> = ({
  checked,
  checkboxLabel,
  label,
  scope,
  header = "",
  headerLabel,
  headerInvalid = false,
  onToggle,
  onUpdateHeader,
}) => (
  <div
    className={`grid grid-cols-[24px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[24px_minmax(180px,1fr)_minmax(220px,1fr)] ${
      checked ? "bg-primary-50/30" : "bg-white"
    }`}
  >
    <input
      aria-label={checkboxLabel}
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      className="h-4 w-4 rounded border-gray-300 text-primary-500"
    />
    <div className="min-w-0">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {scope ? (
        <span className="ml-2 inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
          {scope}
        </span>
      ) : null}
    </div>
    {checked ? (
      <input
        aria-label={headerLabel}
        value={header}
        maxLength={80}
        onChange={(event) => onUpdateHeader(event.target.value)}
        className={`col-start-2 h-9 w-full rounded-lg border px-3 text-sm focus:outline-none sm:col-start-auto ${
          headerInvalid
            ? "border-red-300 bg-red-50 focus:border-red-400"
            : "border-gray-200 bg-white focus:border-primary-400"
        }`}
      />
    ) : (
      <span className="col-start-2 text-xs text-gray-300 sm:col-start-auto">
        不导出
      </span>
    )}
  </div>
);

export const MatchExportContentOptions: React.FC<
  MatchExportContentOptionsProps
> = ({
  columns,
  fieldOptions,
  systemOptions,
  duplicateHeaders,
  onToggleField,
  onToggleSystemField,
  onUpdateHeader,
}) => {
  const columnMap = useMemo(
    () => new Map(columns.map((column) => [column.id, column])),
    [columns],
  );

  const getHeaderInvalid = (column?: MatchExportColumn) => {
    if (!column) return false;
    const normalized = column.header.trim().toLocaleLowerCase("zh-CN");
    return !normalized || duplicateHeaders.has(normalized);
  };

  const getScope = (option: MatchExportFieldOption) =>
    option.coveredTypeCount < option.totalTypeCount
      ? `仅${option.typeNames.join("、")}`
      : undefined;

  const renderRegistrationInformation = (
    side: "source" | "target",
    title: string,
  ) => (
    <section className="overflow-hidden rounded-xl border border-gray-200">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {fieldOptions.map((option) => {
          const column = columnMap.get(`${side}:${option.id}`);
          const informationName = `${title}${option.label}`;
          return (
            <OptionRow
              key={`${side}:${option.id}`}
              checked={Boolean(column)}
              checkboxLabel={`导出${informationName}`}
              label={option.label}
              scope={getScope(option)}
              header={column?.header}
              headerLabel={`${informationName}的Excel表头`}
              headerInvalid={getHeaderInvalid(column)}
              onToggle={() => onToggleField(side, option)}
              onUpdateHeader={(header) =>
                column ? onUpdateHeader(column.id, header) : undefined
              }
            />
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="space-y-4">
      <div className="hidden grid-cols-[24px_minmax(180px,1fr)_minmax(220px,1fr)] gap-3 px-4 text-xs font-medium text-gray-500 sm:grid">
        <span />
        <span>报名信息</span>
        <span>Excel 表头</span>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {renderRegistrationInformation("source", "参与者报名信息")}
        {renderRegistrationInformation("target", "匹配对象报名信息")}
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">匹配结果信息</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {systemOptions.map((option) => {
            const column = columnMap.get(`system:${option.field}`);
            return (
              <OptionRow
                key={option.field}
                checked={Boolean(column)}
                checkboxLabel={`导出${option.label}`}
                label={option.label}
                header={column?.header}
                headerLabel={`${option.label}的Excel表头`}
                headerInvalid={getHeaderInvalid(column)}
                onToggle={() => onToggleSystemField(option.field)}
                onUpdateHeader={(header) =>
                  column ? onUpdateHeader(column.id, header) : undefined
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};
