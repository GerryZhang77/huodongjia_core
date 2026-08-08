type IdentityCardField = {
  key?: unknown;
  label?: unknown;
};

export type IdentityCardInvalidReason =
  | "format"
  | "checksum"
  | "birth_date"
  | "province"
  | "precision_loss";

export type IdentityCardInspection =
  | { status: "missing" }
  | { status: "invalid"; reason: IdentityCardInvalidReason }
  | { status: "valid" };

const IDENTITY_CARD_ALIASES = [
  "身份证",
  "身份证号",
  "身份证号码",
  "公民身份号码",
  "idcard",
  "id_card",
  "identityCard",
  "identity_card",
  "citizenId",
];
const CHECKSUM_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const CHECKSUM_CODES = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
const PROVINCE_CODES = new Set([
  "11", "12", "13", "14", "15", "21", "22", "23", "31", "32", "33",
  "34", "35", "36", "37", "41", "42", "43", "44", "45", "46", "50",
  "51", "52", "53", "54", "61", "62", "63", "64", "65", "71", "81", "82",
]);

const normalizeFieldIdentity = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-:：/\\()（）[\]【】]/g, "");

const aliasSet = new Set(IDENTITY_CARD_ALIASES.map(normalizeFieldIdentity));

export const isIdentityCardField = (field: IdentityCardField): boolean =>
  [field.key, field.label]
    .map(normalizeFieldIdentity)
    .filter(Boolean)
    .some((identity) => aliasSet.has(identity));

const isRealDate = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export const inspectIdentityCard = (value: unknown): IdentityCardInspection => {
  // 身份证号一旦进入 JavaScript number，就可能已在调用本函数前丢失末位精度。
  // 不能再通过 String(value) 假装恢复，否则会误报为普通校验位错误。
  if (typeof value === "number") {
    return { status: "invalid", reason: "precision_loss" };
  }
  if (value == null || !String(value).trim()) return { status: "missing" };

  let normalized = String(value).trim().toUpperCase().replace(/\s+/g, "");
  if (/^\d{15}$/.test(normalized)) {
    normalized = `${normalized.slice(0, 6)}19${normalized.slice(6)}`;
    const checksum = CHECKSUM_WEIGHTS.reduce(
      (sum, weight, index) => sum + Number(normalized[index]) * weight,
      0,
    );
    normalized += CHECKSUM_CODES[checksum % 11];
  }

  if (!/^\d{17}[\dX]$/.test(normalized)) {
    return { status: "invalid", reason: "format" };
  }

  const checksum = CHECKSUM_WEIGHTS.reduce(
    (sum, weight, index) => sum + Number(normalized[index]) * weight,
    0,
  );
  if (CHECKSUM_CODES[checksum % 11] !== normalized[17]) {
    return { status: "invalid", reason: "checksum" };
  }

  const year = Number(normalized.slice(6, 10));
  const month = Number(normalized.slice(10, 12));
  const day = Number(normalized.slice(12, 14));
  const currentYear = new Date().getUTCFullYear();
  if (year < 1900 || year > currentYear || !isRealDate(year, month, day)) {
    return { status: "invalid", reason: "birth_date" };
  }

  if (!PROVINCE_CODES.has(normalized.slice(0, 2))) {
    return { status: "invalid", reason: "province" };
  }
  return { status: "valid" };
};

export const getIdentityCardValidationMessage = (
  reason: IdentityCardInvalidReason,
): string => {
  switch (reason) {
    case "precision_loss":
      return "身份证号码曾被按数字处理，内容可能已失真，请清空后重新输入";
    case "checksum":
      return "身份证号码校验位不正确，请检查后重新输入";
    case "birth_date":
      return "身份证号码中的出生日期不正确";
    case "province":
      return "身份证号码中的地区编码不正确";
    case "format":
    default:
      return "请输入15位或18位有效身份证号码";
  }
};

export const getIdentityCardFieldError = (
  field: IdentityCardField,
  value: unknown,
): string | null => {
  if (!isIdentityCardField(field)) return null;
  const inspection = inspectIdentityCard(value);
  return inspection.status === "invalid"
    ? getIdentityCardValidationMessage(inspection.reason)
    : null;
};
