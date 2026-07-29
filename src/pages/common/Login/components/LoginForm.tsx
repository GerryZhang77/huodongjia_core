import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Info } from "lucide-react";
import { Modal } from "@/components/ui";
import { Toast } from "@/components/ui/Toast";
import { UserAgreement, PrivacyPolicy } from "@/components/legal";
import { useLogin } from "@/features/auth/hooks";
import { sendSmsCode } from "@/features/auth/services";
import { TEST_ACCOUNTS } from "@/features/auth/utils";
import checkIcon from "@/assets/auth/login/check.svg";
import emailLoginIcon from "@/assets/auth/login/email-login.svg";
import qqLoginIcon from "@/assets/auth/login/qq-login.svg";
import socialCircle from "@/assets/auth/login/social-circle.svg";
import tabDivider from "@/assets/auth/login/tab-divider.svg";
import wechatLogo from "@/assets/auth/login/wechat-logo.svg";

type LoginMode = "password" | "sms";

const SMS_CODE_LENGTH = 4;
const SMS_COUNTDOWN_SECONDS = 60;
const REMEMBERED_ACCOUNT_KEY = "openevent:remembered-login-account";

function readRememberedAccount() {
  try {
    return localStorage.getItem(REMEMBERED_ACCOUNT_KEY) || "";
  } catch {
    return "";
  }
}

function persistRememberedAccount(enabled: boolean, account: string) {
  try {
    if (enabled && account.trim()) {
      localStorage.setItem(REMEMBERED_ACCOUNT_KEY, account.trim());
    } else {
      localStorage.removeItem(REMEMBERED_ACCOUNT_KEY);
    }
  } catch {
    // 隐私模式下 localStorage 可能不可用，不阻断登录。
  }
}

export const LoginForm = () => {
  const rememberedAccount = useRef(readRememberedAccount()).current;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginBySms, loading } = useLogin();

  const [mode, setMode] = useState<LoginMode>(
    searchParams.get("mode") === "password" ? "password" : "sms",
  );
  const [identifier, setIdentifier] = useState(rememberedAccount);
  const [password, setPassword] = useState("");
  const [smsPhone, setSmsPhone] = useState(
    /^1[3-9]\d{9}$/.test(rememberedAccount) ? rememberedAccount : "",
  );
  const [smsCode, setSmsCode] = useState("");
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [smsSentTo, setSmsSentTo] = useState("");
  const [sendingSms, setSendingSms] = useState(false);
  const [rememberAccount, setRememberAccount] = useState(
    Boolean(rememberedAccount),
  );
  const [error, setError] = useState("");
  const [showUserAgreement, setShowUserAgreement] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const smsCodeRef = useRef<HTMLInputElement>(null);

  const canShowTestAccounts =
    import.meta.env.DEV &&
    import.meta.env.VITE_PRODUCTION_MODE !== "true" &&
    searchParams.get("testAccounts") === "1";
  const validSmsPhone = /^1[3-9]\d{9}$/.test(smsPhone);
  const hasCompleteSmsCode = smsCode.length === SMS_CODE_LENGTH;
  const hasSentCurrentPhone = validSmsPhone && smsSentTo === smsPhone;

  useEffect(() => {
    if (smsCountdown <= 0) return;
    const timer = window.setTimeout(
      () => setSmsCountdown((current) => current - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [smsCountdown]);

  const clearError = () => {
    if (error) setError("");
  };

  const switchMode = (nextMode: LoginMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setError("");
  };

  const handlePasswordSubmit = async () => {
    const normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier) {
      setError("请输入账号");
      return;
    }
    if (!password) {
      setError("请输入密码");
      return;
    }

    const success = await login({
      identifier: normalizedIdentifier,
      password,
    });
    if (success) {
      persistRememberedAccount(rememberAccount, normalizedIdentifier);
    }
  };

  const handleSendSmsCode = async () => {
    setError("");
    if (!validSmsPhone) {
      setError(smsPhone ? "请输入正确的手机号" : "请输入手机号");
      return;
    }

    setSendingSms(true);
    try {
      const response = await sendSmsCode(smsPhone, "login");
      if (!response.success) {
        setError(response.message || "发送验证码失败");
        return;
      }
      setSmsSentTo(smsPhone);
      setSmsCountdown(SMS_COUNTDOWN_SECONDS);
      window.setTimeout(() => smsCodeRef.current?.focus(), 0);
    } catch (sendError) {
      console.error("[LoginForm] 发送验证码失败", sendError);
      setError("发送验证码失败，请稍后重试");
    } finally {
      setSendingSms(false);
    }
  };

  const handleSmsLogin = async () => {
    if (!validSmsPhone) {
      setError(smsPhone ? "请输入正确的手机号" : "请输入手机号");
      return;
    }
    if (!hasCompleteSmsCode) {
      setError(`请输入${SMS_CODE_LENGTH}位验证码`);
      return;
    }

    const success = await loginBySms(smsPhone, smsCode);
    if (success) {
      persistRememberedAccount(rememberAccount, smsPhone);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (mode === "password") {
      await handlePasswordSubmit();
      return;
    }

    if (hasCompleteSmsCode) {
      await handleSmsLogin();
      return;
    }

    if (smsCountdown === 0) {
      await handleSendSmsCode();
    }
  };

  const getSmsActionLabel = () => {
    if (loading && hasCompleteSmsCode) return "登录中...";
    if (sendingSms) return "发送中...";
    if (hasCompleteSmsCode) return "登录";
    if (smsCountdown > 0) return `重新获取（${smsCountdown}）`;
    return hasSentCurrentPhone ? "重新获取" : "获取验证码";
  };

  const isActionDisabled =
    mode === "password"
      ? loading || !identifier.trim() || !password
      : loading ||
        sendingSms ||
        !validSmsPhone ||
        (!hasCompleteSmsCode && smsCountdown > 0);

  const navigateToRegister = () => {
    const redirect = searchParams.get("redirect");
    navigate(
      redirect
        ? `/register?redirect=${encodeURIComponent(redirect)}`
        : "/register",
    );
  };

  const showUnavailable = (channel: string) => {
    Toast.show({ content: `${channel}登录暂未开放`, position: "center" });
  };

  const handleQuickFill = (account: (typeof TEST_ACCOUNTS)[0]) => {
    setMode("password");
    setIdentifier(account.value);
    setPassword("123456");
    setRememberAccount(false);
    setError("");
    setShowTestAccounts(false);
  };

  return (
    <div className="openevent-login-form-shell">
      <div className="openevent-login-card">
        <div className="openevent-login-tabs" role="tablist" aria-label="登录方式">
          <img src={tabDivider} alt="" aria-hidden="true" />
          <button
            type="button"
            role="tab"
            aria-selected={mode === "sms"}
            className={mode === "sms" ? "is-active" : ""}
            onClick={() => switchMode("sms")}
          >
            验证码登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "password"}
            className={mode === "password" ? "is-active" : ""}
            onClick={() => switchMode("password")}
          >
            密码登录
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {mode === "password" ? (
            <>
              <label className="openevent-login-field openevent-login-field-first">
                <span className="sr-only">账号</span>
                <input
                  type="text"
                  name="login-identifier"
                  aria-label="账号"
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                    clearError();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      passwordRef.current?.focus();
                    }
                  }}
                  placeholder="请输入账号"
                  autoComplete="username"
                />
              </label>
              <label className="openevent-login-field openevent-login-field-second">
                <span className="sr-only">密码</span>
                <input
                  ref={passwordRef}
                  type="password"
                  name="login-password"
                  aria-label="密码"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearError();
                  }}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
              </label>
            </>
          ) : (
            <>
              <label className="openevent-login-field openevent-login-field-first openevent-phone-field">
                <span className="sr-only">手机号</span>
                <span className="openevent-phone-prefix" aria-hidden="true">
                  +86
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  aria-label="手机号"
                  value={smsPhone}
                  maxLength={11}
                  onChange={(event) => {
                    const nextPhone = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 11);
                    setSmsPhone(nextPhone);
                    if (nextPhone !== smsSentTo) {
                      setSmsCountdown(0);
                      setSmsCode("");
                    }
                    clearError();
                  }}
                  placeholder="请输入手机号"
                  autoComplete="tel"
                />
              </label>
              <label className="openevent-login-field openevent-login-field-second">
                <span className="sr-only">验证码</span>
                <input
                  ref={smsCodeRef}
                  type="text"
                  inputMode="numeric"
                  aria-label="验证码"
                  value={smsCode}
                  maxLength={SMS_CODE_LENGTH}
                  onChange={(event) => {
                    setSmsCode(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, SMS_CODE_LENGTH),
                    );
                    clearError();
                  }}
                  placeholder="请输入验证码"
                  autoComplete="one-time-code"
                />
              </label>
            </>
          )}

          <button
            type="submit"
            className="openevent-login-action"
            disabled={isActionDisabled}
          >
            {mode === "password"
              ? loading
                ? "登录中..."
                : "登录"
              : getSmsActionLabel()}
          </button>
        </form>

        <p className="openevent-login-error" role="alert" aria-live="polite">
          {error}
        </p>

        <div className="openevent-login-assist">
          <label className="openevent-remember-account">
            <input
              type="checkbox"
              checked={rememberAccount}
              onChange={(event) => {
                const checked = event.target.checked;
                setRememberAccount(checked);
                if (!checked) persistRememberedAccount(false, "");
              }}
            />
            <span className="openevent-remember-box" aria-hidden="true">
              {rememberAccount && <img src={checkIcon} alt="" />}
            </span>
            <span>记住账号</span>
          </label>
          <button type="button" onClick={() => navigate("/forgot-password")}>
            忘记密码?
          </button>
        </div>

        <p className="openevent-register-entry">
          还没有账号?
          <button type="button" onClick={navigateToRegister}>
            立即注册
          </button>
        </p>

        <div className="openevent-social-logins" aria-label="其他登录方式">
          <button
            type="button"
            onClick={() => showUnavailable("QQ")}
            aria-label="QQ登录，暂未开放"
            title="QQ登录暂未开放"
          >
            <img src={qqLoginIcon} alt="" />
          </button>
          <button
            type="button"
            className="openevent-wechat-login"
            onClick={() => showUnavailable("微信")}
            aria-label="微信登录，暂未开放"
            title="微信登录暂未开放"
          >
            <img src={socialCircle} alt="" className="openevent-social-circle" />
            <img src={wechatLogo} alt="" className="openevent-wechat-logo" />
          </button>
          <button
            type="button"
            onClick={() => showUnavailable("邮箱")}
            aria-label="邮箱登录，暂未开放"
            title="邮箱登录暂未开放"
          >
            <img src={emailLoginIcon} alt="" />
          </button>
        </div>

        <p className="openevent-login-legal">
          <span>登录即代表同意</span>
          <button type="button" onClick={() => setShowUserAgreement(true)}>
            《用户协议》
          </button>
          <span>和</span>
          <button type="button" onClick={() => setShowPrivacyPolicy(true)}>
            《隐私政策》
          </button>
        </p>
      </div>

      {canShowTestAccounts && (
        <div className="openevent-test-accounts">
          <button
            type="button"
            onClick={() => setShowTestAccounts((current) => !current)}
          >
            <Info size={14} />
            {showTestAccounts ? "收起测试账号" : "查看测试账号"}
          </button>
          {showTestAccounts && (
            <div>
              {TEST_ACCOUNTS.map((account) => (
                <button
                  type="button"
                  key={account.value}
                  onClick={() => handleQuickFill(account)}
                >
                  {account.label} · {account.value}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        open={showUserAgreement}
        onClose={() => setShowUserAgreement(false)}
        title="用户服务协议"
        width="large"
        closable
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <UserAgreement />
        </div>
      </Modal>

      <Modal
        open={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        title="隐私政策"
        width="large"
        closable
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <PrivacyPolicy />
        </div>
      </Modal>
    </div>
  );
};
