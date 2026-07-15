/**
 * DiscoveryUserDetail - 发现用户详情弹窗
 *
 * 底部弹出的用户详情：
 * - 未解锁：脱敏展示（昵称、城市、行业、兴趣标签、匹配度）
 * - 已解锁：完整信息（真名、电话、邮箱、公司、简介）
 * - 操作按钮：解锁、邀请参加活动、收藏
 */

import React from "react";
import { Popup } from "antd-mobile";
import {
  X,
  MapPin,
  Briefcase,
  Building2,
  Phone,
  Mail,
  Heart,
  Send,
  Unlock,
  Lock,
  Activity,
  Sparkles,
} from "lucide-react";
import type { PlatformUser } from "@/features/merchant/user-pool/types";
import { GENDER_LABELS } from "@/features/merchant/user-pool/types";

// ========================================
// 类型定义
// ========================================

export interface DiscoveryUserDetailProps {
  visible: boolean;
  user: PlatformUser | null;
  onClose: () => void;
  onUnlock: (userId: string) => void;
  onInvite: (userId: string) => void;
  onToggleFavorite: (userId: string) => void;
}

// ========================================
// 辅助函数
// ========================================

function getMatchScoreColor(score: number): string {
  if (score >= 85) return "from-green-400 to-green-500";
  if (score >= 70) return "from-primary-400 to-primary-500";
  if (score >= 50) return "from-orange-400 to-orange-500";
  return "from-gray-400 to-gray-500";
}

function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  return `${name.charAt(0)}***@${domain}`;
}

// ========================================
// 组件
// ========================================

const DiscoveryUserDetail: React.FC<DiscoveryUserDetailProps> = ({
  visible,
  user,
  onClose,
  onUnlock,
  onInvite,
  onToggleFavorite,
}) => {
  if (!user) return null;

  const displayName = user.isUnlocked
    ? user.name || user.nickname
    : user.nickname;

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: "85vh",
      }}
    >
      <div className="max-h-[85vh] overflow-y-auto">
        {/* 头部：关闭按钮 + 收藏 */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
          <button onClick={() => onToggleFavorite(user.id)}>
            <Heart
              size={20}
              className={
                user.isFavorited ? "fill-red-500 text-red-500" : "text-gray-300"
              }
            />
          </button>
        </div>

        <div className="px-5 pb-5">
          {/* 用户头像 + 基本信息 */}
          <div className="flex flex-col items-center pt-4 pb-5">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-3 ring-2 ring-primary-100 ring-offset-2">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-medium">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {displayName}
            </h2>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              {user.gender && <span>{GENDER_LABELS[user.gender]}</span>}
              {user.ageGroup && <span>{user.ageGroup}岁</span>}
              {user.isUnlocked ? (
                <span className="flex flex-nowrap items-center gap-0.5 whitespace-nowrap rounded-full bg-green-50 px-1.5 py-0.5 text-xs text-green-600">
                  <Unlock size={10} />
                  已解锁
                </span>
              ) : (
                <span className="flex flex-nowrap items-center gap-0.5 whitespace-nowrap rounded-full bg-gray-50 px-1.5 py-0.5 text-xs text-gray-400">
                  <Lock size={10} />
                  未解锁
                </span>
              )}
            </div>

            {/* 匹配度圆环 */}
            <div
              className={`flex flex-nowrap items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white ${getMatchScoreColor(user.matchScore)}`}
            >
              <Sparkles size={14} />
              匹配度 {user.matchScore}分
            </div>
          </div>

          {/* 基本信息（始终可见） */}
          <div className="space-y-3 mb-5">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              基本信息
            </h3>

            {user.city && (
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin size={15} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{user.city}</span>
              </div>
            )}
            {user.industry && (
              <div className="flex items-center gap-2.5 text-sm">
                <Briefcase size={15} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">
                  {user.industry}
                  {user.occupation && ` · ${user.occupation}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm">
              <Activity size={15} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">
                参与过 {user.participationCount} 次活动
              </span>
            </div>
          </div>

          {/* 解锁后可见信息 */}
          {user.isUnlocked ? (
            <div className="space-y-3 mb-5">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                联系方式
              </h3>
              {user.company && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2
                    size={15}
                    className="text-accent-400 flex-shrink-0"
                  />
                  <span className="text-gray-700">{user.company}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone size={15} className="text-accent-400 flex-shrink-0" />
                  <span className="text-gray-700">{user.phone}</span>
                </div>
              )}
              {user.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail size={15} className="text-accent-400 flex-shrink-0" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
              )}
              {user.bio && (
                <div className="mt-2 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed">
                  {user.bio}
                </div>
              )}
            </div>
          ) : (
            /* 未解锁：脱敏预览 */
            <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500">
                  以下信息需解锁查看
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} />
                    <span>{maskPhone(user.phone)}</span>
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} />
                    <span>{maskEmail(user.email)}</span>
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center gap-2">
                    <Building2 size={13} />
                    <span>****公司</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 兴趣标签 */}
          {user.interests.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                兴趣爱好
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((interest) => (
                  <span
                    key={interest}
                    className="max-w-full truncate whitespace-nowrap rounded-full bg-primary-50 px-2.5 py-1 text-xs text-primary-600"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 活动偏好 */}
          {user.activityPreferences.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                活动偏好
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {user.activityPreferences.map((pref) => (
                  <span
                    key={pref}
                    className="max-w-full truncate whitespace-nowrap rounded-full bg-orange-50 px-2.5 py-1 text-xs text-orange-600"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 技能标签（解锁后） */}
          {user.isUnlocked && user.skills && user.skills.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                专业技能
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="max-w-full truncate whitespace-nowrap rounded-full bg-accent-50 px-2.5 py-1 text-xs text-accent-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 底部操作按钮 */}
          <div className="flex gap-3 pt-2">
            {!user.isUnlocked && (
              <button
          className="flex flex-1 flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap rounded-[22px] bg-gradient-to-br from-accent-400 to-accent-500 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md [&>svg]:shrink-0"
                onClick={() => onUnlock(user.id)}
              >
                <Unlock size={14} />
                解锁完整信息
              </button>
            )}
            <button
          className={`${user.isUnlocked ? "flex-1" : ""} flex flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap rounded-[22px] bg-gradient-to-br from-primary-400 to-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md [&>svg]:shrink-0`}
              onClick={() => onInvite(user.id)}
            >
              <Send size={14} />
              邀请参加活动
            </button>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default DiscoveryUserDetail;
