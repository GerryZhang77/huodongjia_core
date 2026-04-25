import { api } from "@/services/api/client";

// ========================================
// 类型
// ========================================

export interface Contacts {
  phone?: string;
  email?: string;
  wechat?: string;
}

export type ExchangeStatus = "pending" | "accepted" | "rejected" | "revoked";

export interface ContactExchange {
  id: string;
  requester_id: string;
  receiver_id: string;
  requester_contacts: Contacts;
  receiver_contacts: Contacts | null;
  status: ExchangeStatus;
  message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MyContactsResponse {
  contacts: Contacts;
  hasAny: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ========================================
// API
// ========================================

export async function getMyContacts(): Promise<MyContactsResponse> {
  const res = await api.get<ApiResponse<MyContactsResponse>>(
    "/api/contact-exchange/my-contacts",
  );
  return res.data;
}

export async function getExchangeWithPeer(
  peerId: string,
): Promise<ContactExchange | null> {
  const res = await api.get<ApiResponse<{ exchange: ContactExchange | null }>>(
    `/api/contact-exchange/peer/${peerId}`,
  );
  return res.data.exchange;
}

export async function requestExchange(body: {
  receiverId: string;
  contacts: Contacts;
}): Promise<{ exchange: ContactExchange; message: unknown }> {
  const res = await api.post<
    ApiResponse<{ exchange: ContactExchange; message: unknown }>
  >("/api/contact-exchange/request", body);
  return res.data;
}

export async function acceptExchange(
  id: string,
  contacts: Contacts,
): Promise<ContactExchange> {
  const res = await api.post<ApiResponse<{ exchange: ContactExchange }>>(
    `/api/contact-exchange/${id}/accept`,
    { contacts },
  );
  return res.data.exchange;
}

export async function rejectExchange(id: string): Promise<ContactExchange> {
  const res = await api.post<ApiResponse<{ exchange: ContactExchange }>>(
    `/api/contact-exchange/${id}/reject`,
  );
  return res.data.exchange;
}
