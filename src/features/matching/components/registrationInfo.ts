const SENSITIVE_FIELD_PATTERN = /(手机|电话|mobile|phone|邮箱|email|身份证|证件|id.?card|微信|wechat|qq|地址|address|学号|student.?id|联系方式|contact)/i;
const DUPLICATE_FIELD_PATTERN = /^(姓名|name|头像|avatar|用户id|user.?id)$/i;

export type RegistrationInfoItem = {
  label: string;
  value: string;
  tags: string[] | null;
};

const formatScalar = (value: unknown): string => {
  if (typeof value === "boolean") return value ? "是" : "否";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  return "";
};

export const buildRegistrationInfoItems = (
  formData?: Record<string, unknown> | null,
  fieldLabels: Record<string, string> = {},
): RegistrationInfoItem[] => {
  if (!formData) return [];

  return Object.entries(formData).flatMap(([rawLabel, rawValue]) => {
    const fieldKey = rawLabel.trim();
    const label = String(fieldLabels[fieldKey] || fieldKey).trim();
    if (!label || SENSITIVE_FIELD_PATTERN.test(fieldKey) || SENSITIVE_FIELD_PATTERN.test(label) || DUPLICATE_FIELD_PATTERN.test(fieldKey) || DUPLICATE_FIELD_PATTERN.test(label)) return [];

    if (Array.isArray(rawValue)) {
      const tags = rawValue.map(formatScalar).filter(Boolean);
      return tags.length ? [{ label, value: tags.join("、"), tags }] : [];
    }

    if (rawValue && typeof rawValue === "object") {
      const parts = Object.entries(rawValue as Record<string, unknown>)
        .map(([key, value]) => {
          const formatted = formatScalar(value);
          return formatted ? `${key}：${formatted}` : "";
        })
        .filter(Boolean);
      return parts.length ? [{ label, value: parts.join("；"), tags: null }] : [];
    }

    const value = formatScalar(rawValue);
    return value ? [{ label, value, tags: null }] : [];
  });
};
