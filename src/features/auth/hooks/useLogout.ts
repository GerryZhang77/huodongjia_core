import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { clearProtectedImageObjectUrlCache } from "@/services/protectedImageCache";

/** 清除完整的浏览器会话，并统一返回可公开访问的首页。 */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useCallback(() => {
    clearAuth();
    clearProtectedImageObjectUrlCache();
    queryClient.clear();
    navigate("/", { replace: true });
  }, [clearAuth, navigate, queryClient]);
}
