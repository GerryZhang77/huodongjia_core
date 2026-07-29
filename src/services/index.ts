/**
 * Services - API 统一导出
 *
 * 这是底层 API 调用层，与后端接口 1:1 对应
 * 所有 features 模块应该导入这里的 API 函数
 *
 * @example
 * ```typescript
 * import { authApi, activityApi } from '@/services';
 *
 * // 使用
 * const result = await authApi.login(credentials);
 * const activities = await activityApi.getMyActivities();
 * ```
 */

// 认证 API
import * as authApi from "./authApi";
export { authApi };
export type { LoginCredentials, LoginResponse, User } from "./authApi";

// 活动 API
import * as activityApi from "./activityApi";
export { activityApi };
export type {
  Activity,
  ActivityStatus,
  ActivityListResponse,
  ActivityDetailResponse,
  CreateActivityRequest,
  ActivityQueryParams,
} from "./activityApi";

// 报名 API
import * as enrollmentApi from "./enrollmentApi";
export { enrollmentApi };
export type {
  Enrollment,
  EnrollmentStatus,
  EnrollmentListResponse,
  EnrollmentDetailResponse,
  EnrollmentFormData,
  ImportEnrollmentResult,
  SendNotificationRequest,
} from "./enrollmentApi";

// 匹配 API
import * as matchingApi from "./matchingApi";
export { matchingApi };
export type {
  MatchRule,
  MatchConstraint,
  MatchGroup,
  MatchResult,
  RuleType,
  ExecuteMatchRequest,
} from "./matchingApi";

// 用户 API (C端)
import * as userApi from "./userApi";
export { userApi };
export type {
  UserProfile,
  UpdateProfileRequest,
  Notification,
  NotificationListResponse,
  UserStats,
  InterestTag,
  UserProfileStats,
  UserActivity,
  UserActivityStatus,
  UserActivityListResponse,
  ActivityCategory,
} from "./userApi";

// NFC 手环 API
import * as nfcApi from "./nfcApi";
export { nfcApi };
export type { NfcResolveData, NfcTagInfo, NfcTagStatus } from "./nfcApi";

// 商家 API (B端)
import * as merchantApi from "./merchantApi";
export { merchantApi };
export type {
  MerchantProfile,
  MerchantProfileResponse,
  UpdateMerchantProfileRequest,
  UpdateMerchantProfileResponse,
  UpdatedMerchantIdentity,
  MerchantPrivacySettings,
  MerchantStats,
} from "./merchantApi";
export { uploadMerchantAvatar } from "./merchantApi";

// 底层 API 实例 (用于自定义请求)
export { api } from "@/services/api";
