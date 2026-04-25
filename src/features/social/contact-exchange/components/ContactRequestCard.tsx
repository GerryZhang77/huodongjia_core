/**
 * 在聊天消息流中显示的"联系方式交换"卡片
 *
 * - pending（发送方）：显示"等对方处理"
 * - pending（接收方）：显示对方分享的内容预览 + 接受/拒绝按钮
 * - accepted：显示双方完整的联系方式
 * - rejected/revoked：显示状态文案
 */

import { FC, useState } from "react";
import { Phone, Mail, MessageCircle, Check, X, Copy, Contact } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { useAcceptExchange, useRejectExchange } from "../hooks/useExchangeMutations";
import { ContactPickerModal } from "./ContactPickerModal";
import type { ChatMessage } from "../../messaging/services/messageApi";
import type {
  Contacts,
  ExchangeStatus,
} from "../services/contactExchangeApi";

interface ContactRequestCardProps {
  message: ChatMessage;
  /** 是否是当前用户发出的请求 */
  isMine: boolean;
  /** 当卡片操作完成（接受/拒绝）时调用，用于刷新会话 */
  onUpdated?: () => void;
}

const fieldIcon = {
  phone: Phone,
  email: Mail,
  wechat: MessageCircle,
};

const fieldLabel: Record<keyof Contacts, string> = {
  phone: "手机号",
  email: "邮箱",
  wechat: "微信号",
};

const ContactList: FC<{ contacts: Contacts; copyable?: boolean }> = ({
  contacts,
  copyable = true,
}) => {
  const items: Array<keyof Contacts> = ["phone", "email", "wechat"];
  return (
    <div className="space-y-1">
      {items
        .filter((k) => !!contacts[k])
        .map((k) => {
          const Icon = fieldIcon[k];
          const v = contacts[k]!;
          return (
            <div
              key={k}
              className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300"
            >
              <Icon size={12} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-500 dark:text-gray-400 w-12 flex-shrink-0">
                {fieldLabel[k]}
              </span>
              <span className="font-mono truncate flex-1">{v}</span>
              {copyable && (
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(v).then(() =>
                      Toast.show({ content: "已复制" }),
                    )
                  }
                  className="p-1 rounded hover:bg-white/60 dark:hover:bg-gray-700"
                  aria-label="复制"
                >
                  <Copy size={11} />
                </button>
              )}
            </div>
          );
        })}
    </div>
  );
};

export const ContactRequestCard: FC<ContactRequestCardProps> = ({
  message,
  isMine,
  onUpdated,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  const accept = useAcceptExchange();
  const reject = useRejectExchange();
  const status = message.status as ExchangeStatus;

  const payload = (message.payload || {}) as {
    exchangeId?: string;
    fields?: string[];
    requesterContacts?: Contacts;
    receiverContacts?: Contacts;
  };

  const exchangeId = payload.exchangeId;
  const fields = payload.fields || [];

  const handleAccept = async (myContacts: Contacts) => {
    if (!exchangeId) return;
    try {
      await accept.mutateAsync({ id: exchangeId, contacts: myContacts });
      Toast.show({ icon: "success", content: "已接受" });
      setPickerOpen(false);
      onUpdated?.();
    } catch (err) {
      Toast.show({
        icon: "fail",
        content: err instanceof Error ? err.message : "操作失败",
      });
      throw err;
    }
  };

  const handleReject = async () => {
    if (!exchangeId) return;
    try {
      await reject.mutateAsync(exchangeId);
      Toast.show({ icon: "success", content: "已拒绝" });
      onUpdated?.();
    } catch (err) {
      Toast.show({
        icon: "fail",
        content: err instanceof Error ? err.message : "操作失败",
      });
    }
  };

  return (
    <>
      <div
        className={[
          // 关键：固定一个舒适的最小宽度，让卡片不被消息容器挤窄
          "w-[300px] sm:w-[340px] max-w-full",
          "rounded-2xl border px-4 py-3 shadow-sm",
          status === "accepted"
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800/40"
            : status === "rejected"
              ? "bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700"
              : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-800/40",
        ].join(" ")}
      >
        {/* 标题行 */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={[
              "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
              status === "accepted"
                ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300"
                : status === "rejected"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  : "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300",
            ].join(" ")}
          >
            <Contact size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              联系方式交换
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
              {status === "pending" &&
                (isMine
                  ? "等待对方接受"
                  : "对方想跟你交换联系方式")}
              {status === "accepted" && "✓ 双方已交换"}
              {status === "rejected" && (isMine ? "对方已拒绝" : "你已拒绝")}
              {status === "revoked" && "已撤销"}
            </p>
          </div>
        </div>

        {/* pending 内容 */}
        {status === "pending" && (
          <>
            {fields.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3 pl-1">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {isMine ? "你分享了：" : "对方愿意分享："}
                </span>
                {fields.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/70 dark:bg-gray-800/40 rounded-full text-[11px] text-gray-700 dark:text-gray-200"
                  >
                    {fieldLabel[f as keyof Contacts] ?? f}
                  </span>
                ))}
              </div>
            )}

            {/* 接收方：操作按钮 */}
            {!isMine && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  disabled={accept.isPending}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-60"
                >
                  <Check size={13} />
                  接受并分享
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={reject.isPending}
                  className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-60"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </>
        )}

        {/* accepted 内容：双方联系方式 */}
        {status === "accepted" && (
          <div className="space-y-2 mt-1">
            {payload.requesterContacts && (
              <div className="bg-white/70 dark:bg-gray-800/40 rounded-lg p-2.5">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  {isMine ? "你分享的" : "对方的"}
                </p>
                <ContactList
                  contacts={payload.requesterContacts}
                  copyable={!isMine}
                />
              </div>
            )}
            {payload.receiverContacts && (
              <div className="bg-white/70 dark:bg-gray-800/40 rounded-lg p-2.5">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  {isMine ? "对方的" : "你分享的"}
                </p>
                <ContactList
                  contacts={payload.receiverContacts}
                  copyable={isMine}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 接受时选择回赠的联系方式 */}
      <ContactPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSubmit={handleAccept}
        title="选择你要分享的联系方式"
        okText="接受并分享"
        description="对方将能看到你勾选的联系方式"
        submitting={accept.isPending}
      />
    </>
  );
};

export default ContactRequestCard;
