import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, QrCode, X } from "lucide-react";
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

function canUseDirectDownload(): boolean {
  return !/MicroMessenger|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function copyWithFallback(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export const RegistrationQrModal: React.FC<RegistrationQrModalProps> = ({
  visible,
  activityId,
  activityTitle,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showCopyFallback, setShowCopyFallback] = useState(false);
  const [showQrPreview, setShowQrPreview] = useState(false);

  const registrationUrl = useMemo(() => {
    if (!activityId) return "";
    return `${getPublicAppOrigin()}/u/activities/${encodeURIComponent(activityId)}/register`;
  }, [activityId]);

  const hasLocalAddress = isLocalAddress(registrationUrl);

  useEffect(() => {
    if (!visible || !registrationUrl) return;
    setQrDataUrl("");
    setShowCopyFallback(false);
    setShowQrPreview(false);
    QRCode.toDataURL(registrationUrl, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
    }).then(setQrDataUrl);
  }, [visible, registrationUrl]);

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(registrationUrl);
      } else if (!copyWithFallback(registrationUrl)) {
        throw new Error("clipboard unavailable");
      }
      setShowCopyFallback(false);
      Toast.show({ content: "报名链接已复制" });
    } catch {
      setShowCopyFallback(true);
      Toast.show({ content: "复制失败，请长按链接复制" });
    }
  };

  const saveQrCode = () => {
    if (!qrDataUrl) return;
    if (!canUseDirectDownload()) {
      setShowQrPreview(true);
      return;
    }

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `activity-${activityId}-registration-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          {showCopyFallback && (
            <textarea
              className="w-full h-20 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none"
              value={registrationUrl}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
            />
          )}
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
            <button
              type="button"
              className="h-10 rounded-lg bg-primary-400 text-white text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
              onClick={saveQrCode}
              disabled={!qrDataUrl}
            >
              <Download size={14} />
              保存二维码
            </button>
          </div>
        </div>
      </div>
      {showQrPreview && qrDataUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-4 text-center">
            <img src={qrDataUrl} alt="报名二维码" className="w-full aspect-square" />
            <p className="mt-3 text-sm text-gray-600">长按二维码图片保存</p>
            <button
              type="button"
              className="mt-4 h-10 w-full rounded-lg bg-gray-900 text-sm font-medium text-white"
              onClick={() => setShowQrPreview(false)}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationQrModal;
