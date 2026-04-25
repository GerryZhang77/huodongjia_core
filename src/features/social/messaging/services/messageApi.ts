import { api } from "@/services/api/client";

// ========================================
// 类型
// ========================================

export interface ChatPeer {
  id: string;
  name: string | null;
  avatar?: string | null;
  account?: string | null;
  user_type?: string;
}

export type MessageType = "text" | "system" | "contact_request" | "contact_response";
export type MessageStatus = "sent" | "pending" | "accepted" | "rejected" | "revoked";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: MessageType;
  payload?: Record<string, unknown> | null;
  status: MessageStatus;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface ConversationListItem {
  id: string;
  peer: ChatPeer | null;
  lastMessage: Pick<ChatMessage, "id" | "content" | "message_type" | "sender_id" | "created_at"> | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ========================================
// API
// ========================================

export async function listConversations(): Promise<{
  list: ConversationListItem[];
  total: number;
}> {
  const res = await api.get<
    ApiResponse<{ list: ConversationListItem[]; total: number }>
  >("/api/messages/conversations");
  return res.data;
}

export async function createConversation(
  peerId: string,
): Promise<{ id: string; peer: ChatPeer }> {
  const res = await api.post<ApiResponse<{ id: string; peer: ChatPeer }>>(
    "/api/messages/conversations",
    { peerId },
  );
  return res.data;
}

export async function listMessages(
  conversationId: string,
  params?: { before?: string; limit?: number },
): Promise<{ messages: ChatMessage[] }> {
  const res = await api.get<ApiResponse<{ messages: ChatMessage[] }>>(
    `/api/messages/conversations/${conversationId}/messages`,
    { params },
  );
  return res.data;
}

export async function sendMessage(
  conversationId: string,
  body: {
    content: string;
    message_type?: MessageType;
    payload?: Record<string, unknown>;
  },
): Promise<{ message: ChatMessage }> {
  const res = await api.post<ApiResponse<{ message: ChatMessage }>>(
    `/api/messages/conversations/${conversationId}/messages`,
    body,
  );
  return res.data;
}

export async function markConversationRead(
  conversationId: string,
): Promise<void> {
  await api.post<ApiResponse<null>>(
    `/api/messages/conversations/${conversationId}/read`,
  );
}

export async function getUnreadCount(): Promise<number> {
  const res = await api.get<ApiResponse<{ unreadCount: number }>>(
    "/api/messages/unread-count",
  );
  return res.data.unreadCount;
}
