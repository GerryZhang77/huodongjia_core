/**
 * 商家端活动详情页
 * 现代化设计，与用户端风格一致
 * 保留商家特有功能：编辑、报名管理、匹配配置、参与者管理
 */

import { FC, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MoreHorizontal,
  Edit3,
  Users,
  Settings,
  Calendar,
  MapPin,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  QrCode,
} from "lucide-react";
import {
  Dialog,
  ActionSheet,
} from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import { getEnrollmentsDetailed } from "@/features/enrollment/services/enrollmentApi";
import { RegistrationQrModal } from "@/components/enrollment";
import { Button } from "@/components/ui";
import {
  ParticipantAvatar,
  type ParticipantInfo,
} from "@/components/business/ParticipantAvatar";
import { ImageCarousel } from "@/components/business/ImageCarousel";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { getCategoryLabel, getTagLabel } from "@/features/activities/utils/constants";
import { parseRequirements } from "@/features/activities/components/ActivityForm/RequirementListEditor";
import dayjs from "dayjs";

// 活动接口定义 (与后端 camelCase 格式匹配)
interface Activity {
  id: string;
  title: string;
  description: string;
  activityStart: string;
  activityEnd: string;
  registrationStart?: string;
  registrationEnd?: string;
  location: string;
  capacity: number;
  enrolledCount: number;
  status: ActivityStatus;
  coverImage?: string | null;
  images?: string[];
  category: string;
  tags: string[];
  requirements?: string;
  contactInfo?: string;
  fee?: number;
  isPublic?: boolean;
  allowWaitlist?: boolean;
  organizer?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  createdAt: string;
  updatedAt?: string;
}

// 活动状态类型 (与 Mock 数据匹配)
type ActivityStatus =
  | "draft"
  | "published"
  | "recruiting"
  | "full"
  | "ongoing"
  | "completed"
  | "cancelled";

// 状态配置
const statusConfig: Record<
  ActivityStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: {
    label: "草稿",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  published: {
    label: "已发布",
    color: "text-primary-600",
    bgColor: "bg-primary-50",
  },
  recruiting: {
    label: "报名中",
    color: "text-success-600",
    bgColor: "bg-success-50",
  },
  full: {
    label: "已满员",
    color: "text-warning-600",
    bgColor: "bg-warning-50",
  },
  ongoing: {
    label: "进行中",
    color: "text-primary-600",
    bgColor: "bg-primary-50",
  },
  completed: {
    label: "已结束",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
  cancelled: {
    label: "已取消",
    color: "text-error-600",
    bgColor: "bg-error-50",
  },
};

const normalizeUtc = (s: string) => s.includes('+') || s.endsWith('Z') ? s : s + 'Z';
const formatDate = (dateStr: string): string => dayjs(normalizeUtc(dateStr)).format("M月D日 HH:mm");
const formatDateTime = (dateStr: string): string => dayjs(normalizeUtc(dateStr)).format("YYYY年M月D日 HH:mm");

const ActivityDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [participantsTotal, setParticipantsTotal] = useState(0);
  const [participantPage, setParticipantPage] = useState(1);
  const [participantStatus, setParticipantStatus] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "participants">("info");
  const [showQrModal, setShowQrModal] = useState(false);
  const PAGE_SIZE = 10;
  const participantListRef = useRef<HTMLDivElement>(null);

  // 获取活动详情
  const fetchActivityDetail = async () => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setActivity(data.event);
      } else {
        Toast.show(data.message || "获取活动详情失败");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Fetch activity detail error:", error);
      Toast.show("网络错误，请重试");
      navigate("/dashboard");
    }
  };

  // 加载参与者（支持分页和状态筛选）
  const loadParticipants = async (page: number, status: string | undefined) => {
    try {
      const res = await getEnrollmentsDetailed(id!, { page, pageSize: PAGE_SIZE, status });
      setParticipants(res.enrollments.map((e) => ({
        user_id: e.userId || e.id,
        name: e.name,
        avatar: undefined,
        gender: e.gender,
        age: e.age,
        occupation: e.occupation,
        company: e.company,
        city: e.city,
        interests: e.tags,
        status: (e.status === "approved" ? "confirmed" : e.status) as ParticipantInfo["status"],
        registration_time: e.enrolledAt,
      })));
      setParticipantsTotal(res.total);
    } catch (error) {
      console.error("Fetch participants error:", error);
    }
  };

  // 切换状态筛选
  const handleStatusFilter = (status: string | undefined) => {
    setParticipantStatus(status);
    setParticipantPage(1);
    loadParticipants(1, status);
  };

  // 翻页
  const handlePageChange = (page: number) => {
    setParticipantPage(page);
    loadParticipants(page, participantStatus);
    participantListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (id) {
      Promise.all([fetchActivityDetail(), loadParticipants(1, undefined)]).finally(() =>
        setLoading(false),
      );
    }
  }, [id]);

  // 更多操作
  const handleMoreActions = () => {
    ActionSheet.show({
      actions: [
        {
          text: "发送通知",
          key: "notify",
          onClick: () => Toast.show("功能开发中"),
        },
        {
          text: "复制活动",
          key: "copy",
          onClick: () => Toast.show("功能开发中"),
        },
        {
          text: "取消活动",
          key: "cancel",
          danger: true,
          onClick: () => handleCancelActivity(),
        },
      ],
      cancelText: "取消",
    });
  };

  // 取消活动
  const handleCancelActivity = () => {
    Dialog.confirm({
      content: "确定要取消这个活动吗？取消后无法恢复。",
      confirmText: "确定取消",
      cancelText: "再想想",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/delete-event/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          if (data.success) {
            Toast.show("活动已取消");
            navigate("/dashboard");
          } else {
            Toast.show(data.message || "取消失败");
          }
        } catch (error) {
          console.error("Cancel activity error:", error);
          Toast.show("网络错误，请重试");
        }
      },
    });
  };

  // 计算参与率
  const getParticipationRate = () => {
    const max = activity?.capacity || 0;
    if (!max) return 0;
    return Math.round((participantsTotal / max) * 100);
  };

  // 获取状态徽章样式
  const getStatusBadge = (status: ActivityStatus) => {
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}
      >
        {config.label}
      </span>
    );
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  // 活动不存在
  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertCircle size={40} className="text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm mb-4">活动不存在</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-primary-400 text-white text-sm rounded-lg"
        >
          返回管理后台
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 页面内容 */}
      <div className="md:py-6 lg:py-8">
        {/* 响应式容器 */}
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto bg-white min-h-screen md:min-h-0 pb-52 md:pb-48 shadow-sm md:shadow-xl md:rounded-2xl md:mb-6 relative">
          {/* 封面区域 - 图片轮播 */}
          <ImageCarousel
            images={
              activity.images?.length
                ? activity.images
                : activity.coverImage
                  ? [activity.coverImage]
                  : []
            }
            heightClass="aspect-[4/3] lg:aspect-[21/9]"
            className="md:rounded-t-2xl"
            renderOverlay={() => (
              <>
                {/* 顶部导航 */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-20">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                  >
                    <ArrowLeft size={20} className="text-white" />
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowQrModal(true)}
                      className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                      title="报名二维码"
                    >
                      <QrCode size={20} className="text-white" />
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/activity/${id}/edit`)}
                      className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                    >
                      <Edit3 size={20} className="text-white" />
                    </button>
                    <button
                      onClick={handleMoreActions}
                      className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                    >
                      <MoreHorizontal size={20} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* 状态标签 */}
                <div className="absolute bottom-3 right-4 z-20">
                  {getStatusBadge(activity.status)}
                </div>

                {/* 底部标签 */}
                {activity.tags && activity.tags.length > 0 && (
                  <div className="absolute bottom-3 left-4 flex gap-1.5 z-20">
                    {activity.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium rounded-full"
                      >
                        {getTagLabel(tag)}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          />

          {/* 内容区 */}
          <div className="px-4 py-5 md:px-6 lg:px-8">
            {/* 标题 */}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              {activity.title}
            </h1>

            {/* 数据统计卡片 */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-primary-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary-500">
                  {participantsTotal}
                </p>
                <p className="text-xs text-gray-500 mt-1">已报名</p>
              </div>
              <div className="bg-success-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-success-500">
                  {activity.capacity}
                </p>
                <p className="text-xs text-gray-500 mt-1">名额上限</p>
              </div>
              <div className="bg-secondary-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-secondary-500">
                  {getParticipationRate()}%
                </p>
                <p className="text-xs text-gray-500 mt-1">报名进度</p>
              </div>
            </div>

            {/* 信息卡片 - 网格布局 */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* 时间 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">活动时间</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(activity.activityStart)} - {formatDate(activity.activityEnd)}
                  </p>
                </div>
              </div>

              {/* 报名时间 */}
              {(activity.registrationStart || activity.registrationEnd) && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-warning-50 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-warning-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">报名时间</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activity.registrationStart ? formatDate(activity.registrationStart) : "即时开放"}
                      {" - "}
                      {activity.registrationEnd ? formatDate(activity.registrationEnd) : "截止未设置"}
                    </p>
                  </div>
                </div>
              )}

              {/* 地点 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-success-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">活动地点</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activity.location}
                  </p>
                </div>
              </div>

              {/* 分类 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary-50 flex items-center justify-center flex-shrink-0">
                  <Settings size={16} className="text-secondary-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">活动分类</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {getCategoryLabel(activity.category)}
                  </p>
                </div>
              </div>

              {/* 创建时间 */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">创建时间</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDateTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-gray-100 my-5" />

            {/* Tab 切换 */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "info"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                详细信息
              </button>
              <button
                onClick={() => setActiveTab("participants")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "participants"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                参与者 ({participantsTotal})
              </button>
            </div>

            {/* Tab 内容 */}
            <div className="mt-4">
              {activeTab === "info" && (
                <div className="space-y-4">
                  {/* 活动简介 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      活动简介
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {activity.description || "暂无活动简介"}
                    </p>
                  </div>

                  {/* 参与要求 */}
                  {activity.requirements && (() => {
                    const items = parseRequirements(activity.requirements);
                    if (items.length === 0) return null;
                    return (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
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
                    );
                  })()}

                  {/* 联系方式 */}
                  {activity.contactInfo && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        联系方式
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {activity.contactInfo}
                      </p>
                    </div>
                  )}

                  {/* 活动ID */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      活动ID
                    </h3>
                    <p className="text-xs font-mono text-gray-500">
                      {activity.id}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "participants" && (
                <div>
                  {/* 状态筛选 */}
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    {[
                      { label: "全部", value: undefined },
                      { label: "已确认", value: "approved" },
                      { label: "待审核", value: "pending" },
                      { label: "候补", value: "waitlist" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleStatusFilter(item.value)}
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          participantStatus === item.value
                            ? "bg-primary-400 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                    <span className="flex-shrink-0 text-xs text-gray-400 self-center ml-auto">
                      共 {participantsTotal} 人
                    </span>
                  </div>

                  {participants.length === 0 ? (
                    <div className="text-center py-12">
                      <Users size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">暂无参与者</p>
                    </div>
                  ) : (
                    <>
                      <div ref={participantListRef} className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                        {participants.map((participant, idx) => (
                          <div
                            key={`${participant.user_id}-${idx}`}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <ParticipantAvatar
                              participant={participant}
                              size="medium"
                              showName
                              showStatus
                              className="flex-1"
                            />
                            {participant.registration_time && (
                              <span className="text-[10px] text-gray-400 flex-shrink-0">
                                {formatDateTime(participant.registration_time)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 分页 - 固定在列表外部，始终可见 */}
                      {participantsTotal > PAGE_SIZE && (
                        <div className="flex items-center justify-center gap-3 pt-3">
                          <button
                            onClick={() => handlePageChange(participantPage - 1)}
                            disabled={participantPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 disabled:opacity-30"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs text-gray-500">
                            {participantPage} / {Math.ceil(participantsTotal / PAGE_SIZE)}
                          </span>
                          <button
                            onClick={() => handlePageChange(participantPage + 1)}
                            disabled={participantPage >= Math.ceil(participantsTotal / PAGE_SIZE)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 disabled:opacity-30"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="absolute bottom-0 left-0 right-0 z-50 md:rounded-b-2xl overflow-hidden">
            <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-4 lg:pb-6">
              {/* 快捷操作按钮 */}
              <div className="grid grid-cols-4 gap-3 mb-3">
                <button
                  onClick={() => navigate(`/dashboard/activity/${id}/edit`)}
                  className="flex flex-col items-center gap-1 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Edit3 size={20} className="text-primary-500" />
                  <span className="text-xs text-gray-600">编辑活动</span>
                </button>
                <button
                  onClick={() =>
                    navigate(`/dashboard/activity/${id}/enrollment`)
                  }
                  className="flex flex-col items-center gap-1 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Users size={20} className="text-success-500" />
                  <span className="text-xs text-gray-600">报名管理</span>
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="flex flex-col items-center gap-1 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <QrCode size={20} className="text-primary-500" />
                  <span className="text-xs text-gray-600">报名二维码</span>
                </button>
                <button
                  onClick={() => navigate(`/dashboard/activity/${id}/matching`)}
                  className="flex flex-col items-center gap-1 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Settings size={20} className="text-secondary-500" />
                  <span className="text-xs text-gray-600">匹配配置</span>
                </button>
              </div>

              {/* 主操作按钮 */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMoreActions}
                  className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <MoreHorizontal size={22} className="text-gray-400" />
                </button>
                <Button
                  variant="primary"
                  onClick={() =>
                    navigate(`/dashboard/activity/${id}/enrollment`)
                  }
                  className="flex-1 h-12"
                >
                  管理报名
                </Button>
              </div>

              {/* 移动端底部安全区域 */}
              <div className="h-4 lg:hidden" />
            </div>
          </div>

          <RegistrationQrModal
            visible={showQrModal}
            activityId={id || ""}
            activityTitle={activity.title}
            onClose={() => setShowQrModal(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;
