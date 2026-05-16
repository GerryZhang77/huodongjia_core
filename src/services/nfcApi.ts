import { api } from "@/services/api";
import type { UserProfile } from "./userApi";

export type NfcTagStatus = "unbound" | "bound" | "disabled" | "lost" | "invalid";

export interface NfcTagInfo {
  tokenPrefix: string | null;
  status: NfcTagStatus;
  ownerUserId: string | null;
  boundAt: string | null;
  label: string | null;
  metadata: Record<string, unknown>;
}

export interface NfcResolveData {
  tag: NfcTagInfo;
  status: NfcTagStatus;
  profile: UserProfile | null;
  viewer: {
    isAuthenticated: boolean;
    isSelf: boolean;
  };
  actions: {
    canBind: boolean;
    requiresLoginToBind: boolean;
    canEdit: boolean;
    canFollow: boolean;
    canMessage: boolean;
    requiresLoginForSocial: boolean;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function resolveNfcTag(token: string): Promise<NfcResolveData> {
  const res = await api.get<ApiResponse<NfcResolveData>>(
    `/api/nfc/t/${encodeURIComponent(token)}`,
  );
  return res.data;
}

export async function bindNfcTag(token: string): Promise<NfcResolveData> {
  const res = await api.post<ApiResponse<NfcResolveData>>(
    `/api/nfc/t/${encodeURIComponent(token)}/bind`,
  );
  return res.data;
}
