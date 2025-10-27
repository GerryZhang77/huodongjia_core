/**
 * Activities Module - Constants
 * 活动模块 - 常量定义
 */

import type { ActivityCategoryOption, ActivityTagOption } from "../types";

/**
 * 活动分类选项
 */
export const ACTIVITY_CATEGORY_OPTIONS: ActivityCategoryOption[] = [
  { label: "商务会议", value: "business" },
  { label: "技术交流", value: "tech" },
  { label: "社交聚会", value: "social" },
  { label: "培训学习", value: "training" },
  { label: "文化活动", value: "culture" },
  { label: "体育运动", value: "sports" },
  { label: "其他", value: "other" },
];

/**
 * 活动标签选项
 */
export const ACTIVITY_TAG_OPTIONS: ActivityTagOption[] = [
  { label: "线上", value: "online" },
  { label: "线下", value: "offline" },
  { label: "免费", value: "free" },
  { label: "付费", value: "paid" },
  { label: "限时", value: "limited" },
  { label: "热门", value: "popular" },
  { label: "新手友好", value: "beginner" },
  { label: "专业级", value: "professional" },
];

/**
 * 默认封面图片生成 URL
 */
export const DEFAULT_COVER_IMAGE_URL =
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=event%20activity%20default%20cover%20modern%20design&image_size=landscape_16_9";

/**
 * 表单验证规则
 */
export const FORM_VALIDATION = {
  TITLE_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  REQUIREMENTS_MAX_LENGTH: 200,
  MIN_PARTICIPANTS: 1,
  MAX_PARTICIPANTS: 1000,
} as const;

/**
 * 日期时间默认值 (新建活动时)
 */
export const getDefaultDateTimes = () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    registration_start: now,
    registration_end: tomorrow,
    start_time: tomorrow,
    end_time: nextWeek,
  };
};

/**
 * 导出简短别名 (用于组件内部)
 */
export const CATEGORY_OPTIONS = ACTIVITY_CATEGORY_OPTIONS;
export const TAG_OPTIONS = ACTIVITY_TAG_OPTIONS;
