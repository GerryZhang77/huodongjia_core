/**
 * 用户端 - 私信会话列表页
 */

import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox, MessageCircle } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import {
  useConversations,
  ConversationListItem,
} from "@/features/social";

const UserConversations: FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useConversations();

  const list = data?.list ?? [];

  return (
    <UserLayout bgColor="bg-white dark:bg-gray-800">
      {/* 标题栏 */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8 max-w-3xl mx-auto">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MessageCircle size={20} />
              私信
            </h1>
            {list.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {list.length} 个会话
              </p>
            )}
          </div>
        </div>
      </header>

      {/* 列表 */}
      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400">加载中...</div>
        ) : list.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-gray-400">
            <Inbox size={48} className="mb-3 opacity-60" />
            <p className="text-sm">暂无会话</p>
            <p className="text-xs mt-1">在用户主页或活动详情页可以发起私信</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {list.map((conv) => (
              <ConversationListItem
                key={conv.id}
                item={conv}
                onClick={(peerId) => navigate(`/u/messages/${peerId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserConversations;
