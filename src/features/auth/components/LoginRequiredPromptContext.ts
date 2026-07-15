import { createContext, useContext } from "react";
import type { NavigateOptions } from "react-router-dom";

export interface LoginPromptRequest {
  targetPath: string;
  redirectAfterLogin: string;
  navigateOptions?: NavigateOptions;
}

export type RequestLoginPrompt = (request: LoginPromptRequest) => void;

export const LoginRequiredPromptContext =
  createContext<RequestLoginPrompt | null>(null);

export function useLoginRequiredPrompt(): RequestLoginPrompt {
  const requestLoginPrompt = useContext(LoginRequiredPromptContext);
  if (!requestLoginPrompt) {
    throw new Error(
      "useLoginRequiredPrompt must be used within LoginRequiredPromptProvider",
    );
  }
  return requestLoginPrompt;
}
