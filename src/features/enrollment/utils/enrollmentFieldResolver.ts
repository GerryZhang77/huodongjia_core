import type { Enrollment, Gender } from "@/types/enrollment";

type EnrollmentFieldSource = Pick<
  Enrollment,
  "formAnswers" | "formData" | "customFields" | "formSchemaSnapshot"
>;

export const ENROLLMENT_FIELD_ALIASES = {
  name: ["name", "姓名", "真实姓名", "名字", "fullName", "full_name"],
  gender: ["gender", "性别", "sex"],
  age: ["age", "年龄"],
  phone: ["phone", "手机号", "手机", "电话", "联系方式", "联系电话"],
  email: ["email", "邮箱", "电子邮箱"],
  occupation: ["occupation", "职业", "岗位", "职位"],
  company: ["company", "公司", "单位", "工作单位", "工作单位名称"],
  industry: ["industry", "行业", "所属行业", "关注/从事的行业方向"],
  city: ["city", "城市", "所在城市", "所在地"],
  interests: ["interests", "tags", "兴趣爱好", "兴趣", "爱好", "兴趣标签"],
  bio: ["bio", "个人简介", "简介", "自我介绍"],
  matchingNeeds: ["matchingNeeds", "matching_needs", "匹配需求"],
} as const;

export type StandardEnrollmentField = keyof typeof ENROLLMENT_FIELD_ALIASES;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasEnrollmentFieldValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

function normalizeIdentity(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function readFirstValue(
  sources: Array<Record<string, unknown> | undefined>,
  candidates: string[],
): unknown {
  for (const source of sources) {
    if (!source) continue;
    for (const candidate of candidates) {
      if (!Object.prototype.hasOwnProperty.call(source, candidate)) continue;
      const value = source[candidate];
      if (hasEnrollmentFieldValue(value)) return value;
    }
  }
  return undefined;
}

export function resolveEnrollmentFormValue(
  enrollment: EnrollmentFieldSource,
  candidates: readonly string[],
): unknown {
  const normalizedCandidates = new Set(candidates.map(normalizeIdentity));
  const formAnswers = isRecord(enrollment.formAnswers)
    ? enrollment.formAnswers
    : undefined;
  const formData = isRecord(enrollment.formData) ? enrollment.formData : undefined;
  const customFields = isRecord(enrollment.customFields)
    ? enrollment.customFields
    : undefined;
  const sources = [formAnswers, formData, customFields];

  for (const field of enrollment.formSchemaSnapshot || []) {
    if (
      !normalizedCandidates.has(normalizeIdentity(field.key))
      && !normalizedCandidates.has(normalizeIdentity(field.label))
    ) {
      continue;
    }
    const value = readFirstValue(sources, [field.key, field.label]);
    if (hasEnrollmentFieldValue(value)) return value;
  }

  for (const source of sources) {
    if (!source) continue;
    for (const [key, value] of Object.entries(source)) {
      if (
        normalizedCandidates.has(normalizeIdentity(key))
        && hasEnrollmentFieldValue(value)
      ) {
        return value;
      }
    }
  }
  return undefined;
}

export function resolveStandardEnrollmentFormValue(
  enrollment: EnrollmentFieldSource,
  field: StandardEnrollmentField,
): unknown {
  return resolveEnrollmentFormValue(enrollment, ENROLLMENT_FIELD_ALIASES[field]);
}

export function identifyStandardEnrollmentField(
  ...identities: unknown[]
): StandardEnrollmentField | undefined {
  const normalizedIdentities = new Set(
    identities.map(normalizeIdentity).filter(Boolean),
  );

  for (const [field, aliases] of Object.entries(ENROLLMENT_FIELD_ALIASES)) {
    if (aliases.some((alias) => normalizedIdentities.has(normalizeIdentity(alias)))) {
      return field as StandardEnrollmentField;
    }
  }

  return undefined;
}

export function normalizeEnrollmentGender(value: unknown): Gender | undefined {
  const normalized = normalizeIdentity(value);
  if (["男", "male", "m", "男性", "男生"].includes(normalized)) return "male";
  if (["女", "female", "f", "女性", "女生"].includes(normalized)) return "female";
  if (["其他", "other", "非二元", "保密", "不便透露"].includes(normalized)) {
    return "other";
  }
  return undefined;
}

export function resolveEnrollmentFormName(enrollment: EnrollmentFieldSource): string {
  const value = resolveStandardEnrollmentFormValue(enrollment, "name");
  return hasEnrollmentFieldValue(value) ? String(value).trim() : "";
}

export function resolveEnrollmentFormGender(
  enrollment: EnrollmentFieldSource,
): Gender | undefined {
  return normalizeEnrollmentGender(
    resolveStandardEnrollmentFormValue(enrollment, "gender"),
  );
}
