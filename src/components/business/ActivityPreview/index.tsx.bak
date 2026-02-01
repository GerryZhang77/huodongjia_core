/**
 * 活动预览组件
 * 用于创建/编辑活动时实时预览活动详情页效果
 */

import { FC, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Heart,
  Share2,
  ArrowLeft,
  User,
} from "lucide-react";
import dayjs from "dayjs";
import type { ActivityFormData } from "@/features/activities/types";

interface ActivityPreviewProps {
  /** 表单数据 */
  formData: Partial<ActivityFormData>;
  /** 封面图片URL */
  coverImage?: string;
  /** 预览模式: mobile-模拟手机框, desktop-桌面预览 */
  mode?: "mobile" | "desktop";
  /** 组织者信息 */
  organizer?: {
    name: string;
    avatar?: string;
  };
}

// 分类名称映射
const CATEGORY_NAMES: Record<string, string> = {
  business: "商务会议",
  tech: "技术交流",
  social: "社交聚会",
  training: "培训学习",
  culture: "文化活动",
  sports: "体育运动",
  other: "其他",
};

// 标签名称映射
const TAG_NAMES: Record<string, string> = {
  online: "线上",
  offline: "线下",
  free: "免费",
  paid: "付费",
  limited: "限时",
  popular: "热门",
  beginner: "新手友好",
  professional: "专业级",
};

/**
 * 格式化日期时间
 */
const formatDateTime = (date?: Date | string | null): string => {
  if (!date) return "待定";
  return dayjs(date).format("M月D日 HH:mm");
};

/**
 * 活动预览组件
 */
export const ActivityPreview: FC<ActivityPreviewProps> = ({
  formData,
  coverImage,
  mode = "mobile",
  organizer = { name: "活动主办方" },
}) => {
  // 解析表单数据
  const previewData = useMemo(
    () => ({
      title: formData.title || "活动标题",
      description: formData.description || "活动描述将在这里显示...",
      location: formData.location || "活动地点",
      maxParticipants: formData.max_participants || 50,
      currentParticipants: 0,
      startTime: formData.start_time,
      endTime: formData.end_time,
      registrationStart: formData.registration_start,
      registrationEnd: formData.registration_end,
      category: formData.category,
      tags: formData.tags || [],
      requirements: formData.requirements,
      contactInfo: formData.contact_info,
    }),
    [formData],
  );

  // 移动端预览内容
  const previewContent = (
    <div className="bg-white dark:bg-gray-800 min-h-full">
      {/* 封面区域 */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30">
        {coverImage ? (
          <img
            src={coverImage}
            alt={previewData.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/50 dark:bg-gray-700/50 flex items-center justify-center">
                <Calendar size={28} className="text-primary-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                活动封面预览
              </p>
            </div>
          </div>
        )}
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

        {/* 顶部导航 */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3">
          <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft size={16} className="text-white" />
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Heart size={16} className="text-white" />
            </div>
            <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Share2 size={16} className="text-white" />
            </div>
          </div>
        </div>

        {/* 状态标签 */}
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium text-white bg-success-500">
          报名中
        </div>

        {/* 底部标签 */}
        <div className="absolute bottom-3 left-3 flex gap-1">
          {previewData.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[9px] font-medium rounded-full"
            >
              {TAG_NAMES[tag] || tag}
            </span>
          ))}
          {previewData.tags.length === 0 && previewData.category && (
            <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[9px] font-medium rounded-full">
              {CATEGORY_NAMES[previewData.category] || previewData.category}
            </span>
          )}
        </div>
      </div>

      {/* 内容区 */}
      <div className="px-4 py-4">
        {/* 标题 */}
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
          {previewData.title}
        </h1>

        {/* 信息卡片 */}
        <div className="mt-4 space-y-3">
          {/* 时间 */}
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
              <Calendar size={14} className="text-primary-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                活动时间
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {formatDateTime(previewData.startTime)} -{" "}
                {formatDateTime(previewData.endTime)}
              </p>
            </div>
          </div>

          {/* 地点 */}
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center flex-shrink-0">
              <MapPin size={14} className="text-success-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                活动地点
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {previewData.location}
              </p>
            </div>
          </div>

          {/* 人数 */}
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center flex-shrink-0">
              <Users size={14} className="text-secondary-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                参与人数
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {previewData.currentParticipants}/{previewData.maxParticipants}
                人
              </p>
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-gray-100 dark:bg-gray-700 my-4" />

        {/* 主办方 */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
            {organizer.avatar ? (
              <img
                src={organizer.avatar}
                alt={organizer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={16} className="text-primary-500" />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {organizer.name}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              主办方
            </p>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-gray-100 dark:bg-gray-700 my-4" />

        {/* 活动简介 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
            活动简介
          </h3>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
            {previewData.description}
          </p>
        </div>

        {/* 参与要求 */}
        {previewData.requirements && (
          <>
            <div className="h-px bg-gray-100 dark:bg-gray-700 my-4" />
            <div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                参与要求
              </h3>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                {previewData.requirements}
              </p>
            </div>
          </>
        )}

        {/* 底部占位 */}
        <div className="h-20" />
      </div>

      {/* 底部操作栏 */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <Heart size={18} className="text-gray-400" />
          </div>
          <button className="flex-1 h-10 bg-gradient-to-r from-primary-400 to-primary-500 text-white text-sm font-medium rounded-[20px]">
            立即报名
          </button>
        </div>
      </div>
    </div>
  );

  // 根据模式渲染
  if (mode === "mobile") {
    return (
      <div className="relative mx-auto">
        {/* 手机外框 */}
        <div className="relative w-[280px] h-[560px] bg-gray-900 rounded-[32px] p-2 shadow-2xl">
          {/* 刘海 */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl z-10" />
          {/* 屏幕 */}
          <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden overflow-y-auto scrollbar-hide">
            {previewContent}
          </div>
        </div>
      </div>
    );
  }

  // 桌面预览模式 - 直接渲染内容
  return (
    <div className="relative h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden overflow-y-auto">
      {previewContent}
    </div>
  );
};

export default ActivityPreview;
