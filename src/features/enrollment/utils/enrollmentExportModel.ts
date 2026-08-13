import type { Enrollment } from "@/types/enrollment";
import {
  hasEnrollmentFieldValue,
  normalizeEnrollmentGender,
  resolveEnrollmentFormGender,
  resolveEnrollmentFormName,
  resolveEnrollmentFormValue,
  resolveStandardEnrollmentFormValue,
  type StandardEnrollmentField,
} from "./enrollmentFieldResolver";

export interface EnrollmentExportField {
  key: string;
  label: string;
  enabled: boolean;
}

export const CUSTOM_ENROLLMENT_EXPORT_FIELD_PREFIX = "custom:";
const SCHEMA_ENROLLMENT_EXPORT_FIELD_PREFIX = "schema:";

export const DEFAULT_ENROLLMENT_EXPORT_FIELDS: EnrollmentExportField[] = [
  { key: "index", label: "序号", enabled: true },
  { key: "name", label: "姓名", enabled: true },
  { key: "gender", label: "性别", enabled: true },
  { key: "age", label: "年龄", enabled: true },
  { key: "phone", label: "手机号", enabled: true },
  { key: "email", label: "邮箱", enabled: true },
  { key: "occupation", label: "职业", enabled: true },
  { key: "company", label: "公司", enabled: true },
  { key: "city", label: "城市", enabled: true },
  { key: "tags", label: "兴趣标签", enabled: true },
  { key: "registrationTypeName", label: "报名类型", enabled: true },
  { key: "bio", label: "个人简介", enabled: false },
  { key: "matchingNeeds", label: "匹配需求", enabled: false },
  { key: "status", label: "状态", enabled: true },
  { key: "enrolledAt", label: "报名时间", enabled: true },
];

const STATUS_LABELS: Record<string, string> = {
  approved: "已通过",
  pending: "待审核",
  rejected: "已拒绝",
  cancelled: "已取消",
  waitlist: "候补",
};

const GENDER_LABELS = {
  male: "男",
  female: "女",
  other: "其他",
} as const;

const RESERVED_CUSTOM_FIELD_LABELS = new Set([
  ...DEFAULT_ENROLLMENT_EXPORT_FIELDS.map((field) => field.label),
  "姓名",
  "性别",
  "年龄",
  "手机号",
  "手机",
  "电话",
  "邮箱",
  "职业",
  "公司",
  "城市",
  "兴趣标签",
  "标签",
  "个人简介",
  "匹配需求",
  "状态",
  "报名时间",
  "更新时间",
  "name",
  "gender",
  "sex",
  "age",
  "phone",
  "email",
  "occupation",
  "company",
  "industry",
  "city",
  "bio",
  "matchingNeeds",
  "matching_needs",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTechnicalFieldLabel(value: string): boolean {
  return /^custom_(?:legacy_)?[a-z0-9_-]+$/i.test(value.trim());
}

export function toEnrollmentExportValue(value: unknown): string | number {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? "是" : "否";
  if (Array.isArray(value)) return value.map(String).join("、");
  if (isRecord(value)) return JSON.stringify(value);
  return String(value);
}

export function getEnrollmentExportName(enrollment: Enrollment): string {
  return (
    resolveEnrollmentFormName(enrollment)
    || enrollment.formName?.trim()
    || enrollment.profileName?.trim()
    || enrollment.name?.trim()
    || ""
  );
}

export function getEnrollmentExportGender(enrollment: Enrollment): string {
  const gender =
    resolveEnrollmentFormGender(enrollment)
    || normalizeEnrollmentGender(enrollment.gender);
  return gender ? GENDER_LABELS[gender] : "";
}

export function getEnrollmentCustomExportValue(
  enrollment: Enrollment,
  label: string,
  stableKey?: string,
): string | number {
  return toEnrollmentExportValue(
    resolveEnrollmentFormValue(enrollment, stableKey ? [stableKey, label] : [label]),
  );
}

export function collectEnrollmentExportFields(
  enrollments: Enrollment[],
): EnrollmentExportField[] {
  const seen = new Set(RESERVED_CUSTOM_FIELD_LABELS);
  const fields: EnrollmentExportField[] = [];
  const append = (rawLabel: string, stableKey?: string) => {
    const label = rawLabel.trim();
    if (!label || seen.has(label) || isTechnicalFieldLabel(label)) return;
    seen.add(label);
    fields.push({
      key: stableKey
        ? `${SCHEMA_ENROLLMENT_EXPORT_FIELD_PREFIX}${stableKey}`
        : `${CUSTOM_ENROLLMENT_EXPORT_FIELD_PREFIX}${label}`,
      label,
      enabled: true,
    });
  };

  for (const enrollment of enrollments) {
    for (const field of enrollment.formSchemaSnapshot || []) {
      if (field.type === "image") continue;
      append(String(field.label || field.key || ""), field.key);
    }
    for (const source of [
      enrollment.formData,
      enrollment.customFields,
      enrollment.formAnswers,
    ]) {
      if (!isRecord(source)) continue;
      for (const key of Object.keys(source)) {
        const schemaField = enrollment.formSchemaSnapshot?.find(
          (field) => field.key === key,
        );
        if (schemaField?.type === "image") continue;
        append(schemaField?.label || key, schemaField?.key);
      }
    }
  }
  return fields;
}

function getStandardFieldValue(
  enrollment: Enrollment,
  field: StandardEnrollmentField,
  fallback: unknown,
): string | number {
  const formValue = resolveStandardEnrollmentFormValue(enrollment, field);
  return toEnrollmentExportValue(
    hasEnrollmentFieldValue(formValue) ? formValue : fallback,
  );
}

export function buildEnrollmentExportRow(
  enrollment: Enrollment,
  index: number,
  fields: EnrollmentExportField[] = DEFAULT_ENROLLMENT_EXPORT_FIELDS,
): Record<string, string | number> {
  const row: Record<string, string | number> = {};

  for (const field of fields) {
    switch (field.key) {
      case "index":
        row[field.label] = index + 1;
        break;
      case "name":
        row[field.label] = getEnrollmentExportName(enrollment);
        break;
      case "gender":
        row[field.label] = getEnrollmentExportGender(enrollment);
        break;
      case "age":
      case "phone":
      case "email":
      case "occupation":
      case "company":
      case "industry":
      case "city":
      case "bio":
      case "matchingNeeds":
        row[field.label] = getStandardFieldValue(
          enrollment,
          field.key,
          enrollment[field.key],
        );
        break;
      case "tags":
        row[field.label] = enrollment.tags?.join("、") || "";
        break;
      case "registrationTypeName":
        row[field.label] = enrollment.registrationTypeName || "";
        break;
      case "status":
        row[field.label] = STATUS_LABELS[enrollment.status] || enrollment.status;
        break;
      case "enrolledAt":
        row[field.label] = enrollment.enrolledAt
          ? new Date(enrollment.enrolledAt).toLocaleString("zh-CN")
          : "";
        break;
      case "updatedAt":
        row[field.label] = enrollment.updatedAt
          ? new Date(enrollment.updatedAt).toLocaleString("zh-CN")
          : "";
        break;
      default:
        if (
          field.key.startsWith(CUSTOM_ENROLLMENT_EXPORT_FIELD_PREFIX)
          || field.key.startsWith(SCHEMA_ENROLLMENT_EXPORT_FIELD_PREFIX)
        ) {
          const stableKey = field.key.startsWith(SCHEMA_ENROLLMENT_EXPORT_FIELD_PREFIX)
            ? field.key.slice(SCHEMA_ENROLLMENT_EXPORT_FIELD_PREFIX.length)
            : undefined;
          row[field.label] = getEnrollmentCustomExportValue(
            enrollment,
            field.label,
            stableKey,
          );
        }
        break;
    }
  }
  return row;
}
