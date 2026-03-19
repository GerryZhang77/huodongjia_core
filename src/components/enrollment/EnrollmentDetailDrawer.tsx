/**
 * EnrollmentDetailDrawer - 报名人员详情抽屉
 *
 * 从底部弹出的详情面板，PC端从右侧弹出
 * 展示报名人员的完整信息
 *
 * 与用户池的 UserDetailDrawer 保持视觉风格一致
 */

import React from "react";
import {
  X,
  MapPin,
  Briefcase,
  Building2,
  Mail,
  Phone,
  UserCircle,
  Tag as TagIcon,
  CheckCircle,
  XCircle,
  Clock,
  Send,
} from "lucide-react";
import type { Enrollment } from "@/types/enrollment";
import { STATUS_LABELS } from "@/types/enrollment";

// ========================================
// 类型定义
// ========================================

export interface EnrollmentDetailDrawerProps {
  /** 是否显示 */
  visible: boolean;
  /** 当前查看的报名信息 */
  enrollment: Enrollment | null;
  /** 关闭回调 */
  onClose: () => void;
  /** 通过回调 */
  onApprove?: (id: string) => void;
  /** 拒绝回调 */
  onReject?: (id: string) => void;
  /** 发送通知回调 */
  onNotify?: (id: string) => void;
}

// ========================================
// 状态配色
// ========================================

const statusStyles: Record<string, string> = {
  approved: "bg-green-100 text-green-600",
  pending: "bg-yellow-100 text-yellow-600",
  rejected: "bg-red-100 text-red-600",
  cancelled: "bg-gray-100 text-gray-500",
  waitlist: "bg-blue-100 text-blue-600",
};

// ========================================
// 辅助组件
// ========================================

const InfoRow: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number | undefined;
}> = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon size={16} className="text-gray-400 flex-shrink-0" />
      <span className="text-sm text-gray-500 w-16 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 flex-1 truncate">
        {String(value)}
      </span>
    </div>
  );
};

// ========================================
// 主组件
// ========================================

const EnrollmentDetailDrawer: React.FC<EnrollmentDetailDrawerProps> = ({
  visible,
  enrollment,
  onClose,
  onApprove,
  onReject,
  onNotify,
}) => {
  if (!visible || !enrollment) return null;

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* 面板 - 移动端底部弹出 / PC端右侧滑出 */}
      <div className="relative bg-white w-full md:w-[420px] max-h-[85vh] md:max-h-full md:h-full rounded-t-2xl md:rounded-none flex flex-col animate-slide-up md:animate-none">
        {/* 移动端拖拽指示条 */}
        <div className="flex justify-center pt-2 pb-1 md:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">报名详情</h3>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto px-5 pb-28">
          {/* 用户头像 + 名字 + 状态 */}
          <div className="flex items-center gap-4 py-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold text-lg">
                {enrollment.name.slice(0, 1)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  {enrollment.name}
                </h2>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusStyles[enrollment.status] || "bg-gray-100 text-gray-500"}`}
                >
                  {STATUS_LABELS[enrollment.status] || enrollment.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                {enrollment.gender && (
                  <span>
                    {enrollment.gender === "male"
                      ? "男"
                      : enrollment.gender === "female"
                        ? "女"
                        : "其他"}
                  </span>
                )}
                {enrollment.age && <span>{enrollment.age}岁</span>}
                {enrollment.occupation && <span>{enrollment.occupation}</span>}
              </div>
            </div>
          </div>

          {/* 报名时间 */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 rounded-lg px-3 py-2">
            <Clock size={14} className="text-gray-400" />
            <span>报名时间：{formatDate(enrollment.enrolledAt)}</span>
          </div>

          {/* 基本信息 */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <UserCircle size={16} className="text-gray-500" />
              基本信息
            </h4>
            <div className="bg-gray-50 rounded-xl px-4 py-1 divide-y divide-gray-100">
              <InfoRow
                icon={Briefcase}
                label="行业"
                value={enrollment.industry}
              />
              <InfoRow
                icon={Building2}
                label="公司"
                value={enrollment.company}
              />
              <InfoRow icon={MapPin} label="城市" value={enrollment.city} />
              <InfoRow icon={Phone} label="手机" value={enrollment.phone} />
              <InfoRow icon={Mail} label="邮箱" value={enrollment.email} />
            </div>
          </div>

          {/* 个人简介 / 匹配需求 */}
          {(enrollment.bio || enrollment.matchingNeeds) && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                {enrollment.matchingNeeds ? "匹配需求" : "个人简介"}
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">
                {enrollment.matchingNeeds || enrollment.bio}
              </p>
            </div>
          )}

          {/* 标签 */}
          {enrollment.tags && enrollment.tags.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <TagIcon size={16} className="text-gray-500" />
                标签
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {enrollment.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 自定义字段 */}
          {enrollment.customFields &&
            Object.keys(enrollment.customFields).length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  其他信息
                </h4>
                <div className="bg-gray-50 rounded-xl px-4 py-2 space-y-2">
                  {Object.entries(enrollment.customFields).map(
                    ([key, value]) => (
                      <div key={key} className="flex items-start gap-3 py-1">
                        <span className="text-sm text-gray-500 w-20 flex-shrink-0">
                          {key}
                        </span>
                        <span className="text-sm text-gray-900 flex-1">
                          {String(value)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>

        {/* 底部操作栏 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3 safe-area-pb">
          {enrollment.status === "pending" ? (
            <>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[22px] border border-red-300 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors"
                onClick={() => onReject?.(enrollment.id)}
              >
                <XCircle size={16} />
                拒绝
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[22px] bg-gradient-to-br from-green-500 to-green-600 text-white font-medium text-sm shadow-sm hover:shadow-md transition-all"
                onClick={() => onApprove?.(enrollment.id)}
              >
                <CheckCircle size={16} />
                通过
              </button>
            </>
          ) : (
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[22px] bg-gradient-to-br from-primary-400 to-primary-500 text-white font-medium text-sm shadow-sm hover:shadow-md transition-all"
              onClick={() => onNotify?.(enrollment.id)}
            >
              <Send size={16} />
              发送通知
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetailDrawer;
