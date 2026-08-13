import type { Enrollment } from "@/types/enrollment";
import {
  ENROLLMENT_FIELD_ALIASES,
  identifyStandardEnrollmentField,
  normalizeEnrollmentGender,
  resolveEnrollmentFormGender,
  resolveEnrollmentFormName,
  resolveEnrollmentFormValue,
  type StandardEnrollmentField,
} from "./enrollmentFieldResolver";

export interface EnrollmentExportField {
  key: string;
  label: string;
  enabled: boolean;
  source: "system" | "form";
  semantic?: StandardEnrollmentField;
  stableKeys?: string[];
  labels?: string[];
}

type EnrollmentSchemaField = NonNullable<Enrollment["formSchemaSnapshot"]>[number];

export interface EnrollmentExportRegistrationType {
  id?: string | null;
  name?: string | null;
  formSchema?: EnrollmentSchemaField[] | null;
}

export interface EnrollmentExportFieldOptions {
  registrationFormSchema?: EnrollmentSchemaField[] | null;
  registrationTypes?: EnrollmentExportRegistrationType[] | null;
}

const LEADING_SYSTEM_EXPORT_FIELDS: EnrollmentExportField[] = [
  { key: "index", label: "序号", enabled: true, source: "system" },
];

const TRAILING_SYSTEM_EXPORT_FIELDS: EnrollmentExportField[] = [
  {
    key: "registrationTypeName",
    label: "报名类型",
    enabled: true,
    source: "system",
  },
  { key: "status", label: "状态", enabled: true, source: "system" },
  {
    key: "enrolledAt",
    label: "报名时间",
    enabled: true,
    source: "system",
  },
];

const SYSTEM_EXPORT_FIELD_LABELS = new Set(
  [...LEADING_SYSTEM_EXPORT_FIELDS, ...TRAILING_SYSTEM_EXPORT_FIELDS].map(
    (field) => field.label,
  ),
);

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

function normalizeFieldIdentity(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function getRepresentedCurrentSchemas(
  enrollments: Enrollment[],
  options: EnrollmentExportFieldOptions,
): EnrollmentSchemaField[][] {
  const registrationTypes = options.registrationTypes || [];
  const representedTypeIds = new Set(
    enrollments
      .map((enrollment) => enrollment.registrationTypeId)
      .filter((id): id is string => Boolean(id)),
  );
  const hasUntypedEnrollment = enrollments.some(
    (enrollment) => !enrollment.registrationTypeId,
  );
  const schemas = registrationTypes
    .filter(
      (registrationType) =>
        registrationType.id && representedTypeIds.has(registrationType.id),
    )
    .map((registrationType) => registrationType.formSchema || [])
    .filter((schema) => schema.length > 0);

  if (
    options.registrationFormSchema?.length
    && (hasUntypedEnrollment || registrationTypes.length === 0)
  ) {
    schemas.push(options.registrationFormSchema);
  }

  return schemas;
}

export function collectEnrollmentExportFields(
  enrollments: Enrollment[],
  options: EnrollmentExportFieldOptions = {},
): EnrollmentExportField[] {
  const fields: EnrollmentExportField[] = [];
  const bySemantic = new Map<StandardEnrollmentField, EnrollmentExportField>();
  const byStableKey = new Map<string, EnrollmentExportField>();
  const byLabel = new Map<string, EnrollmentExportField>();
  const currentSchemas = getRepresentedCurrentSchemas(enrollments, options);
  const allSchemaFields = [
    ...currentSchemas.flat(),
    ...enrollments.flatMap((enrollment) => enrollment.formSchemaSnapshot || []),
  ];
  const imageFieldIdentities = new Set(
    allSchemaFields
      .filter((field) => field.type === "image")
      .flatMap((field) => [field.key, field.label])
      .map(normalizeFieldIdentity)
      .filter(Boolean),
  );

  const append = (rawLabel: string, stableKey?: string, type?: string) => {
    const label = rawLabel.trim();
    const normalizedStableKey = stableKey?.trim();
    if (
      !label
      || type === "image"
      || SYSTEM_EXPORT_FIELD_LABELS.has(label)
      || isTechnicalFieldLabel(label)
      || imageFieldIdentities.has(normalizeFieldIdentity(label))
      || imageFieldIdentities.has(normalizeFieldIdentity(normalizedStableKey))
    ) {
      return;
    }

    const semantic = identifyStandardEnrollmentField(normalizedStableKey, label);
    const normalizedLabel = normalizeFieldIdentity(label);
    const existing =
      (semantic ? bySemantic.get(semantic) : undefined)
      || (normalizedStableKey ? byStableKey.get(normalizedStableKey) : undefined)
      || byLabel.get(normalizedLabel);

    if (existing) {
      existing.stableKeys = uniqueStrings([
        ...(existing.stableKeys || []),
        normalizedStableKey,
      ]);
      existing.labels = uniqueStrings([...(existing.labels || []), label]);
      if (normalizedStableKey) byStableKey.set(normalizedStableKey, existing);
      byLabel.set(normalizedLabel, existing);
      if (semantic) bySemantic.set(semantic, existing);
      return;
    }

    const field: EnrollmentExportField = {
      key: semantic
        ? `form:standard:${semantic}`
        : normalizedStableKey
          ? `form:key:${normalizedStableKey}`
          : `form:label:${normalizedLabel}`,
      label,
      enabled: true,
      source: "form",
      semantic,
      stableKeys: uniqueStrings([normalizedStableKey]),
      labels: [label],
    };
    fields.push(field);
    if (semantic) bySemantic.set(semantic, field);
    if (normalizedStableKey) byStableKey.set(normalizedStableKey, field);
    byLabel.set(normalizedLabel, field);
  };

  for (const schema of currentSchemas) {
    for (const field of schema) {
      append(String(field.label || field.key || ""), field.key, field.type);
    }
  }

  for (const enrollment of enrollments) {
    for (const field of enrollment.formSchemaSnapshot || []) {
      append(String(field.label || field.key || ""), field.key, field.type);
    }
    for (const source of [
      enrollment.formData,
      enrollment.customFields,
      enrollment.formAnswers,
    ]) {
      if (!isRecord(source)) continue;
      for (const key of Object.keys(source)) {
        const schemaField = allSchemaFields.find(
          (field) => field.key === key || field.label === key,
        );
        append(schemaField?.label || key, schemaField?.key, schemaField?.type);
      }
    }
  }
  return fields;
}

export function buildEnrollmentExportFields(
  enrollments: Enrollment[],
  options: EnrollmentExportFieldOptions = {},
): EnrollmentExportField[] {
  return [
    ...LEADING_SYSTEM_EXPORT_FIELDS.map((field) => ({ ...field })),
    ...collectEnrollmentExportFields(enrollments, options),
    ...TRAILING_SYSTEM_EXPORT_FIELDS.map((field) => ({ ...field })),
  ];
}

function getFormFieldValue(
  enrollment: Enrollment,
  field: EnrollmentExportField,
): string | number {
  if (field.semantic === "name") return getEnrollmentExportName(enrollment);
  if (field.semantic === "gender") return getEnrollmentExportGender(enrollment);

  const semanticAliases = field.semantic
    ? [...ENROLLMENT_FIELD_ALIASES[field.semantic]]
    : [];
  return toEnrollmentExportValue(
    resolveEnrollmentFormValue(enrollment, [
      ...(field.stableKeys || []),
      ...(field.labels || []),
      ...semanticAliases,
    ]),
  );
}

export function buildEnrollmentExportRow(
  enrollment: Enrollment,
  index: number,
  fields: EnrollmentExportField[],
): Record<string, string | number> {
  const row: Record<string, string | number> = {};

  for (const field of fields) {
    switch (field.key) {
      case "index":
        row[field.label] = index + 1;
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
        if (field.source === "form") row[field.label] = getFormFieldValue(enrollment, field);
        break;
    }
  }
  return row;
}
