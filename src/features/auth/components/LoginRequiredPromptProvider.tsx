import {
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  buildLoginPathWithRedirect,
  savePendingRedirectPath,
} from "@/utils/redirect";
import { LoginRequiredPrompt } from "./LoginRequiredPrompt";
import {
  LoginRequiredPromptContext,
  type LoginPromptRequest,
} from "./LoginRequiredPromptContext";

interface LoginRequiredPromptProviderProps {
  children: ReactNode;
}

export function LoginRequiredPromptProvider({
  children,
}: LoginRequiredPromptProviderProps) {
  const navigate = useNavigate();
  const [request, setRequest] = useState<LoginPromptRequest | null>(null);

  const showPrompt = useCallback((nextRequest: LoginPromptRequest) => {
    setRequest((currentRequest) => currentRequest ?? nextRequest);
  }, []);

  const continueAsGuest = useCallback(() => setRequest(null), []);

  const goToLogin = useCallback(() => {
    if (!request) return;

    savePendingRedirectPath(request.redirectAfterLogin);
    const loginPath = buildLoginPathWithRedirect(request.redirectAfterLogin);
    const navigateOptions = request.navigateOptions;
    setRequest(null);
    navigate(loginPath, navigateOptions);
  }, [navigate, request]);

  return (
    <LoginRequiredPromptContext.Provider value={showPrompt}>
      {children}
      <LoginRequiredPrompt
        open={!!request}
        targetPath={request?.targetPath || ""}
        onContinueAsGuest={continueAsGuest}
        onLogin={goToLogin}
      />
    </LoginRequiredPromptContext.Provider>
  );
}
