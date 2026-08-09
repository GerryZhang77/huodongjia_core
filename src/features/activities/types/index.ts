/**
 * Activities Module - Type Definitions
 * 活动模块 - 类型定义
 */

/**
 * 活动状态
 */
export type ActivityStatus =
  | "recruiting" // 招募中
  | "recruiting_ended" // 招募结束
  | "ongoing" // 进行中
  | "ended" // 已结束
  | "cancelled"; // 已取消

/**
 * 活动分类
 */
export type ActivityCategory = string;

/**
 * 活动标签
 */
export type ActivityTag = string;

/**
 * 报名表字段类型
 */
export type FormFieldType =
  | "text"
  | "textarea"
  | "select"
  | "multi-select"
  | "radio"
  | "image";

/**
 * 报名表字段定义
 */
export interface RegistrationFormField {
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  preset: boolean; // 预设字段不可删除
  deletable?: boolean; // 预设字段中允许删除的（如性别）
  placeholder?: string;
  options?: string[]; // select/multi-select/radio 时的选项
  /** 图片字段最多允许上传的数量，后端仍会按 schema 再校验一次。 */
  maxImages?: number;
  /** 用户侧只读的选项名额状态，由活动详情接口实时注入，不写回表单 schema。 */
  optionAvailability?: Record<
    string,
    {
      capacity?: number;
      count?: number;
      remaining?: number;
      isFull: boolean;
      overLimit?: boolean;
      /** 编辑已占位报名时，允许保留当前已满选项。 */
      canKeepExisting?: boolean;
    }
  >;
}

export interface RegistrationOptionQuotaRule {
  optionValue: string;
  capacity: number;
}

export type RegistrationTypeEligibilityMode = "public" | "allowlist";

export interface RegistrationTypeMember {
  userId: string;
  name?: string | null;
  account?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

export interface ActivityRegistrationType {
  id?: string;
  name: string;
  description?: string | null;
  formSchema: RegistrationFormField[];
  eligibilityMode: RegistrationTypeEligibilityMode;
  isDefault: boolean;
  matchEnabled: boolean;
  sortOrder: number;
  /** 每个报名类型最多一个名额控制字段；仅支持必填的 radio/select。 */
  quotaFieldKey?: string | null;
  /** 未出现在规则中的选项表示不单独限制。 */
  quotaRules?: RegistrationOptionQuotaRule[];
  members: RegistrationTypeMember[];
}

/**
 * 活动实体
 */
export interface Activity {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  status: ActivityStatus;
  registrationStart: string;
  registrationEnd: string;
  activityStart: string;
  activityEnd: string;
  location: string;
  capacity: number;
  enrolledCount: number;
  /** pending + approved，真正占用活动总名额的人数。 */
  occupiedParticipants?: number;
  /** 累计报名记录，包含已拒绝/候补/取消。 */
  totalApplications?: number;
  remainingParticipants?: number | null;
  capacitySummary?: {
    maxParticipants: number;
    totalApplications: number;
    occupiedParticipants: number;
    pendingParticipants: number;
    approvedParticipants: number;
    rejectedParticipants: number;
    waitlistParticipants: number;
    cancelledParticipants: number;
    remainingParticipants: number | null;
    isUnlimited: boolean;
    isFull: boolean;
    overLimit: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  // 扩展字段 (from ActivityForm)
  category?: ActivityCategory;
  tags?: ActivityTag[];
  requirements?: string;
  contactInfo?: string;
  isPublic?: boolean;
  allowWaitlist?: boolean;
  enableNfc?: boolean;
  registrationFormSchema?: RegistrationFormField[] | null;
  registrationTypes?: ActivityRegistrationType[];
}

/**
 * 活动表单数据
 */
export interface ActivityFormData {
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  location: string;
  max_participants: number;
  registration_start: Date;
  registration_end: Date;
  category: ActivityCategory;
  tags: ActivityTag[];
  cover_image: string; // 必填字段（第一张图片作为封面）
  /**
   * 活动图片数组（最多9张）
   * 第一张图片将作为封面展示
   */
  images?: string[];
  requirements?: string;
  contact_info?: string;
  is_public: boolean;
  allow_waitlist: boolean;
  /**
   * 是否启用 NFC 碰一碰功能
   * 开启后，参与者可在活动现场通过 NFC 碰一碰功能快速交换联系方式
   */
  enable_nfc?: boolean;
  registration_form_schema?: RegistrationFormField[];
  registration_types?: ActivityRegistrationType[];
}

/**
 * 创建活动请求 (符合 OpenAPI 规范 - snake_case)
 */
export interface CreateActivityRequest {
  title: string;
  description: string;
  cover_image: string;
  images?: string[];
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  fee: number;
  category?: string;
  tags?: string[];
  requirements?: string;
  contact_info?: string;
  is_public?: boolean;
  allow_waitlist?: boolean;
  enable_nfc?: boolean;
  registration_start?: string;
  registration_deadline: string;
  registration_form_schema?: RegistrationFormField[];
  registration_types?: ActivityRegistrationType[];
}

/**
 * 更新活动请求
 */
export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  coverImage?: string;
  images?: string[];
  registrationStart?: string;
  registrationEnd?: string;
  activityStart?: string;
  activityEnd?: string;
  location?: string;
  capacity?: number;
  status?: ActivityStatus;
  category?: ActivityCategory;
  tags?: ActivityTag[];
  requirements?: string;
  contactInfo?: string;
  isPublic?: boolean;
  allowWaitlist?: boolean;
  enableNfc?: boolean;
  registrationFormSchema?: RegistrationFormField[];
  registrationTypes?: ActivityRegistrationType[];
}

/**
 * 活动分类选项
 */
export interface ActivityCategoryOption {
  label: string;
  value: ActivityCategory;
}

/**
 * 活动标签选项
 */
export interface ActivityTagOption {
  label: string;
  value: ActivityTag;
}

/**
 * 活动状态管理 State
 */
export interface ActivityState {
  currentActivity: Activity | null;
  activityList: Activity[];
  total: number;
  loading: boolean;
  setCurrentActivity: (activity: Activity | null) => void;
  setActivityList: (list: Activity[], total: number) => void;
  setLoading: (loading: boolean) => void;
  clearActivity: () => void;
}
