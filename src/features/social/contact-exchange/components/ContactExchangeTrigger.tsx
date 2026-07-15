/**
 * "交换名片" 触发按钮 + 联动 ContactPickerModal
 *
 * 智能态：
 * - 无记录 → "交换名片"（可点）
 * - 进行中（我发起）→ "等待对方接受"（disabled）
 * - 进行中（对方发起）→ "去查看请求"（提示用户向上滚消息流）
 * - 已交换 + 我的联系方式无变化 → "已交换"（disabled，hover 显示提示）
 * - 已交换 + 我的联系方式有变化 → "更新名片"（可点，发起新请求）
 * - 拒绝/撤销 → "重新交换"（可点）
 */

import { FC, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IdCard, Check, Clock, RefreshCcw } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { ContactPickerModal } from "./ContactPickerModal";
import { useRequestExchange } from "../hooks/useExchangeMutations";
import { useMyContacts } from "../hooks/useMyContacts";
import {
  getExchangeWithPeer,
  type Contacts,
  type ContactExchange,
} from "../services/contactExchangeApi";
import { useAuthStore } from "@/features/auth/stores/authStore";

interface ContactExchangeTriggerProps {
  /** 接收方用户 id */
  peerId: string;
  /** 紧凑样式（顶栏使用） */
  compact?: boolean;
}

const FIELDS: Array<keyof Contacts> = ["phone", "email", "wechat"];
const norm = (v?: string | null) => (v ? v.trim() : "");
const contactsEqual = (a?: Contacts | null, b?: Contacts | null) => {
  const aa = (a || {}) as Contacts;
  const bb = (b || {}) as Contacts;
  return FIELDS.every((k) => norm(aa[k]) === norm(bb[k]));
};

export const ContactExchangeTrigger: FC<ContactExchangeTriggerProps> = ({
  peerId,
  compact = true,
}) => {
  const [open, setOpen] = useState(false);
  const { user: currentUser } = useAuthStore();
  const myId = currentUser?.id;

  // 拉最新的交换状态
  const { data: latestExchange } = useQuery<ContactExchange | null>({
    queryKey: ["contact-exchange", "peer", peerId],
    queryFn: () => getExchangeWithPeer(peerId),
    enabled: !!peerId,
    staleTime: 30 * 1000,
  });

  // 拉我当前联系方式（用于判断 accepted 后是否变化）
  const { data: myContacts } = useMyContacts();

  const request = useRequestExchange();

  // 计算按钮态
  const buttonState = useMemo(() => {
    if (!latestExchange) {
      return {
        kind: "fresh" as const,
        label: "交换名片",
        disabled: false,
        icon: IdCard,
      };
    }
    const ex = latestExchange;
    if (ex.status === "pending") {
      const iAmRequester = ex.requester_id === myId;
      if (iAmRequester) {
        return {
          kind: "pending-mine" as const,
          label: "等待对方接受",
          disabled: true,
          icon: Clock,
        };
      }
      return {
        kind: "pending-theirs" as const,
        label: "去查看请求",
        disabled: false,
        icon: Clock,
      };
    }
    if (ex.status === "accepted") {
      const myLast =
        ex.requester_id === myId
          ? ex.requester_contacts
          : ex.receiver_contacts;
      const equal = contactsEqual(myLast, myContacts?.contacts);
      if (equal) {
        return {
          kind: "accepted-same" as const,
          label: "已交换",
          disabled: true,
          icon: Check,
        };
      }
      return {
        kind: "accepted-changed" as const,
        label: "更新名片",
        disabled: false,
        icon: RefreshCcw,
      };
    }
    // rejected / revoked
    return {
      kind: "retry" as const,
      label: "重新交换",
      disabled: false,
      icon: RefreshCcw,
    };
  }, [latestExchange, myContacts?.contacts, myId]);

  const Icon = buttonState.icon;

  const handleClick = () => {
    if (buttonState.disabled) return;
    if (buttonState.kind === "pending-theirs") {
      Toast.show({ content: "请在聊天中处理对方的交换请求" });
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (contacts: Contacts) => {
    try {
      await request.mutateAsync({ receiverId: peerId, contacts });
      Toast.show({ icon: "success", content: "请求已发送" });
      setOpen(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "发送失败";
      Toast.show({ icon: "fail", content: msg });
      throw err;
    }
  };

  const sizeCls = compact
    ? "px-2.5 py-1 text-xs gap-1"
    : "px-3 py-1.5 text-sm gap-1.5";

  const tooltip =
    buttonState.kind === "accepted-same"
      ? "你们已交换过联系方式"
      : buttonState.kind === "pending-mine"
        ? "等待对方接受请求"
        : buttonState.kind === "pending-theirs"
          ? "对方发起了请求，请在聊天中处理"
          : buttonState.kind === "accepted-changed"
            ? "你的联系方式有更新，可重新分享给对方"
            : "向对方发起交换名片请求";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={buttonState.disabled || request.isPending}
        title={tooltip}
        className={[
          "inline-flex flex-shrink-0 flex-nowrap items-center whitespace-nowrap rounded-full font-medium transition-colors [&>svg]:shrink-0",
          sizeCls,
          buttonState.disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
            : buttonState.kind === "accepted-changed"
              ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
              : "bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60",
        ].join(" ")}
      >
        <Icon size={compact ? 13 : 15} />
        <span>{buttonState.label}</span>
      </button>

      <ContactPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        title={
          buttonState.kind === "accepted-changed"
            ? "更新名片"
            : "发起联系方式交换"
        }
        okText={buttonState.kind === "accepted-changed" ? "重新分享" : "发送请求"}
        description="对方接受后，双方都能看到所选联系方式"
        submitting={request.isPending}
      />
    </>
  );
};

export default ContactExchangeTrigger;
