/**
 * 用户端活动详情页
 * 简洁现代的详情展示
 */

import { FC, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  getActivityById,
  UserActivityStatus,
} from "@/mocks/data/user-activities";
import dayjs from "dayjs";

// 状态配置
const statusConfig: Record<
  UserActivityStatus,
  {
    label: string;
    color: string;
    btnLabel: string;
    btnStyle: string;
    disabled?: boolean;
  }
> = {
  recruiting: {
    label: "报名中",
    color: "bg-green-500",
    btnLabel: "立即报名",
    btnStyle: "bg-primary-500 text-white hover:bg-primary-600",
  },
  pending: {
    label: "待审核",
    color: "bg-yellow-500",
    btnLabel: "审核中",
    btnStyle: "bg-gray-200 text-gray-500",
    disabled: true,
  },
  approved: {
    label: "已通过",
    color: "bg-primary-500",
    btnLabel: "查看分组",
    btnStyle: "bg-green-500 text-white hover:bg-green-600",
  },
  completed: {
    label: "已结束",
    color: "bg-gray-400",
    btnLabel: "活动回顾",
    btnStyle: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  },
};

// 格式化日期
const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format("M月D日 HH:mm");
};

const UserActivityDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);

  const activity = id ? getActivityById(id) : undefined;

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertCircle size={40} className="text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm mb-4">活动不存在</p>
        <button
          onClick={() => navigate("/u/home")}
          className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg"
        >
          返回首页
        </button>
      </div>
    );
  }

  const config = statusConfig[activity.userStatus];
  const isFull = activity.currentParticipants >= activity.maxParticipants;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 响应式容器 */}
      <div className="max-w-lg mx-auto bg-white min-h-screen pb-24 shadow-sm md:shadow-xl">
        {/* 封面区域 */}
        <div className="relative aspect-[4/3]">
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

          {/* 顶部导航 */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-12">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
              >
                <Heart
                  size={18}
                  className={
                    isFavorited ? "text-red-400 fill-red-400" : "text-white"
                  }
                />
              </button>
              <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Share2 size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* 状态标签 */}
          <div
            className={`absolute top-14 left-4 px-2.5 py-1 rounded-full text-xs font-medium text-white ${config.color}`}
          >
            {config.label}
          </div>

          {/* 底部标签 */}
          <div className="absolute bottom-3 left-4 flex gap-1.5">
            {activity.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 内容区 */}
        <div className="px-4 py-5">
          {/* 标题 */}
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            {activity.title}
          </h1>

          {/* 信息卡片 */}
          <div className="mt-5 space-y-4">
            {/* 时间 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-primary-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">活动时间</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(activity.eventStartTime)} -{" "}
                  {formatDate(activity.eventEndTime)}
                </p>
              </div>
            </div>

            {/* 地点 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">活动地点</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activity.location}
                </p>
              </div>
            </div>

            {/* 人数 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Users size={16} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">参与人数</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activity.currentParticipants}/{activity.maxParticipants}人
                  {isFull && <span className="ml-1 text-orange-500">已满</span>}
                </p>
              </div>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="h-px bg-gray-100 my-5" />

          {/* 主办方 */}
          <div className="flex items-center gap-3">
            <img
              src={activity.organizer.avatar}
              alt={activity.organizer.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {activity.organizer.name}
              </p>
              <p className="text-xs text-gray-500">主办方</p>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="h-px bg-gray-100 my-5" />

          {/* 活动简介 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              活动简介
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              探索前沿科技，结识行业精英。本次活动将邀请多位重量级嘉宾分享最新行业动态，
              并通过智能匹配系统帮助参与者快速建立高质量人脉连接。
            </p>
          </div>

          {/* 状态提示 */}
          {activity.userStatus === "approved" && (
            <div className="mt-5 p-3 bg-green-50 rounded-xl flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
              <p className="text-xs text-green-700">
                报名已通过，点击下方查看分组结果
              </p>
            </div>
          )}
          {activity.userStatus === "pending" && (
            <div className="mt-5 p-3 bg-yellow-50 rounded-xl flex items-center gap-2">
              <Clock size={16} className="text-yellow-600 flex-shrink-0" />
              <p className="text-xs text-yellow-700">报名审核中，请耐心等待</p>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="max-w-lg mx-auto bg-white border-t border-gray-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center"
              >
                <Heart
                  size={20}
                  className={
                    isFavorited ? "text-red-500 fill-red-500" : "text-gray-400"
                  }
                />
              </button>
              <button
                disabled={config.disabled}
                className={`flex-1 h-11 rounded-xl font-medium text-sm transition-all ${
                  config.btnStyle
                } ${
                  config.disabled ? "cursor-not-allowed" : "active:scale-[0.98]"
                }`}
              >
                {config.btnLabel}
              </button>
            </div>
            <div className="h-safe-area-bottom" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityDetail;
