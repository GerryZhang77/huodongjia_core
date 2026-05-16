import type { RegistrationFormField } from "@/features/activities/types";
import type { PrefillField } from "../types";

/**
 * 在 prefill 数据里为单个 schema 字段查找匹配项
 * 匹配优先级：
 *   1. field.key 精确等于 prefill 的 field_key
 *   2. field.label 精确等于 prefill 的 field_label
 *   3. 把 field.key 或 field.label 经过 alias 反查得到标准 key，再用该 key 命中
 */
export function matchPrefillField(
  field: RegistrationFormField,
  prefillFields: PrefillField[],
  aliases: Record<string, string[]>,
): PrefillField | undefined {
  let hit = prefillFields.find((f) => f.field_key === field.key);
  if (hit) return hit;

  hit = prefillFields.find(
    (f) => f.field_label && f.field_label === field.label,
  );
  if (hit) return hit;

  const reverseAlias = new Map<string, string>();
  for (const [stdKey, list] of Object.entries(aliases)) {
    reverseAlias.set(stdKey.toLowerCase(), stdKey);
    for (const a of list) reverseAlias.set(a.toLowerCase(), stdKey);
  }

  const candidates = [field.key, field.label]
    .filter(Boolean)
    .map((s) => s!.toLowerCase());

  for (const c of candidates) {
    const stdKey = reverseAlias.get(c);
    if (!stdKey) continue;
    hit = prefillFields.find((f) => f.field_key === stdKey);
    if (hit) return hit;
  }
  return undefined;
}

/**
 * 将 prefill 命中转成表单值
 * - multi-select：拆分成数组
 * - 其它：原样字符串
 */
export function toFormValue(
  field: RegistrationFormField,
  prefill: PrefillField,
): string | string[] {
  const raw = prefill.field_value;
  if (field.type === "multi-select") {
    return raw
      .split(/[,，、\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return raw;
}

/**
 * 把字段类型映射为字段库存储的 field_type
 */
export function mapFieldTypeToStorage(
  type: RegistrationFormField["type"],
): string {
  switch (type) {
    case "multi-select":
      return "multiselect";
    case "select":
      return "select";
    case "textarea":
      return "textarea";
    case "radio":
      return "select";
    default:
      return "text";
  }
}
