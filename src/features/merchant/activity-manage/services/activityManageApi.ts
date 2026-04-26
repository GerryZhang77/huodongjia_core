/**
 * B端活动管理 API
 * 业务封装层：处理前端 camelCase ↔ 后端 snake_case 转换
 */

import {
  getMyActivities,
  createActivity as createActivityRaw,
  updateActivity as updateActivityRaw,
  deleteActivity,
  publishActivity,
  cancelActivity,
  finishActivity,
} from "@/services/activityApi";
import type { CreateActivityRequest } from "../types";

/**
 * 获取商家活动列表
 */
export const getMerchantActivities = getMyActivities;

/**
 * 创建活动 (camelCase → snake_case 转换)
 */
export async function createActivity(data: CreateActivityRequest) {
  return createActivityRaw({
    title: data.title,
    description: data.description,
    expectation: data.expectation,
    cover_image: data.coverImage,
    tags: data.tags,
    registration_deadline: data.registrationDeadline,
    start_time: data.startTime,
    end_time: data.endTime,
    location: data.location,
    max_participants: data.maxParticipants,
    fee: data.fee,
    checkin_password: data.checkinPassword,
  });
}

/**
 * 更新活动 (camelCase → snake_case 转换)
 */
export async function updateActivity(
  id: string,
  data: Partial<CreateActivityRequest>
) {
  const snakeData: Record<string, unknown> = {};
  if (data.title !== undefined) snakeData.title = data.title;
  if (data.description !== undefined) snakeData.description = data.description;
  if (data.expectation !== undefined) snakeData.expectation = data.expectation;
  if (data.coverImage !== undefined) snakeData.cover_image = data.coverImage;
  if (data.tags !== undefined) snakeData.tags = data.tags;
  if (data.registrationDeadline !== undefined)
    snakeData.registration_deadline = data.registrationDeadline;
  if (data.startTime !== undefined) snakeData.start_time = data.startTime;
  if (data.endTime !== undefined) snakeData.end_time = data.endTime;
  if (data.location !== undefined) snakeData.location = data.location;
  if (data.maxParticipants !== undefined)
    snakeData.max_participants = data.maxParticipants;
  if (data.fee !== undefined) snakeData.fee = data.fee;
  if (data.checkinPassword !== undefined)
    snakeData.checkin_password = data.checkinPassword;
  return updateActivityRaw(id, snakeData);
}

export { deleteActivity, publishActivity, cancelActivity, finishActivity };
