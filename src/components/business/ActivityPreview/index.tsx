/**
 * 活动预览组件
 * 用于创建/编辑活动时实时预览活动详情页效果
 * 支持 PC 端和移动端两种预览模式，与 UserActivityDetail 布局对齐
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
  Image as ImageIcon,
  Phone,
} from "lucide-react";
import dayjs from "dayjs";
import type { ActivityFormData } from "@/features/activities/types";
import {
  getCategoryLabel,
  getTagLabel,
  isOnlineOnlyActivity,
} from "@/features/activities/utils/constants";
import { parseRequirements } from "@/features/activities/components/ActivityForm/RequirementListEditor";
import { ImageCarousel } from "../ImageCarousel";

export interface ActivityPreviewProps {
  /** 表单数据 */
  formData: Partial<ActivityFormData>;
  /** 封面图片URL（如果未提供，使用 images 数组的第一张） */
  coverImage?: string;
  /** 活动图片数组 */
  images?: string[];
  /** 预览模式: mobile-模拟手机框, desktop-桌面预览 */
  mode?: "mobile" | "desktop";
  /** 组织者信息 */
  organizer?: {
    name: string;
    avatar?: string;
  };
}

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
  images = [],
  mode = "mobile",
  organizer = { name: "活动主办方" },
}) => {
  // 轮播图片数组（包含所有图片，封面图在最前面）
  const carouselImages = coverImage
    ? [coverImage, ...images.filter((img) => img !== coverImage)]
    : images;

  // 解析表单数据 - 修复描述预览问题
  const previewData = useMemo(
    () => ({
      title: formData.title || "",
      description: formData.description || "",
      location: formData.location || "",
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
  const isOnlineOnly = isOnlineOnlyActivity(previewData.tags);
  const locationText = isOnlineOnly ? "线上活动" : previewData.location;
  const locationPlaceholder = isOnlineOnly ? "线上活动" : "请输入活动地点";

  // 封面占位符组件
  const CoverPlaceholder = ({ isDesktop = false }: { isDesktop?: boolean }) => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div
          className={`${isDesktop ? "w-20 h-20" : "w-16 h-16"} mx-auto mb-2 rounded-full bg-white/50 dark:bg-gray-700/50 flex items-center justify-center`}
        >
          <ImageIcon size={isDesktop ? 32 : 28} className="text-primary-400" />
        </div>
        <p
          className={`${isDesktop ? "text-base" : "text-sm"} text-gray-500 dark:text-gray-400`}
        >
          活动封面预览
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          上传的第一张图片将作为封面
        </p>
      </div>
    </div>
  );

  // ==================== 移动端预览内容 ====================
  const mobilePreviewContent = (
    <div className="bg-white dark:bg-gray-800 min-h-full relative">
      {/* 封面区域 - 图片轮播 */}
      <ImageCarousel
        images={carouselImages.length > 0 ? carouselImages : []}
        heightClass="aspect-[4/3]"
        placeholder={<CoverPlaceholder />}
        renderOverlay={() => (
          <>
            {/* 顶部导航 */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 z-20">
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
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium text-white bg-success-500 z-20">
              报名中
            </div>

            {/* 底部标签 */}
            <div className="absolute bottom-3 left-3 flex gap-1 z-20">
              {previewData.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[9px] font-medium rounded-full"
                >
                  {getTagLabel(tag)}
                </span>
              ))}
              {previewData.tags.length === 0 && previewData.category && (
                <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[9px] font-medium rounded-full">
                  {getCategoryLabel(previewData.category)}
                </span>
              )}
            </div>
          </>
        )}
      />

      {/* 内容区 */}
      <div className="px-4 py-4">
        {/* 标题 */}
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
          {previewData.title || (
            <span className="text-gray-400">请输入活动标题</span>
          )}
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
                {locationText || (
                  <span className="text-gray-400">{locationPlaceholder}</span>
                )}
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
          {previewData.description ? (
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {previewData.description}
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">
              请输入活动描述...
            </p>
          )}
        </div>

        {/* 参与要求 */}
        {previewData.requirements && (() => {
          const items = parseRequirements(previewData.requirements);
          if (items.length === 0) return null;
          return (
            <>
              <div className="h-px bg-gray-100 dark:bg-gray-700 my-4" />
              <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-900/5 dark:to-amber-900/5 rounded-lg p-3 border border-orange-100/50 dark:border-orange-800/20">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1.5 flex items-center gap-1.5">
                  <span className="w-0.5 h-3 bg-orange-400 rounded-full" />
                  参与要求
                </h3>
                <ul className="space-y-1">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-[9px] font-medium text-orange-500 bg-orange-100 dark:bg-orange-900/30 rounded-full flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          );
        })()}

        {/* 联系方式 */}
        {previewData.contactInfo && (
          <>
            <div className="h-px bg-gray-100 dark:bg-gray-700 my-4" />
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-primary-400 flex-shrink-0" />
              <span className="text-[11px] text-gray-600 dark:text-gray-400">
                {previewData.contactInfo}
              </span>
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

  // ==================== 桌面端预览内容 ====================
  const desktopPreviewContent = (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-full py-6 px-4">
      {/* 响应式容器 - 模拟桌面版卡片 */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl relative">
        {/* 封面区域 - 图片轮播 */}
        <ImageCarousel
          images={carouselImages.length > 0 ? carouselImages : []}
          heightClass="aspect-[21/9]"
          className="rounded-t-2xl"
          placeholder={<CoverPlaceholder isDesktop />}
          renderOverlay={() => (
            <>
              {/* 顶部导航 */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-20">
                <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                  <ArrowLeft size={20} className="text-white" />
                </div>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <Heart size={20} className="text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <Share2 size={20} className="text-white" />
                  </div>
                </div>
              </div>

              {/* 状态标签 */}
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium text-white bg-success-500 z-20">
                报名中
              </div>

              {/* 底部标签 */}
              <div className="absolute bottom-4 left-4 flex gap-1.5 z-20">
                {previewData.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium rounded-full"
                  >
                    {getTagLabel(tag)}
                  </span>
                ))}
                {previewData.tags.length === 0 && previewData.category && (
                  <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium rounded-full">
                    {getCategoryLabel(previewData.category)}
                  </span>
                )}
              </div>
            </>
          )}
        />

        {/* 内容区 */}
        <div className="px-6 lg:px-8 py-5">
          {/* 标题 */}
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {previewData.title || (
              <span className="text-gray-400">请输入活动标题</span>
            )}
          </h1>

          {/* 信息卡片 - 桌面端网格布局 */}
          <div className="mt-5 grid grid-cols-2 gap-4 lg:gap-6">
            {/* 时间 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  活动时间
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatDateTime(previewData.startTime)} -{" "}
                  {formatDateTime(previewData.endTime)}
                </p>
              </div>
            </div>

            {/* 地点 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-success-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  活动地点
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {locationText || (
                    <span className="text-gray-400">{locationPlaceholder}</span>
                  )}
                </p>
              </div>
            </div>

            {/* 人数 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center flex-shrink-0">
                <Users size={16} className="text-secondary-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  参与人数
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {previewData.currentParticipants}/
                  {previewData.maxParticipants}人
                </p>
              </div>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="h-px bg-gray-100 dark:bg-gray-700 my-5" />

          {/* 主办方 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
              {organizer.avatar ? (
                <img
                  src={organizer.avatar}
                  alt={organizer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} className="text-primary-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {organizer.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">主办方</p>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="h-px bg-gray-100 dark:bg-gray-700 my-5" />

          {/* 活动简介 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              活动简介
            </h3>
            {previewData.description ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {previewData.description}
              </p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                请输入活动描述...
              </p>
            )}
          </div>

          {/* 参与要求 */}
          {previewData.requirements && (() => {
            const items = parseRequirements(previewData.requirements);
            if (items.length === 0) return null;
            return (
              <>
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-5" />
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-400 rounded-full" />
                    参与要求
                  </h3>
                  <ul className="space-y-2">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-5 h-5 flex items-center justify-center text-xs font-medium text-orange-500 bg-orange-100 dark:bg-orange-900/30 rounded-full flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            );
          })()}
        </div>

        {/* 底部操作栏 */}
        <div className="rounded-b-2xl overflow-hidden">
          <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <button className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Heart size={22} className="text-gray-400" />
              </button>
              <button className="flex-1 h-12 bg-gradient-to-r from-primary-400 to-primary-500 text-white text-base font-medium rounded-[22px] hover:from-primary-500 hover:to-primary-600 transition-all">
                立即报名
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== 根据模式渲染 ====================
  if (mode === "mobile") {
    return (
      <div className="relative mx-auto">
        {/* 手机外框 */}
        <div className="relative w-[280px] h-[560px] bg-gray-900 rounded-[32px] p-2 shadow-2xl">
          {/* 刘海 */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl z-10" />
          {/* 屏幕 */}
          <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden overflow-y-auto scrollbar-hide">
            {mobilePreviewContent}
          </div>
        </div>
      </div>
    );
  }

  // 桌面预览模式 - 固定宽度 1024px 模拟，缩放显示
  return (
    <div
      className="relative bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden"
      style={{ width: "100%", height: "600px" }}
    >
      <div
        className="origin-top-left overflow-y-auto h-full"
        style={{
          width: "1024px",
          transform: "scale(0.55)",
          transformOrigin: "top left",
          height: "1090px", // 600 / 0.55 ≈ 1090
        }}
      >
        {desktopPreviewContent}
      </div>
    </div>
  );
};

export default ActivityPreview;
