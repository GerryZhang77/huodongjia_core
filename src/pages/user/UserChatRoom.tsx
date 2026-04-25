/**
 * 用户端 - 与某用户的聊天室
 *
 * 路由：/u/messages/:peerId
 *
 * 实现要点：
 * - 进入页面时调用 createConversation(peerId) 获取/创建 conversationId
 * - 之后基于 conversationId 拉消息（轮询）+ 标记已读
 * - 发消息时 invalidate messages 列表立即刷新
 */

import { FC, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import {
  useMessages,
  useSendMessage,
  useMarkConversationRead,
  MessageBubble,
  MessageInput,
  ContactExchangeTrigger,
} from "@/features/social";
import { createConversation } from "@/features/social/messaging/services/messageApi";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { getPublicProfile } from "@/services/userApi";
import { Toast } from "@/components/ui/Toast";

const UserChatRoom: FC = () => {
  const { peerId } = useParams<{ peerId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1) 拉对方资料（顶栏展示）
  const { data: peerData } = useQuery({
    queryKey: ["publicProfile", peerId],
    queryFn: () => getPublicProfile(peerId!),
    enabled: !!peerId,
  });
  const peer = peerData?.profile;

  // 2) 创建/获取会话（用 useQuery 而非 useMutation，避免 React StrictMode 下双调）
  const {
    data: convData,
    isLoading: convLoading,
    error: convError,
  } = useQuery({
    queryKey: ["conversation", "ensure", peerId],
    queryFn: () => createConversation(peerId!),
    enabled: !!peerId && currentUser?.id !== peerId,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
  const conversationId = convData?.id;

  // 3) 拉消息（依赖 conversationId）
  const { data: msgData } = useMessages(conversationId);
  const messages = useMemo(() => msgData?.messages ?? [], [msgData]);

  // 4) 标记已读：当 conversationId 就绪、或新消息到达时
  const markRead = useMarkConversationRead();
  useEffect(() => {
    if (conversationId) {
      markRead.mutate(conversationId);
    }
    // 仅在 conversationId 变化或最新一条消息变化时触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messages.length]);

  // 5) 发消息
  const sendMutation = useSendMessage();
  const handleSend = async (content: string) => {
    if (!conversationId) return;
    try {
      await sendMutation.mutateAsync({ conversationId, content });
    } catch (err) {
      Toast.show({
        icon: "fail",
        content: err instanceof Error ? err.message : "发送失败",
      });
      throw err;
    }
  };

  // 6) 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // 错误：peerId 不合法
  if (!peerId) {
    return (
      <UserLayout showTabBar={false} showTopBar={false}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
          <AlertCircle size={40} className="text-gray-300" />
          <p className="text-gray-500">参数错误</p>
        </div>
      </UserLayout>
    );
  }

  // 错误：与自己聊天
  if (currentUser?.id === peerId) {
    return (
      <UserLayout showTabBar={false} showTopBar={false}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
          <AlertCircle size={40} className="text-gray-300" />
          <p className="text-gray-500">不能与自己发起会话</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg"
          >
            返回
          </button>
        </div>
      </UserLayout>
    );
  }

  const peerName = peer?.name || "对方";

  return (
    <UserLayout showTabBar={false} showTopBar={false} bgColor="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col h-screen">
        {/* 顶栏 */}
        <header className="flex-shrink-0 sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2.5 max-w-3xl mx-auto">
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/u/messages"))}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="返回"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={() => navigate(`/u/profile/${peerId}`)}
              className="flex-1 min-w-0 flex items-center gap-2 hover:opacity-80"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex-shrink-0">
                {peer?.avatar ? (
                  <img src={peer.avatar} alt={peerName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary-500 text-sm font-medium">
                    {peerName.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {peerName}
              </span>
            </button>
            {/* 右侧：交换名片 */}
            <ContactExchangeTrigger peerId={peerId} compact />
          </div>
        </header>

        {/* 消息区 */}
        <div className="flex-1 overflow-y-auto px-3 py-3 max-w-3xl w-full mx-auto">
          {convLoading && (
            <div className="text-center text-xs text-gray-400 py-4">会话加载中...</div>
          )}
          {convError && (
            <div className="text-center text-xs text-red-500 py-4">
              会话创建失败：{convError instanceof Error ? convError.message : "未知错误"}
            </div>
          )}
          {messages.length === 0 && !convLoading && !convError && (
            <div className="text-center text-xs text-gray-400 py-12">
              开始聊天吧
            </div>
          )}
          {messages.map((msg, idx) => {
            const prev = idx > 0 ? messages[idx - 1] : null;
            const showAvatar = !prev || prev.sender_id !== msg.sender_id;
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.sender_id === currentUser?.id}
                peerAvatar={peer?.avatar}
                peerName={peer?.name}
                myAvatar={currentUser?.avatar}
                myName={currentUser?.name}
                showAvatar={showAvatar}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入栏 */}
        <div className="flex-shrink-0 max-w-3xl w-full mx-auto">
          <MessageInput
            disabled={!conversationId || sendMutation.isPending}
            onSend={handleSend}
          />
        </div>
      </div>
    </UserLayout>
  );
};

export default UserChatRoom;
