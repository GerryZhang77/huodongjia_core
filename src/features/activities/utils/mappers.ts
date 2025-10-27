/**
 * Activities Module - Data Mappers
 * 活动模块 - 数据映射工具
 * 用于转换 API 响应数据到前端数据模型
 */

import type { Activity } from "../types";

/**
 * API 返回的活动数据结构（与后端/Mock 一致）
 */
export interface ApiActivityData {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  cover_image?: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  fee?: number;
  tags?: string[];
  checkin_password?: string;
  status: string;
  created_at: string;
  updated_at: string;
  expectation?: string;
  registration_deadline?: string;
  // 可能的扩展字段
  category?: string;
  requirements?: string;
  contact_info?: string;
  is_public?: boolean;
  allow_waitlist?: boolean;
}

/**
 * 将 API 活动数据映射为前端 Activity 类型
 */
export const mapApiActivityToActivity = (
  apiActivity: ApiActivityData
): Activity => {
  try {
    console.log("mapApiActivityToActivity - 开始转换:", apiActivity);

    const result: Activity = {
      id: apiActivity.id,
      title: apiActivity.title,
      description: apiActivity.description,
      coverImage: apiActivity.cover_image || "",
      status: mapApiStatus(apiActivity.status),
      // 使用 registration_deadline 或 start_time 前一天作为报名开始时间
      registrationStart: apiActivity.created_at,
      registrationEnd:
        apiActivity.registration_deadline || apiActivity.start_time,
      activityStart: apiActivity.start_time,
      activityEnd: apiActivity.end_time,
      location: apiActivity.location,
      capacity: apiActivity.max_participants,
      enrolledCount: 0, // Mock 数据中没有此字段，默认为 0
      createdAt: apiActivity.created_at,
      updatedAt: apiActivity.updated_at,
      // 扩展字段
      category: (apiActivity.category || "other") as Activity["category"],
      tags: (apiActivity.tags || []) as Activity["tags"],
      requirements: apiActivity.requirements || apiActivity.expectation,
      contactInfo: apiActivity.contact_info,
      isPublic: apiActivity.is_public,
      allowWaitlist: apiActivity.allow_waitlist,
    };

    console.log("mapApiActivityToActivity - ✅ 转换成功:", result);
    return result;
  } catch (error) {
    console.error("mapApiActivityToActivity - ❌ 转换失败:", error);
    console.error("mapApiActivityToActivity - 原始数据:", apiActivity);
    throw error;
  }
};

/**
 * 映射 API 状态到前端状态
 */
const mapApiStatus = (apiStatus: string): Activity["status"] => {
  const statusMap: Record<string, Activity["status"]> = {
    draft: "recruiting",
    published: "recruiting",
    ongoing: "ongoing",
    completed: "ended",
    cancelled: "cancelled",
  };

  return statusMap[apiStatus] || "recruiting";
};

/**
 * 批量映射活动列表
 */
export const mapApiActivitiesToActivities = (
  apiActivities: ApiActivityData[]
): Activity[] => {
  return apiActivities.map(mapApiActivityToActivity);
};
