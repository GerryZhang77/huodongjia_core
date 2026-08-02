const STANDARD_FIELD_LABELS: Record<string, string> = {
  name: "姓名",
  account: "账号",
  gender: "性别",
  age: "年龄",
  birthday: "生日",
  zodiac: "星座",
  mbti: "MBTI",
  phone: "手机号",
  email: "邮箱",
  occupation: "职业",
  company: "公司",
  industry: "行业",
  position: "职位",
  city: "城市",
  interests: "兴趣爱好",
  tags: "标签",
  skills: "技能",
  bio: "个人简介",
  matchingNeeds: "匹配需求",
  matching_needs: "匹配需求",
  department: "所在职能部门",
  industryDirection: "关注/从事的行业方向",
  industry_direction: "关注/从事的行业方向",
  softwareSkills: "软件技能",
  software_skills: "软件技能",
  expertise: "擅长领域",
};

const STANDARD_FIELD_ALIASES: Record<string, string[]> = {
  name: ["姓名", "名字", "真实姓名", "fullName", "full_name"],
  gender: ["性别", "sex"],
  age: ["年龄"],
  birthday: [
    "生日",
    "出生日期",
    "出生年月",
    "出生年月日",
    "birthdate",
    "birth_date",
    "date_of_birth",
    "dob",
  ],
  zodiac: [
    "星座",
    "太阳星座",
    "zodiac",
    "zodiac_sign",
    "constellation",
    "star_sign",
    "horoscope",
  ],
  mbti: [
    "MBTI",
    "人格类型",
    "性格类型",
    "16型人格",
    "十六型人格",
    "mbti_type",
    "personality_type",
    "16personalities",
  ],
  phone: ["手机号", "手机", "电话", "联系电话", "联系方式", "mobile", "tel"],
  email: ["邮箱", "电子邮箱", "邮件", "e-mail", "mail"],
  occupation: ["职业", "岗位", "工作", "job"],
  company: ["公司", "单位", "企业", "工作单位", "所在公司", "公司名称", "organization", "org"],
  industry: ["行业", "所属行业", "行业方向", "sector"],
  position: ["职位", "职务", "头衔", "title", "jobTitle", "job_title"],
  city: ["城市", "所在城市", "地区", "所在地", "location"],
  interests: ["兴趣爱好", "兴趣", "爱好", "hobby", "hobbies"],
  tags: ["标签", "兴趣标签", "用户标签"],
  skills: ["技能", "技能特长", "软件技能", "软件工具", "tools"],
  bio: ["个人简介", "简介", "自我介绍", "个人介绍", "introduction", "about"],
  matchingNeeds: ["匹配需求", "需求", "期望", "匹配期望", "matching_needs", "needs"],
  department: ["所在职能部门", "职能部门", "部门", "所在部门"],
  industryDirection: [
    "关注/从事的行业方向",
    "关注从事的行业方向",
    "industry_direction",
  ],
  softwareSkills: ["软件技能", "software_skills"],
  expertise: ["擅长领域", "擅长", "专长领域", "专业领域"],
};

const normalizeFieldName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_:：/\\()（）[\]【】-]/g, "");

const resolveStandardFieldKey = (fieldName?: string): string | null => {
  const normalized = normalizeFieldName(fieldName || "");
  if (!normalized) return null;

  for (const [key, label] of Object.entries(STANDARD_FIELD_LABELS)) {
    if (
      [key, label, ...(STANDARD_FIELD_ALIASES[key] || [])].some(
        (candidate) => normalizeFieldName(candidate) === normalized,
      )
    ) {
      return key;
    }
  }

  return null;
};

export type MatchFieldSemanticType = "birthday" | "zodiac" | "mbti";

export const getMatchFieldSemanticType = (
  fieldKey?: string,
  fieldLabel?: string,
): MatchFieldSemanticType | undefined => {
  const standardKey =
    resolveStandardFieldKey(fieldKey) || resolveStandardFieldKey(fieldLabel);

  return standardKey === "birthday" ||
    standardKey === "zodiac" ||
    standardKey === "mbti"
    ? standardKey
    : undefined;
};

export const getStandardFieldLabel = (
  fieldKey?: string,
  fallbackLabel?: string,
): string => {
  const canonicalFromKey = resolveStandardFieldKey(fieldKey);
  if (canonicalFromKey) return STANDARD_FIELD_LABELS[canonicalFromKey];

  const canonicalFromFallback = resolveStandardFieldKey(fallbackLabel);
  if (canonicalFromFallback) return STANDARD_FIELD_LABELS[canonicalFromFallback];

  return (fallbackLabel || fieldKey || "").trim();
};
