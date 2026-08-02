import type { FC } from "react";
import type { MatchExplanationField } from "@/features/user/services/matchApi";
import { getStandardFieldLabel } from "@/utils/fieldLabels";
import { CompatibilityInsightPopover } from "./CompatibilityInsightPopover";

interface MatchExplanationCardProps {
  field: MatchExplanationField;
  canLoadInsight?: boolean;
  onOpenInsight?: () => void;
}

const formatFieldValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.join("、");
  if (value === null || value === undefined || value === "") return "未填写";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export const MatchExplanationCard: FC<MatchExplanationCardProps> = ({
  field,
  canLoadInsight = false,
  onOpenInsight,
}) => {
  const sourceLabel = getStandardFieldLabel(
    field.source_field,
    field.source_label || field.source_field,
  );
  const targetLabel = getStandardFieldLabel(
    field.target_field,
    field.target_label || field.target_field,
  );
  const fieldLabel =
    targetLabel && targetLabel !== sourceLabel
      ? `${sourceLabel} 与 ${targetLabel}`
      : sourceLabel;

  return (
    <CompatibilityInsightPopover
      fieldLabel={fieldLabel}
      insight={field.compatibility_insight}
      canLoad={canLoadInsight}
      triggerVariant="card"
      onOpenIntent={onOpenInsight}
      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 pr-6">
        <span className="text-sm font-semibold text-gray-900">
          {fieldLabel}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 text-gray-500">我的选择</span>
          <span className="break-words text-right text-gray-900">
            {formatFieldValue(field.current_user_value)}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 text-gray-500">对方选择</span>
          <span className="break-words text-right text-gray-900">
            {formatFieldValue(field.target_user_value)}
          </span>
        </div>
      </div>
    </CompatibilityInsightPopover>
  );
};
