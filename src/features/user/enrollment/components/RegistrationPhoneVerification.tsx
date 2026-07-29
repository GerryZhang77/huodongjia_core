import { useEffect, useRef, useState, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui";
import { Toast } from "@/components/ui/Toast";
import {
  bindPhoneBySms,
  loginBySms,
  sendSmsCode,
} from "@/features/auth/services";
import { useAuthStore } from "@/features/auth/stores";

const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const SMS_CODE_LENGTH = 4;
const COUNTDOWN_SECONDS = 60;

interface RegistrationPhoneVerificationProps {
  activityTitle: string;
}

const RegistrationPhoneVerification: FC<
  RegistrationPhoneVerificationProps
> = ({ activityTitle }) => {
  const queryClient = useQueryClient();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sentPhone, setSentPhone] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const codeInputRef = useRef<HTMLInputElement>(null);

  const isValidPhone = PHONE_PATTERN.test(phone);
  const wasSentToCurrentPhone = sentPhone === phone;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(
      () => setCountdown((current) => current - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!isValidPhone) {
      setError(phone ? "请输入正确的手机号" : "请输入手机号");
      return;
    }

    setSending(true);
    setError("");
    try {
      const response = await sendSmsCode(phone, "enrollment");
      if (!response.success) {
        setError(response.message || "验证码发送失败");
        return;
      }
      setSentPhone(phone);
      setCode("");
      setCountdown(COUNTDOWN_SECONDS);
      window.setTimeout(() => codeInputRef.current?.focus(), 0);
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!isValidPhone) {
      setError("请输入正确的手机号");
      return;
    }
    if (sentPhone !== phone || code.length !== SMS_CODE_LENGTH) {
      setError(`请输入发送到当前手机号的 ${SMS_CODE_LENGTH} 位验证码`);
      return;
    }

    setVerifying(true);
    setError("");
    try {
      const response = isAuthenticated
        ? await bindPhoneBySms(phone, code, "enrollment")
        : await loginBySms(phone, code, "enrollment");
      if (!response.success || !response.user || !response.token) {
        setError(response.message || "手机号验证失败");
        return;
      }

      setAuth(response.user, response.token);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user", "activity"] }),
        queryClient.invalidateQueries({ queryKey: ["user", "profile-prefill"] }),
      ]);
      Toast.show({
        icon: "success",
        content: response.isNewUser
          ? "手机号验证成功，平台账号已创建"
          : "手机号验证成功",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <section className="mx-4 mt-5 rounded-2xl border border-primary-100 bg-white p-5 shadow-sm dark:border-primary-900/40 dark:bg-gray-800 md:mx-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30">
          <Smartphone size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            验证手机号后继续报名
          </h2>
          <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
            手机号用于识别你在「{activityTitle}」中的报名记录，并作为后续验证码登录方式。
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            手机号 <span className="text-error-500">*</span>
          </span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            maxLength={11}
            onChange={(event) => {
              const nextPhone = event.target.value
                .replace(/\D/g, "")
                .slice(0, 11);
              setPhone(nextPhone);
              if (nextPhone !== sentPhone) {
                setCode("");
                setCountdown(0);
              }
              setError("");
            }}
            placeholder="请输入 11 位手机号"
            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </label>

        <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
          <label>
            <span className="sr-only">短信验证码</span>
            <input
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              maxLength={SMS_CODE_LENGTH}
              onChange={(event) => {
                setCode(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, SMS_CODE_LENGTH),
                );
                setError("");
              }}
              placeholder="短信验证码"
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </label>
          <button
            type="button"
            disabled={sending || !isValidPhone || countdown > 0}
            onClick={() => void handleSendCode()}
            className="h-11 rounded-xl border border-primary-200 px-3 text-sm font-medium text-primary-600 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending
              ? "发送中…"
              : countdown > 0
                ? `${countdown}s 后重发`
                : wasSentToCurrentPhone
                  ? "重新发送"
                  : "获取验证码"}
          </button>
        </div>

        {error && (
          <p role="alert" className="text-sm text-error-500">
            {error}
          </p>
        )}

        <Button
          className="h-12 w-full"
          disabled={
            verifying ||
            !isValidPhone ||
            sentPhone !== phone ||
            code.length !== SMS_CODE_LENGTH
          }
          loading={verifying}
          onClick={() => void handleVerify()}
        >
          验证并继续
        </Button>
      </div>

      <p className="mt-4 flex items-start gap-1.5 text-xs leading-5 text-gray-500 dark:text-gray-400">
        <ShieldCheck
          size={14}
          className="mt-0.5 shrink-0 text-emerald-600"
          aria-hidden="true"
        />
        新手机号会自动创建随机密码账号，密码不会展示或发送；以后直接使用手机验证码登录。
      </p>
    </section>
  );
};

export default RegistrationPhoneVerification;
