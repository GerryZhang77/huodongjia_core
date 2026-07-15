import { useCallback } from "react";
import { useNavigate, type NavigateOptions } from "react-router-dom";
import { useAuthStore } from "../stores";
import {
  buildLoginPathWithRedirect,
  savePendingRedirectPath,
} from "@/utils/redirect";
import { useLoginRequiredPrompt } from "../components/LoginRequiredPromptContext";

interface AuthNavigationOptions extends NavigateOptions {
  /** 登录成功后的落点；默认回到本次目标地址。 */
  redirectAfterLogin?: string;
  /** 明确的登录按钮可关闭提示，直接进入登录页。 */
  showLoginPrompt?: boolean;
}

/**
 * 在公开页面统一处理“需要身份”的导航。
 * 已登录用户直接前往目标页；游客确认后才进入登录页并保存安全回跳地址。
 */
export function useRequireAuthNavigation() {
  const navigate = useNavigate();
  const requestLoginPrompt = useLoginRequiredPrompt();
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasTrustedIdentity =
    authStatus === "authenticated" && isAuthenticated && !!user;

  const navigateWithAuth = useCallback(
    (targetPath: string, options: AuthNavigationOptions = {}) => {
      const {
        redirectAfterLogin = targetPath,
        showLoginPrompt = true,
        ...navigateOptions
      } = options;

      if (hasTrustedIdentity) {
        navigate(targetPath, navigateOptions);
        return true;
      }

      const goToLogin = () => {
        savePendingRedirectPath(redirectAfterLogin);
        navigate(buildLoginPathWithRedirect(redirectAfterLogin));
      };

      if (!showLoginPrompt) {
        goToLogin();
        return false;
      }

      requestLoginPrompt({
        targetPath,
        redirectAfterLogin,
        navigateOptions,
      });
      return false;
    },
    [hasTrustedIdentity, navigate, requestLoginPrompt],
  );

  return {
    isAuthenticated: hasTrustedIdentity,
    navigateWithAuth,
  };
}
