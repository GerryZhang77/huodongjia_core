import type { RegistrationFormField } from "../types";

/**
 * 历史空名称字段曾被后端用 custom_* 技术 key 兜底成展示名称。
 * 这类名称不是面向用户的文案，只能由主办方重新命名或删除。
 */
export const isTechnicalFallbackRegistrationField = (
  field: Pick<RegistrationFormField, "key" | "label">,
): boolean => {
  const key = String(field.key || "").trim();
  const label = String(field.label || "").trim();
  return !label || (key.startsWith("custom_") && label === key);
};

export const normalizeRegistrationFieldForMerchant = (
  field: RegistrationFormField,
): RegistrationFormField =>
  isTechnicalFallbackRegistrationField(field)
    ? { ...field, label: "" }
    : field;

export const getParticipantVisibleRegistrationFields = (
  fields: RegistrationFormField[],
): RegistrationFormField[] =>
  fields.filter((field) => !isTechnicalFallbackRegistrationField(field));

export const findInvalidRegistrationFieldIndex = (
  fields: RegistrationFormField[],
): number => fields.findIndex(isTechnicalFallbackRegistrationField);

