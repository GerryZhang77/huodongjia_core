/**
 * Activities Module - Validation Utilities
 * 活动模块 - 表单验证工具
 */

import type { FormInstance } from "antd-mobile/es/components/form";

/**
 * 验证规则常量
 */
export const VALIDATION_RULES = {
  TITLE_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  REQUIREMENTS_MAX_LENGTH: 200,
  MIN_PARTICIPANTS: 1,
  MAX_PARTICIPANTS: 1000,
} as const;

/**
 * 验证活动标题
 */
export const validateTitle = [
  {
    required: true,
    message: "请输入活动标题",
  },
  {
    max: VALIDATION_RULES.TITLE_MAX_LENGTH,
    message: `活动标题不能超过${VALIDATION_RULES.TITLE_MAX_LENGTH}个字符`,
  },
  {
    min: 2,
    message: "活动标题至少需要2个字符",
  },
];

/**
 * 验证活动描述
 */
export const validateDescription = [
  {
    required: true,
    message: "请输入活动描述",
  },
  {
    max: VALIDATION_RULES.DESCRIPTION_MAX_LENGTH,
    message: `活动描述不能超过${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}个字符`,
  },
  {
    min: 10,
    message: "活动描述至少需要10个字符",
  },
];

/**
 * 验证活动地点
 */
export const validateLocation = [
  {
    required: true,
    message: "请输入活动地点",
  },
  {
    min: 2,
    message: "活动地点至少需要2个字符",
  },
];

/**
 * 验证参与人数
 */
export const validateParticipants = [
  {
    required: true,
    message: "请设置参与人数",
  },
];

/**
 * 创建时间验证器
 * @param form - 表单实例
 * @returns 验证函数
 */
export const createTimeValidator = (form: FormInstance) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (_: any, value: Date) => {
    const formValues = form.getFieldsValue();

    // 报名时间验证
    if (formValues.registration_start && formValues.registration_end) {
      if (formValues.registration_start >= formValues.registration_end) {
        return Promise.reject("报名结束时间必须晚于开始时间");
      }
    }

    // 活动时间验证
    if (formValues.start_time && formValues.end_time) {
      if (formValues.start_time >= formValues.end_time) {
        return Promise.reject("活动结束时间必须晚于开始时间");
      }
    }

    // 活动开始时间不能早于当前时间（创建模式）
    if (!formValues.id && value) {
      const now = new Date();
      if (value < now) {
        return Promise.reject("活动时间不能早于当前时间");
      }
    }

    return Promise.resolve();
  };
};

/**
 * 验证时间字段配置
 */
export const createTimeValidationRules = (
  form: FormInstance,
  fieldName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseRules: any[] = [
    {
      required: true,
      message: `请选择${getFieldLabel(fieldName)}`,
    },
  ];

  // 只有时间字段需要自定义验证器
  if (isTimeField(fieldName)) {
    baseRules.push({
      validator: createTimeValidator(form),
    });
  }

  return baseRules;
};

/**
 * 获取字段标签
 */
const getFieldLabel = (fieldName: string): string => {
  const labelMap: Record<string, string> = {
    registration_start: "报名开始时间",
    registration_end: "报名结束时间",
    start_time: "活动开始时间",
    end_time: "活动结束时间",
  };

  return labelMap[fieldName] || "时间";
};

/**
 * 判断是否为时间字段
 */
const isTimeField = (fieldName: string): boolean => {
  return [
    "registration_start",
    "registration_end",
    "start_time",
    "end_time",
  ].includes(fieldName);
};

/**
 * 验证联系方式（手机号或邮箱）
 */
export const validateContact = [
  {
    validator: (_: unknown, value: string) => {
      if (!value) return Promise.resolve();

      // 手机号正则
      const phoneRegex = /^1[3-9]\d{9}$/;
      // 邮箱正则
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (phoneRegex.test(value) || emailRegex.test(value)) {
        return Promise.resolve();
      }

      return Promise.reject("请输入有效的手机号或邮箱");
    },
  },
];
