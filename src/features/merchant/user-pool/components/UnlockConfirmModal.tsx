/**
 * UnlockConfirmModal - 解锁用户确认弹窗
 *
 * 商家解锁平台用户完整信息前的确认：
 * - 展示将消耗的配额
 * - 解锁后可见的信息列表
 * - 确认/取消操作
 */

import React from "react";
import { Popup } from "antd-mobile";
import { Unlock, Zap, Phone, Mail, Building2, User, X } from "lucide-react";
import type {
  PlatformUser,
  DiscoveryQuota,
} from "@/features/merchant/user-pool/types";

// ========================================
// 类型定义
// ========================================

export interface UnlockConfirmModalProps {
  visible: boolean;
  user: PlatformUser | null;
  quota: DiscoveryQuota;
  onConfirm: (userId: string) => void;
  onClose: () => void;
}

// ========================================
// 组件
// ========================================

const UnlockConfirmModal: React.FC<UnlockConfirmModalProps> = ({
  visible,
  user,
  quota,
  onConfirm,
  onClose,
}) => {
  if (!user) return null;

  const remaining = quota.freeUnlockLimit - quota.usedUnlocks;
  const hasQuota = remaining > 0;

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
    >
      <div className="px-5 py-5">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900">
            解锁用户信息
          </h3>
          <button onClick={onClose}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* 用户预览 */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                {user.nickname.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-sm text-gray-900">
              {user.nickname}
            </div>
            <div className="text-xs text-gray-500">
              {[user.city, user.industry, user.occupation]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        </div>

        {/* 解锁后可见信息 */}
        <div className="mb-5">
          <h4 className="text-xs font-medium text-gray-500 mb-2.5">
            解锁后可查看
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: User, label: "真实姓名" },
              { icon: Phone, label: "联系电话" },
              { icon: Mail, label: "邮箱地址" },
              { icon: Building2, label: "所在公司" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 p-2.5 bg-accent-50 rounded-lg text-xs text-accent-700"
              >
                <Icon size={14} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 配额提示 */}
        <div
          className={`flex items-center gap-2 p-3 rounded-xl mb-5 ${
            hasQuota
              ? "bg-primary-50 border border-primary-100"
              : "bg-red-50 border border-red-100"
          }`}
        >
          <Zap
            size={16}
            className={hasQuota ? "text-primary-500" : "text-red-500"}
          />
          <div className="text-xs">
            {hasQuota ? (
              <>
                <span className="text-gray-700">
                  本次解锁将消耗{" "}
                  <span className="font-bold text-primary-600">1</span> 次额度
                </span>
                <span className="text-gray-500 ml-2">
                  (剩余 {remaining}/{quota.freeUnlockLimit})
                </span>
              </>
            ) : (
              <span className="text-red-600 font-medium">
                本月解锁额度已用完，请升级套餐
              </span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-[22px] hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium rounded-[22px] transition-all ${
              hasQuota
                ? "bg-gradient-to-br from-accent-400 to-accent-500 text-white shadow-sm hover:shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={() => hasQuota && onConfirm(user.id)}
            disabled={!hasQuota}
          >
            <Unlock size={14} />
            {hasQuota ? "确认解锁" : "额度不足"}
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default UnlockConfirmModal;
