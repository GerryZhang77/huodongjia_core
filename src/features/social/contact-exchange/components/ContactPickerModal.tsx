/**
 * 联系方式选择 Modal
 *
 * 用于：
 * - 发起交换：发送方选择要分享给对方的联系方式
 * - 接受交换：接收方选择要回赠的联系方式
 *
 * 行为：
 * - 拉取我的当前联系方式（getMyContacts），未填的字段会被禁用并提示去补齐
 * - 至少选 1 项才能确认
 */

import { FC, ElementType, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MessageCircle, AlertCircle } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useMyContacts } from "../hooks/useMyContacts";
import type { Contacts } from "../services/contactExchangeApi";

interface ContactPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** 提交回调，仅传被勾选的联系方式 */
  onSubmit: (contacts: Contacts) => Promise<void> | void;
  /** 标题与确认按钮文案 */
  title?: string;
  okText?: string;
  /** 描述文字 */
  description?: string;
  /** 加载/提交中 */
  submitting?: boolean;
}

const FIELDS: Array<{
  key: keyof Contacts;
  label: string;
  icon: ElementType;
}> = [
  { key: "phone", label: "手机号", icon: Phone },
  { key: "email", label: "邮箱", icon: Mail },
  { key: "wechat", label: "微信号", icon: MessageCircle },
];

export const ContactPickerModal: FC<ContactPickerModalProps> = ({
  open,
  onClose,
  onSubmit,
  title = "选择要分享的联系方式",
  okText = "发送",
  description,
  submitting = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: my, isLoading } = useMyContacts();
  const [selected, setSelected] = useState<Record<keyof Contacts, boolean>>({
    phone: false,
    email: false,
    wechat: false,
  });

  // 默认勾选所有已填字段
  useEffect(() => {
    if (open && my?.contacts) {
      setSelected({
        phone: !!my.contacts.phone,
        email: !!my.contacts.email,
        wechat: !!my.contacts.wechat,
      });
    }
  }, [open, my?.contacts]);

  const hasAny = !!my?.hasAny;
  const canSubmit = useMemo(() => {
    if (!my?.contacts) return false;
    const c = my.contacts;
    return (
      (selected.phone && !!c.phone) ||
      (selected.email && !!c.email) ||
      (selected.wechat && !!c.wechat)
    );
  }, [my?.contacts, selected]);

  const handleOk = async () => {
    if (!my?.contacts || !canSubmit) return;
    const payload: Contacts = {};
    if (selected.phone && my.contacts.phone) payload.phone = my.contacts.phone;
    if (selected.email && my.contacts.email) payload.email = my.contacts.email;
    if (selected.wechat && my.contacts.wechat) payload.wechat = my.contacts.wechat;
    await onSubmit(payload);
  };

  const profileEditPath =
    user?.user_type === "organizer" || user?.user_type === "admin"
      ? "/dashboard/profile/edit"
      : "/u/profile/edit";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width="small"
      centered
      showFooter={false}
    >
      <div className="space-y-3">
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}

        {isLoading ? (
          <div className="py-6 text-center text-sm text-gray-400">加载中...</div>
        ) : !hasAny ? (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                请先添加联系方式
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                你需要在个人资料中至少填写一项手机/邮箱/微信，才能发起或接受联系方式交换。
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(profileEditPath);
                }}
                className="mt-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                前往设置 →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {FIELDS.map(({ key, label, icon: Icon }) => {
              const v = my?.contacts?.[key];
              const has = !!v;
              const checked = selected[key];
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!has}
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                    !has
                      ? "border-gray-100 dark:border-gray-700 opacity-50 cursor-not-allowed"
                      : checked
                        ? "border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      checked && has
                        ? "bg-primary-500 border-primary-500"
                        : "border-gray-300 dark:border-gray-500"
                    }`}
                  >
                    {checked && has && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <Icon size={16} className="text-gray-500 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {has ? v : "未填写"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            取消
          </Button>
          {hasAny && (
            <Button
              variant="primary"
              onClick={handleOk}
              disabled={!canSubmit || submitting}
              loading={submitting}
            >
              {okText}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ContactPickerModal;
