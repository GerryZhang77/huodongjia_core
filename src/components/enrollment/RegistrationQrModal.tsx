import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Copy, QrCode, X } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

interface RegistrationQrModalProps {
  visible: boolean;
  activityId: string;
  activityTitle?: string;
  onClose: () => void;
}

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

function getPublicAppOrigin(): string {
  const configuredOrigin = import.meta.env.VITE_PUBLIC_APP_URL;
  if (configuredOrigin) return normalizeOrigin(configuredOrigin);
  return "https://www.eventclub.cn";
}

function isLocalAddress(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(url);
}

export const RegistrationQrModal: React.FC<RegistrationQrModalProps> = ({
  visible,
  activityId,
  activityTitle,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState("");

  const registrationUrl = useMemo(() => {
    if (!activityId) return "";
    return `${getPublicAppOrigin()}/u/activities/${encodeURIComponent(activityId)}/register`;
  }, [activityId]);

  const hasLocalAddress = isLocalAddress(registrationUrl);

  useEffect(() => {
    if (!visible || !registrationUrl) return;
    setQrDataUrl("");
    QRCode.toDataURL(registrationUrl, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
    }).then(setQrDataUrl);
  }, [visible, registrationUrl]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(registrationUrl);
    Toast.show({ content: "报名链接已复制" });
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <QrCode size={18} />
            报名二维码
          </div>
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            onClick={onClose}
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {activityTitle && (
            <div className="text-sm font-medium text-gray-900 truncate">
              {activityTitle}
            </div>
          )}
          <div className="flex justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="报名二维码" className="w-64 h-64" />
            ) : (
              <div className="w-64 h-64 bg-gray-50 rounded-xl flex items-center justify-center text-sm text-gray-400">
                生成中...
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 break-all bg-gray-50 rounded-lg p-3">
            {registrationUrl}
          </div>
          {hasLocalAddress && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 leading-relaxed">
              当前链接是本机地址，外部用户无法打开。请配置公网前端地址后重新生成二维码。
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              className="h-10 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium flex items-center justify-center gap-1"
              onClick={copyLink}
            >
              <Copy size={14} />
              复制链接
            </button>
            <a
              className="h-10 rounded-lg bg-primary-400 text-white text-sm font-medium flex items-center justify-center"
              href={qrDataUrl}
              download={`activity-${activityId}-registration-qr.png`}
            >
              下载二维码
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationQrModal;
