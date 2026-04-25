/**
 * "交换联系方式" 触发按钮 + 自动联动 ContactPickerModal
 *
 * 用作 MessageInput 的 leadingSlot
 */

import { FC, useState } from "react";
import { Contact } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { ContactPickerModal } from "./ContactPickerModal";
import { useRequestExchange } from "../hooks/useExchangeMutations";
import type { Contacts } from "../services/contactExchangeApi";

interface ContactExchangeTriggerProps {
  /** 接收方用户 id */
  peerId: string;
}

export const ContactExchangeTrigger: FC<ContactExchangeTriggerProps> = ({
  peerId,
}) => {
  const [open, setOpen] = useState(false);
  const request = useRequestExchange();

  const handleSubmit = async (contacts: Contacts) => {
    try {
      await request.mutateAsync({ receiverId: peerId, contacts });
      Toast.show({ icon: "success", content: "请求已发送" });
      setOpen(false);
    } catch (err) {
      Toast.show({
        icon: "fail",
        content: err instanceof Error ? err.message : "发送失败",
      });
      throw err;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
        aria-label="交换联系方式"
        title="交换联系方式"
      >
        <Contact size={18} />
      </button>

      <ContactPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        title="发起联系方式交换"
        okText="发送请求"
        description="对方接受后，双方都能看到所选联系方式"
        submitting={request.isPending}
      />
    </>
  );
};

export default ContactExchangeTrigger;
